// File: routes/student.js
const express = require('express');
const router = express.Router();
const studentController = require('../controllers/student');
const isAuth = require('../middleware/is-auth');     // Import isAuth
const isAdmin = require('../middleware/is-admin');   // Import isAdmin

// --- CÁC ROUTE CHO SINH VIÊN (Tất cả đều cần quyền admin) ---
router.get('/students', isAuth, isAdmin, studentController.getStudents);
router.get('/add-student', isAuth, isAdmin, studentController.getAddStudent);
router.post('/add-student', isAuth, isAdmin, studentController.postAddStudent);
router.get('/students/edit/:studentId', isAuth, isAdmin, studentController.getEditStudent);
router.post('/students/edit', isAuth, isAdmin, studentController.postEditStudent);
router.post('/students/delete', isAuth, isAdmin, studentController.postDeleteStudent);

module.exports = router;