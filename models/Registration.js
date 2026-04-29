const fs = require("fs");
const path = require("path");

const p = path.join(
  path.dirname(require.main.filename),
  "data",
  "registrations.json"
);

const getRegistrationsFromFile = (callback) => {
  fs.readFile(p, (err, fileContent) => {
    if (err) {
      return callback([]);
    }
    try {
      callback(JSON.parse(fileContent));
    } catch (parseErr) {
      callback([]);
    }
  });
};

module.exports = class Registration {
  // Phương thức tĩnh để đăng ký một sinh viên vào một lớp
  static add(studentId, classId, callback) {
    getRegistrationsFromFile((registrations) => {
      const existingRegistration = registrations.find(
        (reg) => reg.studentId === studentId && reg.classId === classId
      );

      if (existingRegistration) {
        return callback(
          new Error("Student already registered for this class.")
        );
      }

      const newRegistration = { studentId: studentId, classId: classId };
      registrations.push(newRegistration);
      fs.writeFile(p, JSON.stringify(registrations), (err) => {
        if (callback) callback(err);
      });
    });
  }

  // Phương thức tĩnh để hủy đăng ký một sinh viên cụ thể khỏi một lớp cụ thể
  static remove(studentId, classId, callback) {
    getRegistrationsFromFile((registrations) => {
      const initialLength = registrations.length;
      const updatedRegistrations = registrations.filter(
        (reg) => !(reg.studentId === studentId && reg.classId === classId)
      );
      
      if (updatedRegistrations.length === initialLength) {
        return callback(new Error("Registration not found to remove."));
      }
      fs.writeFile(p, JSON.stringify(updatedRegistrations), (err) => {
        if (callback) callback(err);
      });
    });
  }

  // Phương thức tĩnh để tìm tất cả đăng ký của một sinh viên
  static findByStudentId(studentId, callback) {
    getRegistrationsFromFile((registrations) => {
      const studentRegistrations = registrations.filter(
        (reg) => reg.studentId === studentId
      );
      callback(studentRegistrations);
    });
  }

  // Phương thức tĩnh để tìm tất cả đăng ký của một lớp học
  static findByClassId(classId, callback) {
    getRegistrationsFromFile((registrations) => {
      const classRegistrations = registrations.filter(
        (reg) => reg.classId === classId
      );
      callback(classRegistrations);
    });
  }

  // Lấy tất cả bản ghi đăng ký
  static fetchAll(callback) {
    getRegistrationsFromFile(callback);
  }

  // Xóa tất cả các đăng ký của một sinh viên (khi sinh viên bị xóa)
  static removeByStudentId(studentId, callback) {
    getRegistrationsFromFile((registrations) => {
      const updatedRegistrations = registrations.filter(
        (reg) => reg.studentId !== studentId
      );
      fs.writeFile(p, JSON.stringify(updatedRegistrations), (err) => {
        if (callback) callback(err);
      });
    });
  }

  // Xóa tất cả các đăng ký liên quan đến một lớp học (khi lớp học bị xóa)
  static removeByClassId(classId, callback) {
    getRegistrationsFromFile((registrations) => {
      const updatedRegistrations = registrations.filter(
        (reg) => reg.classId !== classId
      );
      fs.writeFile(p, JSON.stringify(updatedRegistrations), (err) => {
        if (callback) callback(err);
      });
    });
  }
};