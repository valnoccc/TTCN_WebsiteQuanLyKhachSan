<div align="center">
    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Node.js_logo.svg/1200px-Node.js_logo.svg.png" alt="NodeJS" width="150" style="margin-right: 20px"/>
    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/1200px-React-icon.svg.png" alt="React" width="150" />
</div>

<div align="center">
    
![React](https://img.shields.io/badge/Frontend-React%20(Vite)-61DAFB?style=flat-square&logo=react)
![NodeJS](https://img.shields.io/badge/Backend-NodeJS%20(Express)-339933?style=flat-square&logo=node.js)
![MySQL](https://img.shields.io/badge/Database-MySQL-4479A1?style=flat-square&logo=mysql)
![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)

</div>

# Website Quản Lý Khách Sạn (Hotel Management System)

## Giới thiệu (Introduction)

Dự án **Website Quản Lý Khách Sạn** là sản phẩm thuộc môn **Thực tập chuyên ngành** (Trường ĐH Công nghệ Sài Gòn - STU), được xây dựng nhằm cung cấp giải pháp chuyển đổi số cho quy trình đặt phòng và quản lý khách sạn. Hệ thống được thiết kế với kiến trúc **Client-Server** hiện đại, đảm bảo tốc độ nhanh và trải nghiệm người dùng mượt mà.

## Tính năng nổi bật (Key Features)

### Dành cho Khách hàng (User Client)

* **Trang chủ trực quan:** Hiển thị danh sách phòng nổi bật, các chương trình khuyến mãi và dịch vụ đi kèm.
* **Tìm kiếm & Lọc phòng:** Tìm kiếm theo ngày nhận/trả (Check-in/Check-out), số lượng người, loại phòng (Standard, VIP, Deluxe) và khoảng giá.
* **Chi tiết phòng:** Xem hình ảnh thực tế, tiện nghi và đánh giá từ khách hàng trước.
* **Đặt phòng trực tuyến:** Quy trình 3 bước đơn giản, tự động tính tổng tiền theo số đêm.
* **Tài khoản cá nhân:** Quản lý lịch sử đặt phòng, cập nhật hồ sơ.

### Dành cho Quản trị viên (Admin Dashboard)

* **Thống kê (Dashboard):** Tổng quan doanh thu, tỷ lệ lấp đầy phòng theo thời gian thực.
* **Quản lý Phòng:** Thêm/Sửa/Xóa phòng, cập nhật trạng thái (Trống/Đang dọn/Đã đặt).
* **Quản lý Đơn đặt:** Xác nhận đơn mới, check-in/check-out, xuất hóa đơn.
* **Quản lý Khách hàng:** Tra cứu thông tin và lịch sử lưu trú của khách.

## Công nghệ sử dụng (Tech Stack)

| Lĩnh vực | Công nghệ & Phiên bản |
| :--- | :--- |
| **Frontend** | - **ReactJS**: v19.2.0<br>- **Vite**: v7.2.4<br>- **Tailwind CSS**: v3.4.18<br>- **Axios**: v1.13.2<br>- **React Router DOM**: v7.9.6<br>- **Chart.js**: v4.5.1 |
| **Backend** | - **Node.js**: v24.11.0<br>- **Express Framework**: v5.1.0<br>- **JsonWebToken (JWT)**: v9.0.2<br>- **Bcrypt**: v6.0.0 |
| **Database** | - **MySQL Server**: v9.1.0<br>- **Driver (mysql2)**: v3.15.3 |
| **Tools** | VS Code, Git/GitHub |

## Hướng dẫn cài đặt (Installation)

Làm theo các bước sau để chạy dự án trên máy cục bộ (Localhost).

Bước 1: Clone dự án

Mở Terminal và chạy lệnh:
```bash
git clone [https://github.com/valnoccc/TTCN_WebsiteQuanLyKhachSan.git](https://github.com/valnoccc/TTCN_WebsiteQuanLyKhachSan.git)
cd TTCN_WebsiteQuanLyKhachSan

Bước 2: Cài đặt và chạy Backend (Server)

cd server
npm install
# Lưu ý: Tạo file .env và cấu hình thông tin Database (DB_HOST, DB_USER, DB_PASS...)
npm start

Bước 3: Cài đặt và chạy Frontend (Client)

cd client
npm install
npm run dev

## Tác giả (Author)

| Vai trò | Thông tin |
| :--- | :--- |
| **Sinh viên thực hiện** | Chu Văn Lộc |
| **Giảng viên hướng dẫn** | Huỳnh Quang Đức |
| **Đơn vị đào tạo** | Trường Đại học Công nghệ Sài Gòn (STU) |