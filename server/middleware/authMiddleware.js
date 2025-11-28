const jwt = require('jsonwebtoken');
const JWT_SECRET = 'day-la-mat-khau-bi-mat-cua-server'; // Nhớ đồng bộ với file authController

const verifyToken = (req, res, next) => {
    // 1. Lấy token từ header: "Bearer eyJhbG..."
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ message: "Bạn chưa đăng nhập!" });

    // 2. Kiểm tra token
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: "Token không hợp lệ hoặc hết hạn!" });

        // 3. Lưu thông tin user vào request để dùng ở Controller
        req.user = user;
        next();
    });
};

module.exports = verifyToken;