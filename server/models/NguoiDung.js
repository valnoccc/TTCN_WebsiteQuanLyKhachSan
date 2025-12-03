const db = require('../config/db');

const NguoiDung = {
    create: async (user) => {
        const sql = `INSERT INTO NguoiDung (TenDangNhap, MatKhau, HoTen, Email, SDT, VaiTro) VALUES (?, ?, ?, ?, ?, ?)`;
        const [result] = await db.execute(sql, [user.username, user.password, user.fullname, user.email, user.phone, user.role || 'KhachHang']);
        return result;
    },

    findByUsername: async (username) => {
        const sql = "SELECT * FROM NguoiDung WHERE TenDangNhap = ?";
        const [rows] = await db.execute(sql, [username]);
        return rows[0];
    },

    findById: async (id) => {
        const sql = "SELECT MaNguoiDung, TenDangNhap, HoTen, Email, SDT, VaiTro, DiaChi, NgayTao FROM NguoiDung WHERE MaNguoiDung = ?";
        const [rows] = await db.execute(sql, [id]);
        return rows[0];
    },

    getAll: async () => {
        const sql = "SELECT MaNguoiDung, TenDangNhap, HoTen, Email, SDT, VaiTro, DiaChi, NgayTao FROM NguoiDung ORDER BY MaNguoiDung DESC";

        const [rows] = await db.execute(sql);
        return rows;
    },

    updatePassword: async (id, newPasswordHash) => {
        const sql = "UPDATE NguoiDung SET MatKhau = ? WHERE MaNguoiDung = ?";
        const [result] = await db.execute(sql, [newPasswordHash, id]);
        return result;
    },

    delete: async (id) => {
        const sql = "DELETE FROM NguoiDung WHERE MaNguoiDung = ?";
        const [result] = await db.execute(sql, [id]);
        return result;
    },

    // Hàm cập nhật thông tin (Admin sửa)
    update: async (id, data) => {
        const sql = "UPDATE NguoiDung SET HoTen = ?, Email = ?, SDT = ?, DiaChi = ?, VaiTro = ? WHERE MaNguoiDung = ?";
        const [result] = await db.execute(sql, [
            data.HoTen,
            data.Email,
            data.SDT,
            data.DiaChi, // Thêm Địa chỉ
            data.VaiTro, // Thêm Vai trò
            id
        ]);
        return result;
    },
};

module.exports = NguoiDung;