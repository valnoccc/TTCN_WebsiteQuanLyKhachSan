const Phong = require('../models/Phong')

exports.getAllRooms = async (req, res) => {
    try {
        const rooms = await Phong.getAll()
        res.status(200).json(rooms);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
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