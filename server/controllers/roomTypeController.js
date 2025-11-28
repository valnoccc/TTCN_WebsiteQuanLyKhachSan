const LoaiPhong = require('../models/LoaiPhong');

const roomTypeController = {
    getAll: async (req, res) => {
        try {
            const data = await LoaiPhong.getAll();
            res.json(data);
        }
        catch (error) {
            console.error('Lỗi khi lấy danh sách loại phòng:', error);
            res.status(500).json({ message: 'Lỗi khi lấy danh sách loại phòng' });
        }
    },

    create: async (req, res) => {
        try {
            const LoaiPhong = req.body;
            res.statu(201).json({ message: "Thêm loại phòng thành công" });
        }
        catch (error) {
            res.status(500).json({ message: 'Lỗi khi thêm loại phòng', error });
        }
    },

    update: async (req, res) => {
        try {
            await LoaiPhong.update(req.param.id, req.body);
            res.status(200).json({ message: "Cập nhật thành công" });
        }
        catch (error) {
            res.status(500).json({ message: "Lỗi khi cập nhật", error });
        }
    },

    delete: async (req, res) => {
        try {
            await LoaiPhong.delete(req.param.id)
            res.status(200).json({ message: "Xóa thành công" });
        }
        catch (error) {
            if (error.errno === 1451) {
                return res.status(400).json({ message: "Không thể xóa loại phòng này vì đang có phòng sử dụng!" });
            }
            res.status(500).json({ message: "Lỗi khi xóa", error });
        }
    }
};

module.exports = roomTypeController;