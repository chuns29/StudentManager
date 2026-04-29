const fs = require("fs");
const path = require("path");

// Tạo đường dẫn đến file students.json
const p = path.join(
  path.dirname(require.main.filename),
  "data",
  "students.json"
);

// Hàm trợ giúp để đọc dữ liệu từ file
const getStudentsFromFile = (callback) => {
  fs.readFile(p, (err, fileContent) => {
    if (err) {
      return callback([]); // Luôn gọi callback
    }
    try {
      const students = JSON.parse(fileContent);
      callback(students);
    } catch (parseErr) {
      callback([]); // Gọi callback nếu parse lỗi
    }
  });
};

module.exports = class Student {
  constructor(id, name, studentCode, dateOfBirth, major) {
    this.id = id;
    this.name = name;
    this.studentCode = studentCode;
    this.dateOfBirth = dateOfBirth;
    this.major = major;
  }

  save(callback) {
    getStudentsFromFile((students) => {
      if (this.id) {
        const existingStudentIndex = students.findIndex(
          (std) => std.id === this.id
        );
        if (existingStudentIndex >= 0) {
            const updatedStudents = [...students];
            updatedStudents[existingStudentIndex] = this;
            fs.writeFile(p, JSON.stringify(updatedStudents), (err) => {
                if (callback) callback(err);
            });
        } else {
            if (callback) callback(new Error('Student to update not found'));
        }
      } else {
        this.id = Math.random().toString();
        students.push(this);
        fs.writeFile(p, JSON.stringify(students), (err) => {
          if (callback) callback(err);
        });
      }
    });
  }

  static fetchAll(callback) {
    getStudentsFromFile(callback);
  }

  static findById(id, callback) {
    getStudentsFromFile((students) => {
      const student = students.find((s) => s.id === id);
      callback(student);
    });
  }

  static deleteById(id, callback) {
    // Di chuyển require vào trong hàm để tránh circular dependency
    const Registration = require("./registration");

    getStudentsFromFile((students) => {
      const productToDelete = students.find(std => std.id === id);
      if (!productToDelete) {
          return callback(new Error('Student not found to delete.'));
      }

      const updatedStudents = students.filter((std) => std.id !== id);
      fs.writeFile(p, JSON.stringify(updatedStudents), (err) => {
        if (err) {
          return callback(err);
        }
        // Xóa các đăng ký liên quan đến sinh viên này
        Registration.removeByStudentId(id, (regErr) => {
          // Bạn có thể chọn xử lý regErr ở đây hoặc bỏ qua
          // Gọi callback chính, lỗi từ việc xóa student được ưu tiên (nếu có)
          if (callback) callback(regErr); // Hoặc callback(null) nếu không muốn lỗi từ reg ảnh hưởng
        });
      });
    });
  }

  static getRegisteredClasses(studentId, callback) {
    // Di chuyển require vào trong hàm
    const Registration = require("./registration");
    const ClassModel = require("./class");

    Registration.findByStudentId(studentId, (registrations) => {
      if (!registrations || registrations.length === 0) {
        return callback([]);
      }
      const classIds = registrations.map((reg) => reg.classId);
      
      ClassModel.fetchAll((allClasses) => {
        if (!allClasses) return callback([]); // Xử lý trường hợp allClasses là null/undefined
        const registeredClasses = allClasses.filter((cls) =>
          classIds.includes(cls.id)
        );
        callback(registeredClasses);
      });
    });
  }
};