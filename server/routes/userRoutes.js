const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const verifyToken = require('../middleware/authMiddleware');

router.get("/", verifyToken, userController.getAllCustomer);
router.delete('/:id', verifyToken, userController.deleteCustomer);

router.post('/', verifyToken, userController.createCustomer); // Thêm mới
router.put('/:id', verifyToken, userController.updateCustomer); // Cập nhật
module.exports = router;