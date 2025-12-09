const DonDatPhong = require('../models/DonDatPhong');
const db = require('../config/db');

exports.getAllBookings = async (req, res) => {
    try {
        const bookings = await DonDatPhong.getAll();
        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error });
    }
};

exports.updateStatus = async (req, res) => {
    const { id } = req.params; // MaDonDat
    const { status } = req.body; // Trạng thái mới: 'DaCoc', 'Huy', ...

    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        // 1. Cập nhật trạng thái Đơn đặt phòng
        // Nếu là Check-in/Check-out thì cập nhật thêm thời gian thực tế
        let updateSql = "UPDATE dondatphong SET TrangThaiDon = ? WHERE MaDonDat = ?";
        let params = [status, id];

        if (status === 'DaCheckIn') {
            updateSql = "UPDATE dondatphong SET TrangThaiDon = ?, ThoiGianCheckInThucTe = NOW() WHERE MaDonDat = ?";
        } else if (status === 'DaCheckOut') {
            updateSql = "UPDATE dondatphong SET TrangThaiDon = ?, ThoiGianCheckOutThucTe = NOW() WHERE MaDonDat = ?";
        }

        await connection.execute(updateSql, params);

        // 2. CẬP NHẬT TRẠNG THÁI PHÒNG (Logic quan trọng)
        // Lấy danh sách phòng thuộc đơn đặt này
        const [rooms] = await connection.execute(
            "SELECT MaPhong FROM chitietdondat WHERE MaDonDat = ?",
            [id]
        );

        if (rooms.length > 0) {
            const roomIds = rooms.map(r => r.MaPhong);

            let newRoomStatus = null;

            // --- LOGIC CHUYỂN TRẠNG THÁI PHÒNG ---
            switch (status) {
                case 'DaCoc':     // Đã cọc -> Giữ phòng
                case 'DaCheckIn': // Đang ở -> Phòng đang bận
                    newRoomStatus = 'DangO';
                    break;
                case 'DaCheckOut': // Trả phòng -> Phòng trống (hoặc Dọn dẹp tùy quy trình)
                case 'Huy':        // Hủy đơn -> Trả lại phòng trống
                    newRoomStatus = 'Trong';
                    break;
                default:
                    // Các trạng thái khác (ChoDuyet...) giữ nguyên hoặc không đổi
                    newRoomStatus = null;
            }

            // Thực hiện update nếu có trạng thái mới
            if (newRoomStatus) {
                const placeholders = roomIds.map(() => '?').join(',');

                await connection.execute(
                    `UPDATE phong SET TrangThai = ? WHERE MaPhong IN (${placeholders})`,
                    [newRoomStatus, ...roomIds]
                );
            }
        }

        await connection.commit();
        res.status(200).json({ message: "Cập nhật trạng thái đơn và phòng thành công!" });

    } catch (error) {
        await connection.rollback();
        console.error("Lỗi cập nhật:", error);
        res.status(500).json({ message: "Lỗi server khi cập nhật trạng thái" });
    } finally {
        connection.release();
    }
};

exports.createBookingByAdmin = async (req, res) => {
    // try {
    //     // Lấy dữ liệu từ request body
    //     const {
    //         MaNguoiDung,
    //         NgayNhanDuKien,
    //         NgayTraDuKien,
    //         TongTien,
    //         TienCoc,
    //         DanhSachPhong
    //     } = req.body;

    //     // Validate dữ liệu cơ bản
    //     if (!MaNguoiDung || !NgayNhanDuKien || !NgayTraDuKien || !DanhSachPhong || DanhSachPhong.length === 0) {
    //         return res.status(400).json({ message: "Thiếu thông tin bắt buộc!" });
    //     }

    //     // Tạo object bookingData để gọi Model
    //     const bookingData = {
    //         MaNguoiDung,
    //         NgayNhan: new Date(NgayNhanDuKien).toISOString().split('T')[0], // YYYY-MM-DD
    //         NgayTra: new Date(NgayTraDuKien).toISOString().split('T')[0],
    //         TongTien,
    //         TienCoc: TienCoc || 0,
    //         DanhSachPhong
    //     };

    //     const newBookingId = await DonDatPhong.createBooking(bookingData);

    //     res.status(201).json({ message: "Tạo đơn đặt phòng thành công!", bookingId: newBookingId });

    // } catch (error) {
    //     console.error("Lỗi tạo đơn:", error);
    //     res.status(500).json({ message: "Lỗi server khi tạo đơn", error });
    // }
};

