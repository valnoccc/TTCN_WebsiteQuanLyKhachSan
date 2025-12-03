const NguoiDung = require("../models/NguoiDung");
const bcrypt = require('bcrypt');

exports.getAllCustomer = async (req, res) => {
    try {
        const users = await NguoiDung.getAll();
        res.status(200).json(users);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Lỗi server", error });
    }
};

exports.deleteCustomer = async (req, res) => {
    try {
        await NguoiDung.delete(req.params.id);
        res.status(200).json({ message: "Xóa thành công" });
    } catch (error) {
        if (error.errno === 1451) {
            return res.status(400).json({ message: "Không thể xóa do có ràng buộc" });
        }
        res.status(500).json({ message: "Lỗi khi xóa", error });
    }
};

exports.createCustomer = async (req, res) => {
    try {
        const { TenDangNhap, HoTen, Email, SDT } = req.body;

        // Check trùng username
        const existingUser = await NguoiDung.findByUsername(TenDangNhap);
        if (existingUser) return res.status(400).json({ message: "Tên đăng nhập đã tồn tại!" });

        const hashedPassword = await bcrypt.hash(SDT, 10);

        await NguoiDung.create({
            username: TenDangNhap,
            password: hashedPassword, // Lưu mật khẩu mặc định đã mã hóa
            fullname: HoTen,
            email: Email,
            phone: SDT,
            role: 'KhachHang'
        });

        res.status(201).json({ message: "Thêm khách hàng thành công!" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error });
    }
};

exports.updateCustomer = async (req, res) => {
    try {
        const id = req.params.id;
        // Lấy thêm DiaChi và VaiTro từ req.body
        const { HoTen, Email, SDT, DiaChi, VaiTro } = req.body;

        // Gọi Model
        await NguoiDung.update(id, { HoTen, Email, SDT, DiaChi, VaiTro });

        res.status(200).json({ message: "Cập nhật thành công!" });
    } catch (error) {
        console.error("Lỗi cập nhật:", error);
        res.status(500).json({ message: "Lỗi server", error });
    }
};