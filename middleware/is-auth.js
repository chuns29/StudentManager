module.exports = (req, res, next) => {
    if (!req.session.isLoggedIn) {
        // Nếu chưa đăng nhập, chuyển hướng về trang login
        return res.redirect('/login');
    }
    // Nếu đã đăng nhập, cho phép đi tiếp
    next();
}