exports.createBooking = async (req, res) => {
    // 1. Lấy dữ liệu từ Frontend
    const {
        MaPhong,
        MaNguoiDung, // Bắt buộc phải có
        NgayNhanDuKien,
        NgayTraDuKien,
        PhuongThucThanhToan,
        //GhiChu // (Tùy chọn: Nếu bạn muốn lưu ghi chú của khách)
    } = req.body;

    // 2. Validate dữ liệu
    // Lưu ý: Bây giờ MaNguoiDung là BẮT BUỘC
    if (!MaPhong || !MaNguoiDung || !NgayNhanDuKien || !NgayTraDuKien) {
        return res.status(400).json({ message: "Thiếu thông tin bắt buộc (Mã phòng, Người dùng, Ngày đặt)!" });
    }

    const checkIn = new Date(NgayNhanDuKien);
    const checkOut = new Date(NgayTraDuKien);

    if (checkIn >= checkOut) {
        return res.status(400).json({ message: "Ngày trả phòng phải sau ngày nhận!" });
    }

    const connection = await db.getConnection();

    try {
        await connection.beginTransaction(); // --- BẮT ĐẦU GIAO DỊCH ---

        // BƯỚC 1: KIỂM TRA PHÒNG TRỐNG
        const [conflict] = await connection.execute(`
            SELECT d.MaDonDat 
            FROM chitietdondat ct
            JOIN dondatphong d ON ct.MaDonDat = d.MaDonDat
            WHERE ct.MaPhong = ?
            AND d.TrangThaiDon NOT IN ('Huy', 'DaCheckOut')
            AND (
                (d.NgayNhanDuKien < ? AND d.NgayTraDuKien > ?)
            )
            LIMIT 1
        `, [MaPhong, checkOut, checkIn]);

        if (conflict.length > 0) {
            throw new Error("Phòng đã có người đặt trong thời gian này!");
        }

        // BƯỚC 2: LẤY GIÁ PHÒNG & TÍNH TIỀN
        const [roomInfo] = await connection.execute(`
            SELECT lp.GiaTheoNgay 
            FROM phong p
            JOIN loaiphong lp ON p.MaLoai = lp.MaLoai
            WHERE p.MaPhong = ?
        `, [MaPhong]);

        if (roomInfo.length === 0) {
            throw new Error("Phòng không tồn tại hoặc chưa cấu hình loại phòng!");
        }

        // Lấy giá từ cột GiaTheoNgay
        const giaPhong = parseFloat(roomInfo[0].GiaTheoNgay);
        const soDem = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24)) || 1;
        const tongTien = giaPhong * soDem;

        const tienCoc = PhuongThucThanhToan === 'ChuyenKhoan' ? tongTien : 0;

        // BƯỚC 3: TẠO ĐƠN ĐẶT PHÒNG (Chỉ lưu MaNguoiDung)
        const [result] = await connection.execute(`
            INSERT INTO dondatphong 
            (MaNguoiDung, NgayDat, NgayNhanDuKien, NgayTraDuKien, TongTien, TienCoc, TrangThaiDon)
            VALUES (?, NOW(), ?, ?, ?, ?, 'ChoDuyet')
        `, [MaNguoiDung, checkIn, checkOut, tongTien, tienCoc]);

        const newBookingId = result.insertId;

        // BƯỚC 4: LƯU CHI TIẾT ĐƠN ĐẶT
        await connection.execute(`
            INSERT INTO chitietdondat (MaDonDat, MaPhong, GiaLuuTruThucTe)
            VALUES (?, ?, ?)
        `, [newBookingId, MaPhong, giaPhong]);

        await connection.commit(); // --- LƯU THÀNH CÔNG ---

        res.status(201).json({
            success: true,
            message: "Đặt phòng thành công!",
            data: { MaDonDat: newBookingId, TongTien: tongTien }
        });

    } catch (err) {
        await connection.rollback();
        console.error("Lỗi đặt phòng:", err);
        res.status(500).json({ message: err.message || "Lỗi server" });
    } finally {
        if (connection) connection.release();
    }
};

exports.deleteBooking = async (req, res) => {
    const { id } = req.params; // Lấy MaDonDat
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction(); // Bắt đầu giao dịch

        // 1. Xóa dữ liệu trong bảng con 'chitietdondat' trước
        await connection.execute("DELETE FROM chitietdondat WHERE MaDonDat = ?", [id]);

        // 2. Xóa dữ liệu trong bảng 'hoadon'
        await connection.execute("DELETE FROM hoadon WHERE MaDonDat = ?", [id]);

        // 3. Cuối cùng mới xóa bảng cha 'dondatphong'
        const [result] = await connection.execute("DELETE FROM dondatphong WHERE MaDonDat = ?", [id]);

        if (result.affectedRows === 0) {
            await connection.rollback();
            return res.status(404).json({ message: "Không tìm thấy đơn đặt phòng để xóa." });
        }

        await connection.commit(); // Lưu thay đổi
        res.status(200).json({ message: "Đã xóa vĩnh viễn đơn đặt phòng!" });

    } catch (error) {
        await connection.rollback(); // Hoàn tác nếu lỗi
        console.error("Lỗi xóa đơn:", error);
        res.status(500).json({ message: "Lỗi server khi xóa đơn", error });
    } finally {
        connection.release();
    }
};

