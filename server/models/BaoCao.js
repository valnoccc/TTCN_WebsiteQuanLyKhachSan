const db = require('../config/db');

const BaoCao = {
    // Tính tổng doanh thu theo tháng chỉ bằng 1 câu lệnh SQL
    getMonthlyRevenue: async (thang, nam) => {
        const sql = `
            SELECT 
                COUNT(MaHD) as TongSoDon,
                SUM(TongTienThanhToan) as DoanhThu
            FROM HoaDon
            WHERE MONTH(NgayLap) = ? AND YEAR(NgayLap) = ?
        `;
        const [rows] = await db.execute(sql, [thang, nam]);
        return rows[0];
    },

    // Lưu báo cáo vào bảng
    saveReport: async (data) => {
        const sql = `
            INSERT INTO BaoCao (Thang, Nam, TongDoanhThu, TongSoDonDat, TongLuotKhach)
            VALUES (?, ?, ?, ?, ?)
        `;
        const [result] = await db.execute(sql, [
            data.Thang, data.Nam, data.DoanhThu, data.SoDon, data.SoKhach
        ]);
        return result;
    }
};

module.exports = BaoCao;