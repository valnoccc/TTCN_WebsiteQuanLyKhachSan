const db = require('../config/db');

const Phong = {
    getAll: async () => {
        const sql = `
           SELECT 
                p.MaPhong, p.TenPhong, p.TrangThai, p.SucChua, p.DienTich,
                l.TenLoai, l.GiaTheoNgay, l.GiaTheoGio,
                (SELECT Url FROM HinhAnhPhong h WHERE h.MaPhong = p.MaPhong LIMIT 1) as HinhAnh
            FROM Phong p
            JOIN LoaiPhong l ON p.MaLoai = l.MaLoai
        `;
        const [rows] = await db.execute(sql);
        return rows;
    },

    getById: async (id) => {
        // 1. Lấy thông tin cơ bản
        const sqlPhong = `
           SELECT 
                p.*, 
                l.TenLoai, l.GiaTheoNgay, l.GiaTheoGio, l.TienNghi,
                l.MoTa as MoTaLoai 
            FROM Phong p
            JOIN LoaiPhong l ON p.MaLoai = l.MaLoai
            WHERE p.MaPhong = ?
        `;

        // 2. Lấy danh sách ảnh
        const sqlAnh = "SELECT Url FROM HinhAnhPhong WHERE MaPhong = ?";

        const [phong] = await db.execute(sqlPhong, [id]);
        const [anh] = await db.execute(sqlAnh, [id]);

        if (phong.length === 0) return null;

        // Gộp ảnh vào object phòng
        return {
            ...phong[0],
            DanhSachAnh: anh.map(a => a.Url)
        };
    },

    getRelated: async (currentId) => {
        const sql = `
            SELECT 
                p.MaPhong, p.TenPhong, p.SucChua, p.DienTich,
                l.TenLoai, l.GiaTheoNgay,
                (SELECT Url FROM HinhAnhPhong h WHERE h.MaPhong = p.MaPhong LIMIT 1) as HinhAnh
            FROM Phong p
            JOIN LoaiPhong l ON p.MaLoai = l.MaLoai
            WHERE p.MaPhong != ? 
            ORDER BY RAND() 
            LIMIT 3
        `;
        const [rows] = await db.execute(sql, [currentId]);
        return rows;
    },

    create: async (data) => {
        const sql = "INSERT INTO Phong (TenPhong, TrangThai, SucChua, DienTich, MaLoai) VALUES (?, ?, ?, ?, ?)";
        const [result] = await db.execute(sql, [data.TenPhong, data.TrangThai || 'Trong', data.SucChua, data.DienTich, data.MaLoai]);
        return result;
    },

    updateStatus: async (id, status) => {
        // status: 'Trong', 'DangO', 'DonDep', 'SuaChua'
        const [result] = await db.execute("UPDATE Phong SET TrangThai = ? WHERE MaPhong = ?", [status, id]);
        return result;
    }
};

module.exports = Phong;