// File: controllers/class.js
const User = require("../models/users");
const Class = require("../models/class");
const Registration = require("../models/registration");
const Student = require("../models/student");
const Attendance = require("../models/attendance");
const Grade = require("../models/grade");

// --- HIỂN THỊ DANH SÁCH TẤT CẢ CÁC LỚP HỌC (KÈM SĨ SỐ) ---
exports.getClasses = (req, res, next) => {
  const user = req.session.user;

  const getClassesData = (classes) => {
    // Nếu không có lớp nào, render luôn
    if (!classes || classes.length === 0) {
      return res.render("classes/class-list", {
        pageTitle: "Danh sách Lớp học",
        path: "/admin/classes",
        userRole: user.role,
        classes: [],
      });
    }

    // Lấy danh sách tất cả các giáo viên để tra cứu tên
    User.findAllTeachers((teachers) => {
      // "Làm giàu" thông tin cho mỗi lớp học
      const enrichedClasses = classes.map((cls) => {
        // Tìm giáo viên tương ứng với teacherId của lớp
        const teacher = teachers.find((t) => t.id === cls.teacherId);
        return {
          ...cls, // Giữ lại các thuộc tính cũ của lớp (id, name, teacherId)
          teacherName: teacher ? teacher.name : "Chưa phân công", // Thêm thuộc tính mới là teacherName
        };
      });

      // Logic lấy sĩ số (giữ nguyên)
      const classPromises = enrichedClasses.map((cls) => {
        return new Promise((resolve) => {
          Registration.findByClassId(cls.id, (registrations) => {
            cls.studentCount = registrations ? registrations.length : 0;
            resolve(cls);
          });
        });
      });

      Promise.all(classPromises).then((finalClasses) => {
        res.render("classes/class-list", {
          pageTitle: "Danh sách Lớp học",
          path: "/admin/classes",
          userRole: user.role,
          classes: finalClasses, // Truyền danh sách lớp đã có đủ thông tin
        });
      });
    });
  };

  // Kiểm tra vai trò và gọi hàm lấy dữ liệu lớp phù hợp
  if (user.role === "admin") {
    Class.fetchAll(getClassesData);
  } else if (user.role === "teacher") {
    Class.findByTeacherId(user.id, getClassesData);
  } else {
    res.redirect("/login");
  }
};

// --- HIỂN THỊ FORM ĐỂ THÊM MỘT LỚP HỌC MỚI ---
exports.getAddClass = (req, res, next) => {
  User.findAllTeachers((teachers) => {
    res.render("classes/add-class", {
      pageTitle: "Thêm Lớp học",
      path: "/admin/add-class",
      teachers: teachers, // Truyền danh sách giáo viên vào view
      userRole: req.session.user.role, // Truyền vai trò người dùng vào view
    });
  });
};

// --- XỬ LÝ DỮ LIỆU TỪ FORM THÊM LỚP HỌC ---
exports.postAddClass = (req, res, next) => {
  const name = req.body.name;
  const teacherId = req.body.teacherId;
  const newClass = new Class(null, name, teacherId);
  newClass.save(() => {
    res.redirect("/admin/classes"); // Cập nhật redirect
  });
};

// --- HIỂN THỊ FORM CHỈNH SỬA LỚP HỌC ---
exports.getEditClass = (req, res, next) => {
  const classId = req.params.classId;
  Class.findById(classId, (cls) => {
    if (!cls) {
      return res.redirect("/");
    }
    User.findAllTeachers((teachers) => {
      res.render("classes/edit-class", {
        pageTitle: "Chỉnh sửa Lớp học",
        path: "/admin/classes",
        classItem: cls,
        teachers: teachers, // Truyền cả danh sách giáo viên
        userRole: req.session.user.role, // Truyền vai trò người dùng vào view
      });
    });
  });
};

// --- XỬ LÝ VIỆC CẬP NHẬT LỚP HỌC ---
exports.postEditClass = (req, res, next) => {
  const classId = req.body.classId;
  const updatedName = req.body.name;
  const updatedTeacherId = req.body.teacherId;

  const updatedClass = new Class(classId, updatedName, updatedTeacherId);
  updatedClass.save(() => {
    res.redirect("/admin/classes"); // Cập nhật redirect
  });
};

