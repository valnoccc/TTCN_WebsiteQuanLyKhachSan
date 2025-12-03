const db = require('../config/db');

const HinhAnhPhong = {
    getByRoomId: async (maPhong) => {
        const [rows] = await db.execute("SELECT * FROM HinhAnhPhong WHERE MaPhong = ?", [maPhong]);
        return rows;
    },

    create: async (url, maPhong, isMain = false) => {
        const sql = "INSERT INTO HinhAnhPhong (Url, LaAnhDaiDien, MaPhong) VALUES (?, ?, ?)";
        const [result] = await db.execute(sql, [url, isMain, maPhong]);
        return result;
    },

    delete: async (id) => {
        const [result] = await db.execute("DELETE FROM HinhAnhPhong WHERE MaHinhAnh = ?", [id]);
        return result;
    }
};

module.exports = HinhAnhPhong;