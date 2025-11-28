const db = require('../config/db');

const HoaDon = {
    create: async (data) => {
        const sql = `
            INSERT INTO HoaDon (TongTienThanhToan, HinhThucThanhToan, MaNhanVien, MaDonDat)
            VALUES (?, ?, ?, ?)
        `;
        const [result] = await db.execute(sql, [
            data.TongTien,
            data.HinhThuc,
            data.MaNhanVien,
            data.MaDonDat
        ]);
        return result;
    },

    getByBookingId: async (maDonDat) => {
        const sql = "SELECT * FROM HoaDon WHERE MaDonDat = ?";
        const [rows] = await db.execute(sql, [maDonDat]);
        return rows[0];
    }
};

module.exports = HoaDon;