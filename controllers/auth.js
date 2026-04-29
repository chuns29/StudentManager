const User = require('../models/users');

exports.getLogin = (req, res, next) => {
    let errorMessage = req.flash('error'); // Lấy tin nhắn lỗi với key 'error'
    
    if (errorMessage.length > 0) {
        errorMessage = errorMessage[0]; // req.flash trả về một mảng, ta chỉ lấy phần tử đầu tiên
    } else {
        errorMessage = null; // Nếu không có tin nhắn, đặt là null
    }

    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        errorMessage: errorMessage, // Truyền biến errorMessage vào view
        userRole: req.session.user ? req.session.user.role : null // Truyền vai trò người dùng vào view
    });
};


exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    User.findByEmail(email, user => {
        if (!user) {

            req.flash('error', 'Email hoặc mật khẩu không hợp lệ.');
            return req.session.save(err => {
                console.log(err);
                res.redirect('/login');
            });
        }
        User.comparePassword(password, user.password, (err, doMatch) => {
            if (doMatch) {
                // Mật khẩu khớp! Tạo session.
                req.session.isLoggedIn = true;
                req.session.user = user;
                req.session.save(err => {
                    console.log(err);
                    res.redirect('/admin/classes');
                });
            } else {
                // Mật khẩu không khớp -> Gửi flash message và LƯU SESSION
                req.flash('error', 'Email hoặc mật khẩu không hợp lệ.');
                req.session.save(err => {
                    console.log(err);
                    res.redirect('/login');
                });
            }
        });
    });
};




exports.postLogout = (req, res, next) => {
    req.session.destroy(err => {
        console.log(err);
        res.redirect('/');
    });
};

// Hàm cho Signup (nếu bạn cần)
exports.getSignup = (req, res, next) => {
    res.render('auth/signup', {
        path: '/signup',
        pageTitle: 'Signup',
        errorMessage: req.flash('error'), // Lấy tin nhắn lỗi với key 'error'
        userRole: req.session.user ? req.session.user.role : null // Truyền vai trò người dùng vào view
    });
};

exports.postSignup = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;
    const name = req.body.name; // Lấy thêm tên người dùng

    if (password !== confirmPassword) {
        req.flash('error', 'Mật khẩu xác nhận không khớp!');
        return res.redirect('/signup');
    }

    // THAY ĐỔI: Dùng User.findByEmail
    User.findByEmail(email, existingUser => {
        if (existingUser) {
            req.flash('error', 'Email đã tồn tại, vui lòng chọn email khác.');
            return res.redirect('/signup');
        }
        
        // THAY ĐỔI: Tạo một User mới với vai trò mặc định là 'teacher'
        const user = new User(null, email, password, 'teacher', name); 
        user.save(err => {
            if (err) {
                console.log(err);
            }
            res.redirect('/login');
        });
    });
};