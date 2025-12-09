const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const verifyToken = require('../middleware/authMiddleware');

router.post('/create', bookingController.createBooking);
// Route cho Admin quản lý đơn (YÊU CẦU đăng nhập)
router.get('/', verifyToken, bookingController.getAllBookings);
router.put('/:id/status', verifyToken, bookingController.updateStatus);
router.post('/admin/create', verifyToken, bookingController.createBookingByAdmin);
router.delete('/delete/:id', verifyToken, bookingController.deleteBooking);
router.post('/checkout', verifyToken, bookingController.checkout);
router.get('/:id', verifyToken, bookingController.getBookingById);
router.get('/invoices/all', verifyToken, bookingController.getAllInvoices);
router.get('/invoices/detail/:id', verifyToken, bookingController.getInvoiceById);

module.exports = router;