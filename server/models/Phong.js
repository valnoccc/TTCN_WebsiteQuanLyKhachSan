const db = require('../config/db');

const Phong = {
    getAll: async (page = 1, limit = 6) => {
        const offset = (page - 1) * limit;

        // 1. Lấy danh sách phòng phân trang
        const sqlData = `
            SELECT 
                p.MaPhong, p.TenPhong, p.TrangThai, p.SucChua, p.DienTich,
                l.TenLoai, l.GiaTheoNgay, l.GiaTheoGio,
                (SELECT Url FROM HinhAnhPhong h WHERE h.MaPhong = p.MaPhong LIMIT 1) as HinhAnh
            FROM Phong p
            JOIN LoaiPhong l ON p.MaLoai = l.MaLoai
            LIMIT ? OFFSET ?
        `;

        // 2. Đếm tổng số phòng (để tính tổng số trang)
        const sqlCount = "SELECT COUNT(*) as total FROM Phong";

        // Thực thi 2 câu lệnh song song
        const [rows] = await db.execute(sqlData, [limit.toString(), offset.toString()]); // MySQL2 đôi khi cần string cho limit
        const [countResult] = await db.execute(sqlCount);

        return {
            data: rows,
            total: countResult[0].total
        };
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

    // Tạo phòng mới
    create: async (data) => {
        const sql = "INSERT INTO Phong (TenPhong, MaLoai, SucChua, DienTich, MoTa, TrangThai) VALUES (?, ?, ?, ?, ?, ?)";
        const [result] = await db.execute(sql, [
            data.TenPhong,
            data.MaLoai,
            data.SucChua,
            data.DienTich,
            data.MoTa,
            'Trong' // Mặc định là Trống
        ]);
        return result;
    },

    // Cập nhật thông tin phòng
    update: async (id, data) => {
        const sql = "UPDATE Phong SET TenPhong=?, MaLoai=?, SucChua=?, DienTich=?, MoTa=?, TrangThai=? WHERE MaPhong=?";
        const [result] = await db.execute(sql, [
            data.TenPhong,
            data.MaLoai,
            data.SucChua,
            data.DienTich,
            data.MoTa,
            data.TrangThai,
            id
        ]);
        return result;
    },

    // Xóa phòng
    delete: async (id) => {
        const sql = "DELETE FROM Phong WHERE MaPhong=?";
        const [result] = await db.execute(sql, [id]);
        return result;
    }
};

module.exports = Phong;