// File: routes/class.js
const express = require('express');
const router = express.Router();
const classController = require('../controllers/class');
const isAuth = require('../middleware/is-auth');     // Import isAuth
const isAdmin = require('../middleware/is-admin');   // Import isAdmin

// --- CÁC ROUTE CHO LỚP HỌC ---

// Trang danh sách lớp: Cả admin và teacher đều có thể xem -> chỉ cần isAuth
router.get('/classes', isAuth, classController.getClasses);

// Trang chi tiết lớp: Cả admin và teacher đều có thể xem -> chỉ cần isAuth
router.get('/classes/:classId', isAuth, classController.getClass);

// Thêm lớp: Chỉ admin
router.get('/add-class', isAuth, isAdmin, classController.getAddClass);
router.post('/add-class', isAuth, isAdmin, classController.postAddClass);

// Sửa lớp: Chỉ admin
router.get('/classes/edit/:classId', isAuth, isAdmin, classController.getEditClass);
router.post('/classes/edit', isAuth, isAdmin, classController.postEditClass);

// Xóa lớp: Chỉ admin
router.post('/classes/delete', isAuth, isAdmin, classController.postDeleteClass);

// Thêm/Xóa SV khỏi lớp: Chỉ admin
router.post('/classes/add-student', isAuth, isAdmin, classController.postAddStudentToClass);
router.post('/classes/remove-student', isAuth, isAdmin, classController.postRemoveStudentFromClass);

// GET /admin/classes/:classId/attendance => Hiển thị trang điểm danh cho một lớp
router.get('/classes/:classId/attendance', isAuth, classController.getAttendancePage);

// POST /admin/classes/:classId/attendance => Lưu lại kết quả điểm danh
router.post('/classes/:classId/attendance', isAuth, classController.postAttendance);
router.get('/classes/:classId/attendance-summary', isAuth, classController.getAttendanceSummary);

// GET /admin/classes/:classId/grades => Hiển thị trang nhập điểm
router.get('/classes/:classId/grades', isAuth, classController.getGradePage);

// POST /admin/classes/:classId/grades => Lưu lại điểm số
router.post('/classes/:classId/grades', isAuth, classController.postGrades);
module.exports = router;