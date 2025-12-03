const db = require('../config/db');

const LoaiPhong = {
    getAll: async () => {
        const [rows] = await db.execute("SELECT * FROM LoaiPhong");
        return rows;
    },

    getById: async (id) => {
        const [rows] = await db.execute("SELECT * FROM LoaiPhong WHERE MaLoai = ?", [id]);
        return rows[0];
    },

    create: async (data) => {
        const sql = "INSERT INTO LoaiPhong (TenLoai, MoTa, TienNghi, GiaTheoGio, GiaTheoNgay) VALUES (?, ?, ?, ?, ?)";
        const [result] = await db.execute(sql, [data.TenLoai, data.MoTa, data.TienNghi, data.GiaTheoGio, data.GiaTheoNgay]);
        return result;
    },

    update: async (id, data) => {
        const sql = "UPDATE LoaiPhong SET TenLoai=?, MoTa=?, TienNghi=?, GiaTheoGio=?, GiaTheoNgay=? WHERE MaLoai=?";
        const [result] = await db.execute(sql, [data.TenLoai, data.MoTa, data.TienNghi, data.GiaTheoGio, data.GiaTheoNgay, id]);
        return result;
    },

    delete: async (id) => {
        // Lưu ý: Nếu có phòng đang thuộc loại này, SQL có thể báo lỗi ràng buộc khóa ngoại.
        const [result] = await db.execute("DELETE FROM LoaiPhong WHERE MaLoai = ?", [id]);
        return result;
    }
};

module.exports = LoaiPhong;