const LoaiPhong = require('../models/LoaiPhong');

const roomTypeController = {
    getAll: async (req, res) => {
        try {
            const data = await LoaiPhong.getAll();
            res.status(200).json(data);
        } catch (error) {
            res.status(500).json({ message: "Lỗi server" });
        }
    },

    create: async (req, res) => {
        try {
            await LoaiPhong.create(req.body);
            res.status(201).json({ message: "Tạo loại phòng thành công" });
        } catch (error) {
            res.status(500).json({ message: "Lỗi khi tạo", error });
        }
    },

    update: async (req, res) => {
        try {
            await LoaiPhong.update(req.params.id, req.body);
            res.status(200).json({ message: "Cập nhật thành công" });
        } catch (error) {
            res.status(500).json({ message: "Lỗi khi cập nhật", error });
        }
    },

    delete: async (req, res) => {
        try {
            await LoaiPhong.delete(req.params.id);
            res.status(200).json({ message: "Xóa thành công" });
        } catch (error) {
            // Mã lỗi 1451 là lỗi khóa ngoại (Foreign Key Constraint)
            if (error.errno === 1451) {
                return res.status(400).json({ message: "Không thể xóa loại phòng này vì đang có phòng sử dụng!" });
            }
            res.status(500).json({ message: "Lỗi khi xóa", error });
        }
    }
};

module.exports = roomTypeController;