exports.getBookingById = async (req, res) => {
    const { id } = req.params;

    try {
        const [rows] = await db.execute(`
            SELECT d.*, t.HoTen, t.Email, t.SDT 
            FROM dondatphong d
            LEFT JOIN nguoidung t ON d.MaNguoiDung = t.MaNguoiDung
            WHERE d.MaDonDat = ?
        `, [id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: "Không tìm thấy đơn đặt phòng" });
        }

        const bookingInfo = rows[0];

        // --- KIỂM TRA ĐÃ CÓ HÓA ĐƠN CHƯA ---
        const [invoices] = await db.execute(
            "SELECT MaHD FROM hoadon WHERE MaDonDat = ?",
            [id]
        );
        // Thêm cờ HasInvoice vào object trả về
        bookingInfo.HasInvoice = invoices.length > 0;

        const [rooms] = await db.execute(`
            SELECT 
                ct.*, 
                p.TenPhong, 
                lp.TenLoai,
                lp.GiaTheoNgay
            FROM chitietdondat ct
            JOIN phong p ON ct.MaPhong = p.MaPhong
            JOIN loaiphong lp ON p.MaLoai = lp.MaLoai
            WHERE ct.MaDonDat = ?
        `, [id]);

        bookingInfo.ChiTiet = rooms;

        res.status(200).json(bookingInfo);

    } catch (error) {
        // ... (xử lý lỗi giữ nguyên) ...
        res.status(500).json({
            message: "Lỗi server khi lấy chi tiết",
            errorDetail: error.message
        });
    }
};

exports.checkout = async (req, res) => {
    // 1. Nhận dữ liệu từ Frontend
    const {
        MaDonDat, PhuThu, GhiChuPhuThu,
        TongTienThanhToan, HinhThucThanhToan,
        // Các thông tin Snapshot
        TenKhachHang, Email, SDT,
        NgayNhanPhong, NgayTraPhong,
        TienPhong, ChiTietPhongJSON
    } = req.body;

    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        // 2. Cập nhật Đơn đặt phòng (Hoàn thành đơn)
        await connection.execute(`
            UPDATE dondatphong 
            SET TrangThaiDon = 'DaCheckOut', 
                PhuThu = ?, 
                GhiChuPhuThu = ?,
                ThoiGianCheckOutThucTe = NOW()
            WHERE MaDonDat = ?
        `, [PhuThu || 0, GhiChuPhuThu || '', MaDonDat]);

        // 3. TẠO HÓA ĐƠN (Sửa tên cột cho khớp với ảnh DB)
        // Cột trong DB: TongTienThanhToan, HinhThucThanhToan
        await connection.execute(`
            INSERT INTO hoadon (
                MaDonDat, NgayLap, TongTienThanhToan, HinhThucThanhToan,
                TenKhachHang, Email, SDT, NgayNhanPhong, NgayTraPhong,
                TienPhong, PhuThu, ChiTietPhong
            )
            VALUES (?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            MaDonDat,
            TongTienThanhToan,
            HinhThucThanhToan,
            TenKhachHang,
            Email,
            SDT,
            NgayNhanPhong,
            NgayTraPhong,
            TienPhong,
            PhuThu,
            ChiTietPhongJSON
        ]);

        await connection.commit();
        res.status(200).json({ message: "Xuất hóa đơn thành công!" });

    } catch (error) {
        await connection.rollback();
        console.error("Lỗi checkout:", error);
        res.status(500).json({ message: "Lỗi server khi lưu hóa đơn" });
    } finally {
        connection.release();
    }
};

exports.getAllInvoices = async (req, res) => {
    try {
        const [invoices] = await db.execute(`
            SELECT * FROM hoadon ORDER BY NgayLap DESC
        `);

        res.status(200).json(invoices);
    } catch (error) {
        console.error("Lỗi lấy danh sách hóa đơn:", error);
        res.status(500).json({ message: "Lỗi server" });
    }
};

exports.getInvoiceById = async (req, res) => {
    const { id } = req.params; // Đây là MaHD

    try {
        const [rows] = await db.execute("SELECT * FROM hoadon WHERE MaHD = ?", [id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: "Hóa đơn không tồn tại" });
        }

        const invoice = rows[0];

        // Parse chuỗi JSON chi tiết phòng thành Object để Frontend dùng
        try {
            if (invoice.ChiTietPhong && typeof invoice.ChiTietPhong === 'string') {
                invoice.ChiTietPhong = JSON.parse(invoice.ChiTietPhong);
            }
        } catch (e) {
            console.error("Lỗi parse JSON chi tiết phòng:", e);
            invoice.ChiTietPhong = [];
        }

        res.status(200).json(invoice);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi server khi lấy hóa đơn" });
    }
};