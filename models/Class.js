const fs = require("fs");
const path = require("path");

// Tạo đường dẫn đến file classes.json
const p = path.join(
  path.dirname(require.main.filename),
  "data",
  "classes.json"
);

const getClassesFromFile = (callback) => {
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

module.exports = class Class {
  constructor(id, name, teacherId) {
    this.id = id;
    this.name = name;
    this.teacherId = teacherId; // Lưu ID của teacher
  }

  save(callback) {
    getClassesFromFile((classes) => {
      if (this.id) {
        const existingClassIndex = classes.findIndex(
          (cls) => cls.id === this.id
        );
        if (existingClassIndex >= 0) {
          const updatedClasses = [...classes];
          updatedClasses[existingClassIndex] = this; // 'this' chỉ chứa id, name, teacher
          fs.writeFile(p, JSON.stringify(updatedClasses), (err) => {
            if (callback) callback(err);
          });
        } else {
          if (callback) callback(new Error("Class to update not found"));
        }
      } else {
        this.id = Math.random().toString();
        classes.push(this); // 'this' chỉ chứa id, name, teacher
        fs.writeFile(p, JSON.stringify(classes), (err) => {
          if (callback) callback(err);
        });
      }
    });
  }

  static fetchAll(callback) {
    getClassesFromFile(callback);
  }

  static findById(id, callback) {
    getClassesFromFile((classes) => {
      const foundClass = classes.find((cls) => cls.id === id);
      callback(foundClass);
    });
  }

  static getStudents(classId, callback) {
    // Di chuyển require vào trong hàm
    const Registration = require("./registration");
    const Student = require("./student");

    Registration.findByClassId(classId, (registrations) => {
      if (!registrations || registrations.length === 0) {
        return callback([]);
      }
      const studentIds = registrations.map((reg) => reg.studentId);

      Student.fetchAll((allStudents) => {
        if (!allStudents) return callback([]); // Xử lý trường hợp allStudents là null/undefined
        const classStudents = allStudents.filter((student) =>
          studentIds.includes(student.id)
        );
        callback(classStudents);
      });
    });
  }

  static deleteById(id, callback) {
    // Di chuyển require vào trong hàm
    const Registration = require("./registration");

    getClassesFromFile((classes) => {
      const classToDelete = classes.find((cls) => cls.id === id);
      if (!classToDelete) {
        return callback(new Error("Class not found to delete."));
      }

      const updatedClasses = classes.filter((cls) => cls.id !== id);
      fs.writeFile(p, JSON.stringify(updatedClasses), (err) => {
        if (err) {
          return callback(err);
        }
        Registration.removeByClassId(id, (regErr) => {
          if (callback) callback(regErr);
        });
      });
    });
  }
  // trong models/class.js
  static findByTeacherId(teacherId, callback) {
    getClassesFromFile((classes) => {
      const teacherClasses = classes.filter(
        (cls) => cls.teacherId === teacherId
      );
      callback(teacherClasses);
    });
  }
};
