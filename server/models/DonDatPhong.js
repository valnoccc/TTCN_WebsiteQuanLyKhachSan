const db = require('../config/db');

const DonDatPhong = {
    createBooking: async (bookingData) => {
        const connection = await db.getConnection();

        try {
            await connection.beginTransaction();

            const { MaNguoiDung, NgayNhan, NgayTra, TongTien, TienCoc, DanhSachPhong } = bookingData;

            //console.log("DỮ LIỆU INSERT DonDatPhong:", { MaNguoiDung, NgayNhan, NgayTra, TongTien, TienCoc });

            const [result] = await connection.execute(
                `INSERT INTO DonDatPhong 
            (MaNguoiDung, NgayNhan, NgayTra, TongTien, TienCoc, TrangThaiDon, NgayDat) 
            VALUES (?, ?, ?, ?, ?, 'ChoDuyet', NOW())`,
                [MaNguoiDung, NgayNhan, NgayTra, TongTien, TienCoc]
            );

            const newBookingId = result.insertId;

            if (DanhSachPhong && DanhSachPhong.length > 0) {
                const values = DanhSachPhong.map(p => [newBookingId, p.MaPhong, p.Gia]);

                const sql = `
                INSERT INTO ChiTietDonDat (MaDonDat, MaPhong, GiaPhongTaiThoiDiemDat)
                VALUES ${values.map(() => "(?, ?, ?)").join(",")}
            `;

                await connection.query(sql, values.flat());
            }

            await connection.commit();
            return newBookingId;

        } catch (error) {
            console.error("Error createBooking:", error);
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    },

    // 2. Lấy tất cả đơn đặt (Kèm tên khách hàng và danh sách phòng)
    getAll: async () => {
        const sql = `
            SELECT 
                d.*, 
                n.HoTen as TenKhachHang, 
                n.SDT, 
                n.Email,
                -- Lấy danh sách tên phòng gộp lại thành 1 chuỗi (Ví dụ: "P101, P102")
                (
                    SELECT GROUP_CONCAT(p.TenPhong SEPARATOR ', ')
                    FROM ChiTietDonDat ct
                    JOIN Phong p ON ct.MaPhong = p.MaPhong
                    WHERE ct.MaDonDat = d.MaDonDat
                ) as DanhSachPhong
            FROM DonDatPhong d
            JOIN NguoiDung n ON d.MaNguoiDung = n.MaNguoiDung
            ORDER BY d.NgayDat DESC
        `;
        const [rows] = await db.execute(sql);
        return rows;
    },

    // 3. Cập nhật trạng thái đơn thông thường (Duyệt, Cọc, Hủy)
    updateStatus: async (id, status) => {
        const sql = "UPDATE DonDatPhong SET TrangThaiDon = ? WHERE MaDonDat = ?";
        const [result] = await db.execute(sql, [status, id]);
        return result;
    },

    // 4. Check-in (Cập nhật trạng thái + giờ thực tế)
    checkIn: async (id) => {
        const sql = `
            UPDATE DonDatPhong 
            SET TrangThaiDon = 'DaCheckIn', ThoiGianCheckInThucTe = NOW() 
            WHERE MaDonDat = ?
        `;
        const [result] = await db.execute(sql, [id]);
        return result;
    },

    // 5. Check-out (Cập nhật trạng thái + giờ thực tế)
    checkOut: async (id) => {
        const sql = `
            UPDATE DonDatPhong 
            SET TrangThaiDon = 'DaCheckOut', ThoiGianCheckOutThucTe = NOW() 
            WHERE MaDonDat = ?
        `;
        const [result] = await db.execute(sql, [id]);
        return result;
    }
};

module.exports = DonDatPhong;