// XỬ LÝ VIỆC XÓA LỚP HỌC
exports.postDeleteClass = (req, res, next) => {
  const classId = req.body.classId;
  Class.deleteById(classId, (err) => {
    if (err) {
      console.log("Lỗi khi xóa lớp:", err);
    }
    res.redirect("/admin/classes"); // Cập nhật redirect
  });
};

// --- HIỂN THỊ TRANG CHI TIẾT CỦA MỘT LỚP HỌC ---
// ...
exports.getClass = (req, res, next) => {
    const classId = req.params.classId;

    // Dùng Promise.all để lấy tất cả dữ liệu cần thiết cùng lúc
    Promise.all([
        new Promise(resolve => Class.findById(classId, resolve)),
        new Promise(resolve => Class.getStudents(classId, resolve)),
        new Promise(resolve => Attendance.findByClassId(classId, resolve)),
        new Promise(resolve => Student.fetchAll(resolve)),
        new Promise(resolve => Grade.findByClassId(classId, resolve)) // <-- THÊM BƯỚC LẤY ĐIỂM
    ])
    .then(([currentClass, studentsInClass, attendanceRecords, allStudents, gradeRecords]) => { // <-- Thêm gradeRecords
        if (!currentClass) {
            return res.status(404).render('404', { pageTitle: 'Lớp không tồn tại', path: '/404'});
        }

        User.findById(currentClass.teacherId, teacher => {
            const classInfo = {
                ...currentClass,
                teacherName: teacher ? teacher.name : 'Chưa có thông tin'
            };

            // "Làm giàu" thông tin cho mỗi sinh viên với cả điểm danh VÀ điểm số
            const enrichedStudents = studentsInClass.map(student => {
                // Lấy bản ghi điểm danh
                const attendanceRecord = attendanceRecords.find(r => r.studentId === student.id);
                let presences = 0;
                let absences = 0;
                if (attendanceRecord && attendanceRecord.sessions) {
                    const sessionsTaken = attendanceRecord.sessions.filter(s => s !== null).length;
                    presences = attendanceRecord.sessions.filter(s => s === true).length;
                    absences = sessionsTaken - presences;
                }

                // Lấy bản ghi điểm số
                const gradeRecord = gradeRecords.find(g => g.studentId === student.id);

                return {
                    ...student,
                    presences: presences,
                    absences: absences,
                    score: gradeRecord ? gradeRecord.score : 'N/A' // <-- THÊM THUỘC TÍNH ĐIỂM
                };
            });
            
            // ... (logic tìm availableStudents không đổi)
            const studentsInClassIds = studentsInClass.map(s => s.id);
            const availableStudents = allStudents.filter(
                student => !studentsInClassIds.includes(student.id)
            );

            res.render('classes/class-detail', {
                pageTitle: 'Chi tiết Lớp: ' + classInfo.name,
                path: '/admin/classes',
                userRole: req.session.user.role,
                classInfo: classInfo,
                studentsInClass: enrichedStudents, // Gửi danh sách sinh viên đã có đầy đủ thông tin
                availableStudents: availableStudents
            });
        });
    })
    .catch(err => console.log(err));
};
// ...

// --- XỬ LÝ VIỆC THÊM MỘT SINH VIÊN VÀO LỚP HỌC ---
exports.postAddStudentToClass = (req, res, next) => {
  const classId = req.body.classId;
  const studentId = req.body.studentId;
  if (!studentId) {
    return res.redirect(
      "/admin/classes/" + classId + "?error=NoStudentSelected"
    );
  }
  Registration.add(studentId, classId, (err) => {
    if (err) {
      console.log("Lỗi khi đăng ký SV vào lớp:", err.message);
      return res.redirect(
        "/admin/classes/" +
          classId +
          "?error=" +
          encodeURIComponent(err.message)
      );
    }
    res.redirect("/admin/classes/" + classId); // Cập nhật redirect
  });
};

// --- XỬ LÝ VIỆC XÓA MỘT SINH VIÊN KHỎI LỚP HỌC ---
exports.postRemoveStudentFromClass = (req, res, next) => {
  const classId = req.body.classId;
  const studentId = req.body.studentId;
  if (!studentId || !classId) {
    return res.redirect("/admin/classes"); // Cập nhật redirect
  }
  Registration.remove(studentId, classId, (err) => {
    if (err) {
      console.log("Lỗi khi xóa SV khỏi lớp:", err.message);
    }
    res.redirect("/admin/classes/" + classId); // Cập nhật redirect
  });
};

