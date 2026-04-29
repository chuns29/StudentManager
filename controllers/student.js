// Import model Student để có thể tương tác với dữ liệu
const express = require('express');
const Student = require('../models/student');

// --- HIỂN THỊ DANH SÁCH SINH VIÊN ---
exports.getStudents = (req, res, next) => {
    Student.fetchAll(students => {
        res.render('students/student-list', {
            pageTitle: 'Danh sách Sinh viên',
            path: '/admin/students', // Cập nhật path
            students: students,
            userRole: req.session.user.role // Truyền vai trò người dùng vào view
        });
    });
};

// --- HIỂN THỊ FORM THÊM MỚI SINH VIÊN ---
exports.getAddStudent = (req, res, next) => {
    res.render('students/edit-student', {
        pageTitle: 'Thêm Sinh viên',
        path: '/admin/add-student', // Cập nhật path
        editing: false,
        userRole: req.session.user.role // Truyền vai trò người dùng vào view
    });
};

// --- XỬ LÝ VIỆC THÊM MỚI SINH VIÊN ---
exports.postAddStudent = (req, res, next) => {
    const name = req.body.name;
    const studentCode = req.body.studentCode;
    const dateOfBirth = req.body.dateOfBirth;
    const major = req.body.major;
    const student = new Student(null, name, studentCode, dateOfBirth, major);
    student.save(() => {
        res.redirect('/admin/students'); // Cập nhật redirect
    });
};

// --- HIỂN THỊ FORM CHỈNH SỬA SINH VIÊN ---
exports.getEditStudent = (req, res, next) => {
    const studentId = req.params.studentId;
    Student.findById(studentId, student => {
        if (!student) {
            return res.redirect('/');
        }
        res.render('students/edit-student', {
            pageTitle: 'Chỉnh sửa thông tin',
            path: '/admin/students', // Cập nhật path (để tô sáng link danh sách chính)
            editing: true,
            student: student,
            userRole: req.session.user.role // Truyền vai trò người dùng vào view
        });
    });
};

// --- XỬ LÝ VIỆC CHỈNH SỬA SINH VIÊN ---
exports.postEditStudent = (req, res, next) => {
    const studentId = req.body.studentId;
    const updatedName = req.body.name;
    const updatedStudentCode = req.body.studentCode;
    const updatedDateOfBirth = req.body.dateOfBirth;
    const updatedMajor = req.body.major;
    const updatedStudent = new Student(
        studentId,
        updatedName,
        updatedStudentCode,
        updatedDateOfBirth,
        updatedMajor
    );
    updatedStudent.save(() => {
        res.redirect('/admin/students'); // Cập nhật redirect
    });
};

// --- XỬ LÝ VIỆC XÓA SINH VIÊN ---
exports.postDeleteStudent = (req, res, next) => {
    const studentId = req.body.studentId;
    Student.deleteById(studentId, () => {
        res.redirect('/admin/students'); // Cập nhật redirect
    });
};