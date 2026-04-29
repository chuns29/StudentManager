// File: routes/auth.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');
const isAuth = require('../middleware/is-auth');   // Import middleware
const isAdmin = require('../middleware/is-admin'); // Import middleware

// Route Đăng nhập vẫn công khai
router.get('/login', authController.getLogin);
router.post('/login', authController.postLogin);

// BẢO VỆ CÁC ROUTE ĐĂNG KÝ: Chỉ admin đã đăng nhập mới được vào
router.get('/signup', isAuth, isAdmin, authController.getSignup);
router.post('/signup', isAuth, isAdmin, authController.postSignup);

// Route Đăng xuất cần đăng nhập mới thấy
router.post('/logout', isAuth, authController.postLogout);

module.exports = router;