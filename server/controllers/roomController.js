const Phong = require('../models/Phong')

exports.getAllRooms = async (req, res) => {
    try {
        // Lấy page và limit từ query string (mặc định là 1 và 6)
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 6;

        const result = await Phong.getAll(page, limit);

        // Trả về cấu trúc chuẩn cho phân trang
        res.status(200).json({
            data: result.data,
            pagination: {
                page: page,
                limit: limit,
                totalRows: result.total,
                totalPages: Math.ceil(result.total / limit)
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi server" });
    }
};

exports.getRoomDetail = async (req, res) => {
    try {
        const { id } = req.params;
        const room = await Phong.getById(id);

        if (!room) {
            return res.status(404).json({ message: "Không tìm thấy phòng" });
        }

        res.status(200).json(room);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi server" });
    }
};

exports.getRelatedRooms = async (req, res) => {
    try {
        const { id } = req.params; // ID phòng đang xem
        const rooms = await Phong.getRelated(id);
        res.status(200).json(rooms);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi server" });
    }
};

exports.createRoom = async (req, res) => {
    try {
        await Phong.create(req.body);
        res.status(201).json({ message: "Thêm phòng thành công!" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error });
    }
};

exports.updateRoom = async (req, res) => {
    try {
        await Phong.update(req.params.id, req.body);
        res.status(200).json({ message: "Cập nhật thành công!" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error });
    }
};

exports.deleteRoom = async (req, res) => {
    try {
        await Phong.delete(req.params.id);
        res.status(200).json({ message: "Xóa phòng thành công!" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error });
    }
};