// Thêm vào file: controllers/class.js

exports.getAttendancePage = (req, res, next) => {
  const classId = req.params.classId;

  // Lấy thông tin lớp và danh sách sinh viên cùng lúc
  Promise.all([
    new Promise((resolve) => Class.findById(classId, resolve)),
    new Promise((resolve) => Class.getStudents(classId, resolve)),
    new Promise((resolve) => Attendance.findByClassId(classId, resolve)),
  ])
    .then(([currentClass, studentsInClass, attendanceRecords]) => {
      if (!currentClass) {
        return res.redirect("/");
      }

      // Kết hợp dữ liệu: Gắn bản ghi điểm danh vào từng sinh viên
      const attendanceData = studentsInClass.map((student) => {
        let studentAttendance = attendanceRecords.find(
          (att) => att.studentId === student.id
        );

        // Nếu sinh viên chưa có bản ghi điểm danh, tạo một bản ghi mặc định
        if (!studentAttendance) {
          studentAttendance = {
            studentId: student.id,
            classId: classId,
            sessions: Array(10).fill(null), // null = chưa điểm danh
          };
        }
        return {
          studentInfo: student,
          attendanceRecord: studentAttendance,
        };
      });

      res.render("classes/attendance", {
        // Sẽ tạo view này ở bước sau
        pageTitle: "Điểm danh lớp: " + currentClass.name,
        path: "/admin/classes", // Để active link navigation
        classInfo: currentClass,
        attendanceData: attendanceData, // Dữ liệu đã được kết hợp
        studentsInClass: studentsInClass, // Danh sách sinh viên trong lớp
        userRole: req.session.user.role, // Truyền vai trò người dùng vào view
      });
    })
    .catch((err) => {
      console.log("Lỗi khi lấy dữ liệu trang điểm danh:", err);
      // Xử lý lỗi
    });
};

// Thêm vào file: controllers/class.js

// ...
// ...
exports.postAttendance = (req, res, next) => {
    const classId = req.params.classId;
    // Lấy số buổi từ dropdown (ví dụ: "4") và danh sách ID sinh viên có mặt
    const sessionNumber = req.body.sessionNumber;
    const presentStudentIds = req.body.presentStudentIds || [];

    // Chuyển số buổi thành chỉ số mảng (Buổi 1 -> index 0)
    const sessionIndex = parseInt(sessionNumber, 10) - 1;

    // Kiểm tra xem chỉ số buổi học có hợp lệ không
    if (isNaN(sessionIndex) || sessionIndex < 0 || sessionIndex >= 10) {
        // Nếu không hợp lệ, chuyển hướng lại với thông báo lỗi
        return res.redirect('/admin/classes/' + classId + '/attendance?error=InvalidSession');
    }

    // Lấy tất cả sinh viên của lớp và dữ liệu điểm danh hiện có
    Promise.all([
        new Promise(resolve => Class.getStudents(classId, resolve)),
        new Promise(resolve => Attendance.findByClassId(classId, resolve))
    ])
    .then(([studentsInClass, attendanceRecords]) => {
        // Tạo một mảng mới chứa dữ liệu điểm danh đã được cập nhật
        const updatedAttendanceForClass = studentsInClass.map(student => {
            const studentId = student.id;

            // Tìm bản ghi điểm danh cũ của sinh viên này
            let record = attendanceRecords.find(r => r.studentId === studentId);

            // Nếu không có, tạo một bản ghi mới với 10 buổi là null
            if (!record) {
                record = { classId, studentId, sessions: Array(10).fill(null) };
            }

            // Cập nhật trạng thái cho buổi học được chọn
            // Nếu ID của sinh viên có trong danh sách có mặt, set là true, ngược lại là false
            record.sessions[sessionIndex] = presentStudentIds.includes(studentId);

            return record;
        });

        // Gọi phương thức saveForClass một lần duy nhất
        Attendance.saveForClass(classId, updatedAttendanceForClass, (err) => {
            if (err) {
                console.log("Lỗi khi lưu điểm danh:", err);
            }
            // Chuyển hướng về trang chi tiết lớp học
            res.redirect('/admin/classes/' + classId);
        });
    })
    .catch(err => {
        console.log(err);
        res.redirect('/admin/classes/' + classId);
    });
};
exports.getAttendanceSummary = (req, res, next) => {
    const classId = req.params.classId;

    // Logic này gần giống với getAttendancePage cũ
    Promise.all([
        new Promise(resolve => Class.findById(classId, resolve)),
        new Promise(resolve => Class.getStudents(classId, resolve)),
        new Promise(resolve => Attendance.findByClassId(classId, resolve))
    ])
    .then(([currentClass, studentsInClass, attendanceRecords]) => {
        if (!currentClass) { return res.redirect('/'); }
        User.findById(currentClass.teacherId, teacher => {
            const classInfo = {
                ...currentClass,
                teacherName: teacher ? teacher.name : 'N/A'
            };
            const attendanceData = studentsInClass.map(student => {
                let record = attendanceRecords.find(att => att.studentId === student.id);
                if (!record) {
                    record = { sessions: Array(10).fill(null) };
                }
                return { studentInfo: student, attendanceRecord: record };
            });
            res.render('classes/attendance-summary', { // Render view mới
                pageTitle: 'Tổng kết Điểm danh: ' + classInfo.name,
                path: '/admin/classes',
                classInfo: classInfo,
                attendanceData: attendanceData,
                userRole: req.session.user.role, // Truyền vai trò người dùng vào view
            });
        });
    })
    .catch(err => console.log(err));
};
// --- XỬ LÝ VIỆC NHẬP ĐIỂM CHO CÁC SINH VIÊN TRONG MỘT LỚP ---
exports.getGradePage = (req, res, next) => {
    const classId = req.params.classId;

    // Lấy thông tin lớp, danh sách sinh viên và điểm đã có
    Promise.all([
        new Promise(resolve => Class.findById(classId, resolve)),
        new Promise(resolve => Class.getStudents(classId, resolve)),
        new Promise(resolve => Grade.findByClassId(classId, resolve))
    ])
    .then(([currentClass, studentsInClass, gradeRecords]) => {
        if (!currentClass) {
            return res.redirect('/');
        }

        // Kết hợp dữ liệu: Gắn điểm đã có vào từng sinh viên
        const gradeData = studentsInClass.map(student => {
            let studentGrade = gradeRecords.find(g => g.studentId === student.id);
            if (!studentGrade) {
                // Nếu sinh viên chưa có điểm, tạo bản ghi mặc định
                studentGrade = { score: '' }; // Để giá trị là chuỗi rỗng cho ô input
            }
            return {
                studentInfo: student,
                gradeRecord: studentGrade
            };
        });

        res.render('classes/grade-entry', { // Sẽ tạo view này ở bước sau
            pageTitle: 'Nhập điểm lớp: ' + currentClass.name,
            path: '/admin/classes',
            classInfo: currentClass,
            gradeData: gradeData,
            userRole: req.session.user.role, // Truyền vai trò người dùng vào view
        });
    })
    .catch(err => console.log("Lỗi khi lấy dữ liệu trang nhập điểm:", err));
};

// --- XỬ LÝ VIỆC LƯU ĐIỂM CHO CÁC SINH VIÊN TRONG MỘT LỚP ---
exports.postGrades = (req, res, next) => {
    const classId = req.params.classId;
    // req.body.grades là một đối tượng: { studentId1: { score: '9' }, studentId2: { score: '8' } }
    const gradesFromForm = req.body.grades || {};

    // Chuyển đổi đối tượng từ form thành một mảng các bản ghi điểm
    const allGradesForClass = Object.keys(gradesFromForm).map(studentId => {
        const gradeInfo = gradesFromForm[studentId];
        const scoreValue = parseFloat(gradeInfo.score);
        return {
            classId: classId,
            studentId: studentId,
            // Nếu điểm là một số hợp lệ thì lưu, ngược lại lưu là null
            score: !isNaN(scoreValue) ? scoreValue : null 
        };
    });

    // Gọi phương thức saveForClass một lần duy nhất
    Grade.saveForClass(classId, allGradesForClass, (err) => {
        if (err) {
            console.log("Lỗi khi lưu điểm:", err);
        }
        // Chuyển hướng về trang chi tiết lớp học
        res.redirect('/admin/classes/' + classId);
    });
};