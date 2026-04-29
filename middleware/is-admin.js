module.exports = (req, res, next) => {
    // Middleware này chỉ nên được dùng SAU is-auth
    if (req.session.user.role !== 'admin') {
        return res.redirect('/'); // Nếu không phải admin, đá về trang chủ (hoặc trang login)
    }
    next(); // Nếu là admin, cho đi tiếp
}