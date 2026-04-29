// File: models/user.js

const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const p = path.join(path.dirname(require.main.filename), 'data', 'users.json');

const getUsersFromFile = (callback) => {
    fs.readFile(p, (err, fileContent) => {
        if (err || fileContent.length === 0) {
            return callback([]);
        }
        callback(JSON.parse(fileContent));
    });
};

module.exports = class User {
    constructor(id, email, password, role, name) {
        this.id = id;
        this.email = email;
        this.password = password; // Mật khẩu chưa băm
        this.role = role;         // Vai trò: 'admin' hoặc 'teacher'
        this.name = name;         // Tên người dùng
    }

    save(callback) {
        getUsersFromFile(users => {
            // Luôn băm mật khẩu trước khi lưu
            bcrypt.hash(this.password, 12)
                .then(hashedPassword => {
                    this.password = hashedPassword; // Gán lại mật khẩu đã băm

                    if (this.id) {
                        // Logic cập nhật (nếu bạn cần chức năng đổi thông tin user)
                        const existingUserIndex = users.findIndex(u => u.id === this.id);
                        const updatedUsers = [...users];
                        updatedUsers[existingUserIndex] = this;
                        fs.writeFile(p, JSON.stringify(updatedUsers), (err) => {
                            if (callback) callback(err);
                        });
                    } else {
                        // Logic tạo mới user
                        this.id = Math.random().toString();
                        users.push(this);
                        fs.writeFile(p, JSON.stringify(users), (err) => {
                            if (callback) callback(err);
                        });
                    }
                })
                .catch(err => {
                    console.log(err);
                    if (callback) callback(err);
                });
        });
    }

    static findByEmail(email, callback) {
        getUsersFromFile(users => {
            const user = users.find(u => u.email === email);
            callback(user);
        });
    }

    static comparePassword(inputPassword, storedPassword, callback) {
        bcrypt.compare(inputPassword, storedPassword)
            .then(doMatch => {
                callback(null, doMatch);
            })
            .catch(err => {
                callback(err);
            });
    }
    
    static findById(id, callback) {
        getUsersFromFile(users => {
            const user = users.find(u => u.id === id);
            callback(user);
        });
    }
    static findAllTeachers(callback) {
        getUsersFromFile(users => {
            const teachers = users.filter(user => user.role === 'teacher');
            callback(teachers);
        });
    }
};