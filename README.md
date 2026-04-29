
## **TÓM TẮT DỰ ÁN: WEBSITE QUẢN LÝ LỚP HỌC & SINH VIÊN**

### **1. Tổng quan và Mục tiêu**
* **Đề tài:** Xây dựng ứng dụng web quản lý giáo dục sử dụng Node.js
* **Mục tiêu:** Áp dụng mô hình **MVC** và các công nghệ server-side để giải quyết bài toán quản lý lớp học, phân quyền người dùng và số hóa nghiệp vụ điểm danh/nhập điểm.

### **2. Các tính năng cốt lõi (Core Features)**
Dự án được thiết kế với hệ thống phân quyền chặt chẽ giữa Admin và Teacher
* **Hệ thống Xác thực:** Đăng ký/Đăng nhập với mật khẩu được mã hóa bằng **bcryptjs** và quản lý phiên làm việc qua **session**
* **Quản trị hệ thống (Admin):** Toàn quyền thực hiện CRUD (Thêm, Sửa, Xóa) cho Lớp học và Sinh viên; phân công giảng viên và đăng ký sinh viên vào các lớp.
* **Nghiệp vụ Giảng viên (Teacher):** Quản lý danh sách lớp được phân công, thực hiện **điểm danh theo buổi** và **nhập điểm cuối kỳ** cho sinh viên.
* **Thống kê:** Tự động tổng hợp số buổi vắng và hiển thị kết quả học tập trực quan tại trang chi tiết lớp

### **3. Kỹ thuật và Công nghệ sử dụng**
* **Backend:** Node.js & Express.js
* **Kiến trúc:** Model-View-Controller (MVC) giúp tách biệt logic xử lý, dữ liệu và giao diện
* **Template Engine:** EJS (Embedded JavaScript) để hiển thị giao diện động
* **Lưu trữ:** Mô phỏng cơ sở dữ liệu thông qua hệ thống **file JSON**
* **Bảo mật:** Sử dụng Middleware (`is-auth`, `is-admin`) để bảo vệ các tuyến đường (routes) nhạy cảm

### **4. Đánh giá và Hướng phát triển**
* **Ưu điểm:** Hoàn thành đầy đủ các yêu cầu chức năng; mã nguồn tổ chức khoa học, dễ bảo trì và có tính thực tế cao
* **Hạn chế:** Việc lưu trữ bằng file JSON chưa tối ưu cho dữ liệu lớn hoặc ghi đồng thời (race condition); giao diện ở mức cơ bản
* **Hướng nâng cấp:**
    * Chuyển sang dùng các hệ quản trị CSDL thực thụ như **MongoDB** hoặc **MySQL/PostgreSQL**
    * Sử dụng các Framework hiện đại như **React** hoặc Vue.js để cải thiện UI/UX
    * Tích hợp thêm chức năng phân trang, tìm kiếm nâng cao và biểu đồ Dashboard:
