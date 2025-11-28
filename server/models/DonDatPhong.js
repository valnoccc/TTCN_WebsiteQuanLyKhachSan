const db = require('../config/db');

const DonDatPhong = {
    // 1. Tạo đơn đặt phòng (Transaction: Tạo đơn -> Tạo chi tiết)
    createBooking: async (bookingData) => {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            // Insert DonDatPhong
            const sqlDon = `
                INSERT INTO DonDatPhong (NgayNhanDuKien, NgayTraDuKien, TongTien, TienCoc, MaNguoiDung, TrangThaiDon)
                VALUES (?, ?, ?, ?, ?, 'ChoDuyet')
            `;
            const [resDon] = await connection.execute(sqlDon, [
                bookingData.NgayNhan,
                bookingData.NgayTra,
                bookingData.TongTien,
                bookingData.TienCoc,
                bookingData.MaNguoiDung
            ]);

            const maDonMoi = resDon.insertId;

            // Insert ChiTietDonDat (Lặp qua danh sách phòng)
            for (const item of bookingData.DanhSachPhong) {
                const sqlChiTiet = `INSERT INTO ChiTietDonDat (MaDonDat, MaPhong, GiaLuuTruThucTe) VALUES (?, ?, ?)`;
                await connection.execute(sqlChiTiet, [maDonMoi, item.MaPhong, item.Gia]);
            }

            await connection.commit();
            return maDonMoi;

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    },

    // 2. Lấy danh sách đơn (kèm tên người đặt)
    getAll: async () => {
        const sql = `
            SELECT d.*, n.HoTen as TenKhachHang, n.SDT
            FROM DonDatPhong d
            JOIN NguoiDung n ON d.MaNguoiDung = n.MaNguoiDung
            ORDER BY d.NgayDat DESC
        `;
        const [rows] = await db.execute(sql);
        return rows;
    },

    // 3. Nghiệp vụ Check-in (Cập nhật giờ thực tế)
    checkIn: async (maDon) => {
        const sql = `
            UPDATE DonDatPhong 
            SET ThoiGianCheckInThucTe = NOW(), TrangThaiDon = 'DaCheckIn' 
            WHERE MaDonDat = ?
        `;
        const [result] = await db.execute(sql, [maDon]);
        return result;
    },

    // 4. Nghiệp vụ Check-out
    checkOut: async (maDon) => {
        const sql = `
            UPDATE DonDatPhong 
            SET ThoiGianCheckOutThucTe = NOW(), TrangThaiDon = 'DaCheckOut' 
            WHERE MaDonDat = ?
        `;
        const [result] = await db.execute(sql, [maDon]);
        return result;
    }
};

module.exports = DonDatPhong;