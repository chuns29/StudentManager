// --- 1. NẠP CÁC MODULE CẦN THIẾT ---
const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const session = require("express-session");
const flash = require('connect-flash'); 
// --- NẠP CÁC FILE ROUTES VÀ CONTROLLER LỖI ---
const authRoutes = require("./routes/auth");
const studentRoutes = require("./routes/student");
const classRoutes = require("./routes/class");
const errorController = require("./controllers/errors"); 

const FileStore = require('session-file-store')(session);
// --- 2. CẤU HÌNH VIEW ENGINE ---
app.set("view engine", "ejs");
app.set("views", "views");

// --- 3. ĐĂNG KÝ CÁC MIDDLEWARE ---
// Middleware để xử lý dữ liệu form
app.use(bodyParser.urlencoded({ extended: true }));
// Middleware để phục vụ các file tĩnh (CSS, JS, hình ảnh)
app.use(express.static(path.join(__dirname, "public")));
app.use(
    session({
        secret: 'my secret key for hashing',
        resave: false,
        saveUninitialized: false,
        store: new FileStore({ path: './sessions', logFn: function(){} }) 
    })
);
app.use(flash());
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  next();
});
// --- 4. ĐĂNG KÝ CÁC ROUTES ---
app.get('/', (req, res, next) => {
    res.redirect('/login');
});
// Theo yêu cầu của bạn, trang chủ (/) sẽ được xử lý bởi classRoutes
app.use(authRoutes);
app.use("/admin", studentRoutes);
app.use("/admin", classRoutes);

// --- 5. ĐĂNG KÝ MIDDLEWARE XỬ LÝ LỖI 404 ---
app.use(errorController.get404);

// --- 6. KHỞI ĐỘNG SERVER ---
app.listen(3456, () => {
  console.log("Server đang chạy tại http://localhost:3456");
});
