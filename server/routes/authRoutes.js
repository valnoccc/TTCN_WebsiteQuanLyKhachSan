const express = require('express');
const router = express.Router();
// --- Đường dẫn trỏ đến Controller ---
const authController = require('../controllers/authController');
const verifyToken = require('../middleware/authMiddleware');
const { body } = require('express-validator');

const validateRegister = [
    body('username')
        .notEmpty().withMessage('Tên đăng nhập không được để trống')
        .isLength({ min: 3 }).withMessage('Tên đăng nhập phải từ 3 ký tự'),

    body('password')
        .isLength({ min: 6 }).withMessage('Mật khẩu phải có ít nhất 6 ký tự'),

    body('email')
        .isEmail().withMessage('Email không hợp lệ'),

    body('fullname')
        .notEmpty().withMessage('Họ tên không được để trống'),

    body('phone')
        .isMobilePhone().withMessage('Số điện thoại không hợp lệ')
        .isLength({ min: 10, max: 11 }).withMessage('SĐT phải 10-11 số')
];

router.post('/register', validateRegister, authController.register);
router.post('/login', authController.login);
router.post('/change-password', verifyToken, authController.updatePassword);

module.exports = router;