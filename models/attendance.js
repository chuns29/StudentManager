// File: models/attendance.js

const fs = require('fs');
const path = require('path');

const p = path.join(
    path.dirname(require.main.filename),
    'data',
    'attendance.json'
);

// Hàm trợ giúp để đọc tất cả các bản ghi điểm danh từ file
const getAttendanceFromFile = (callback) => {
    fs.readFile(p, (err, fileContent) => {
        // Nếu file chưa tồn tại hoặc rỗng, trả về một mảng rỗng
        if (err || fileContent.length === 0) {
            return callback([]);
        }
        // Nếu có dữ liệu, parse và trả về
        try {
            callback(JSON.parse(fileContent));
        } catch (parseErr) {
            callback([]); // Nếu file JSON bị lỗi, cũng trả về mảng rỗng
        }
    });
};

module.exports = class Attendance {
    /**
     * Tìm tất cả các bản ghi điểm danh của một lớp học cụ thể.
     * @param {string} classId ID của lớp học.
     * @param {function} callback Hàm callback để xử lý kết quả.
     */
    static findByClassId(classId, callback) {
        getAttendanceFromFile(allAttendance => {
            const classAttendance = allAttendance.filter(att => att.classId === classId);
            callback(classAttendance);
        });
    }

    /**
     * Lưu (tạo mới hoặc cập nhật) một bản ghi điểm danh.
     * @param {object} attendanceData Dữ liệu điểm danh, ví dụ: { classId, studentId, sessions: [...] }
     * @param {function} callback Hàm callback để xử lý lỗi (nếu có).
     */
 static saveForClass(classId, updatedClassAttendance, callback) {
        getAttendanceFromFile(allAttendance => {
            // Lọc ra tất cả các bản ghi không thuộc về lớp đang cập nhật
            const otherClassesAttendance = allAttendance.filter(att => att.classId !== classId);
            
            // Tạo một mảng mới bằng cách kết hợp các bản ghi của các lớp khác
            // với các bản ghi đã được cập nhật của lớp hiện tại.
            const finalAttendanceData = otherClassesAttendance.concat(updatedClassAttendance);
            
            // Ghi lại toàn bộ dữ liệu vào file
            fs.writeFile(p, JSON.stringify(finalAttendanceData, null, 2), callback); // Thêm null, 2 để format file JSON cho đẹp
        });
    }
};