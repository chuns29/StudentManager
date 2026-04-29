// File: models/grade.js

const fs = require('fs');
const path = require('path');

const p = path.join(
    path.dirname(require.main.filename),
    'data',
    'grades.json'
);

// Hàm trợ giúp để đọc tất cả các bản ghi điểm từ file
const getGradesFromFile = (callback) => {
    fs.readFile(p, (err, fileContent) => {
        if (err || fileContent.length === 0) {
            return callback([]);
        }
        try {
            callback(JSON.parse(fileContent));
        } catch (e) {
            callback([]);
        }
    });
};

module.exports = class Grade {
    /**
     * Tìm tất cả các bản ghi điểm của một lớp học.
     * @param {string} classId ID của lớp học.
     * @param {function} callback Hàm callback để xử lý kết quả.
     */
    static findByClassId(classId, callback) {
        getGradesFromFile(allGrades => {
            const classGrades = allGrades.filter(g => g.classId === classId);
            callback(classGrades);
        });
    }

    /**
     * Lưu toàn bộ dữ liệu điểm cho một lớp trong một lần.
     * @param {string} classId ID của lớp cần cập nhật.
     * @param {Array} updatedClassGrades Mảng chứa các bản ghi điểm mới của lớp đó.
     * @param {function} callback Hàm callback.
     */
    static saveForClass(classId, updatedClassGrades, callback) {
        getGradesFromFile(allGrades => {
            // Lọc ra tất cả các bản ghi KHÔNG thuộc về lớp đang cập nhật
            const otherClassesGrades = allGrades.filter(g => g.classId !== classId);
            
            // Kết hợp các bản ghi của các lớp khác với các bản ghi đã được cập nhật của lớp hiện tại
            const finalGradeData = otherClassesGrades.concat(updatedClassGrades);
            
            // Ghi lại toàn bộ dữ liệu vào file
            fs.writeFile(p, JSON.stringify(finalGradeData, null, 2), callback);
        });
    }
};