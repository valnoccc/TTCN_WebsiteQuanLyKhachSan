const NguoiDung = require('../models/NguoiDung');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

// Key bí mật để tạo Token (Nên để trong file .env, ở đây viết cứng để test cho dễ)
const JWT_SECRET = 'day-la-mat-khau-bi-mat-cua-server';

exports.register = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.array()[0].msg });
        }
        const { username, password, fullname, email, phone } = req.body;

        // 1. Kiểm tra xem username đã tồn tại chưa
        const existingUser = await NguoiDung.findByUsername(username);
        if (existingUser) {
            return res.status(400).json({ message: "Tên đăng nhập đã tồn tại!" });
        }

        // 2. Mã hóa mật khẩu (Băm 10 vòng)
        const hashedPassword = await bcrypt.hash(password, 10);

        // 3. Gọi Model để tạo user mới
        const newUser = {
            username,
            password: hashedPassword, // Lưu mật khẩu đã mã hóa
            fullname,
            email,
            phone,
            role: 'KhachHang' // Mặc định là Khách
        };

        await NguoiDung.create(newUser);

        res.status(201).json({ message: "Đăng ký thành công!" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi Server", error });
    }
};

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // 1. Tìm user trong DB
        const user = await NguoiDung.findByUsername(username);
        if (!user) {
            return res.status(404).json({ message: "Tên đăng nhập không tồn tại!" });
        }

        // 2. So sánh mật khẩu nhập vào với mật khẩu đã mã hóa trong DB
        const isMatch = await bcrypt.compare(password, user.MatKhau);
        if (!isMatch) {
            return res.status(400).json({ message: "Mật khẩu không đúng!" });
        }

        // 3. Tạo Token (Thẻ bài) chứa thông tin user
        // Token này sẽ hết hạn sau 1 ngày (1d)
        const token = jwt.sign(
            { id: user.MaNguoiDung, role: user.VaiTro },
            JWT_SECRET,
            { expiresIn: '1d' }
        );

        // 4. Trả về kết quả cho Frontend (gồm Token và info cơ bản)
        res.status(200).json({
            message: "Đăng nhập thành công!",
            token: token,
            user: {
                id: user.MaNguoiDung,
                username: user.TenDangNhap,
                fullname: user.HoTen,
                email: user.Email,
                phone: user.SDT,
                role: user.VaiTro
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi Server", error });
    }
};

exports.updatePassword = async (req, res) => {
    try {
        // Input từ Frontend gửi lên (chú ý tên biến phải khớp với Frontend)
        const { currentPassword, newPassword } = req.body;

        // Lấy userId từ Token (do Middleware verifyToken giải mã ra)
        const userId = req.user.id;

        // 1. Kiểm tra User có tồn tại không
        const userdb = await NguoiDung.findById(userId);
        if (!userdb) {
            return res.status(404).json({ message: "Người dùng không tồn tại" });
        }

        // 2. Lấy mật khẩu cũ trong DB để so sánh
        // (Vì hàm findById có thể không trả về cột MatKhau, nên query lại cho chắc)
        const query = "SELECT MatKhau FROM NguoiDung WHERE MaNguoiDung = ?";

        const [rows] = await require('../config/db').execute(query, [userId]);

        if (rows.length === 0) {
            return res.status(404).json({ message: "Lỗi tìm dữ liệu người dùng" });
        }

        const isMatch = await bcrypt.compare(currentPassword, rows[0].MatKhau);

        if (!isMatch) {
            return res.status(400).json({ message: "Mật khẩu hiện tại không đúng" });
        }

        // 3. Mã hóa mật khẩu mới
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // 4. Cập nhật vào DB
        await NguoiDung.updatePassword(userId, hashedPassword);

        res.status(200).json({ message: "Cập nhật mật khẩu mới thành công" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi Server", error });
    }
};