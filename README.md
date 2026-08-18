# Ứng Dụng Quản Lý Phòng Trọ (Full-Stack, Real-time)

Ứng dụng web quản lý 12 phòng trọ phong cách sổ tay (ledger design), hỗ trợ cập nhật dữ liệu thời gian thực (real-time) với Socket.io, Node.js Express backend, MongoDB Mongoose, và React (Vite) frontend.

## 🚀 Tính năng nổi bật

1. **Tổng quan (Dashboard)**: Thống kê Tổng cần thu, Đã thu, Còn thiếu, danh sách phòng nợ và bản đồ 12 phòng dạng thẻ chìa khóa.
2. **Phòng & Người thuê**: Quản lý thông tin 12 phòng, người thuê, SĐT, số người, tiền phòng, hình thức tính nước (Cố định / Theo người).
3. **Hóa đơn tháng**: Quản lý hóa đơn tự động tạo theo tháng, tính tiền điện (chỉ số cũ/mới), các khoản phí khác (wifi, rác...), đánh dấu đã thu/chưa thu. Tự động kế thừa chỉ số điện mới của tháng trước làm chỉ số cũ cho tháng sau.
4. **Cài đặt**: Đơn giá điện (đồng/kWh) và phí mặc định cho hóa đơn mới.
5. **Real-time (Socket.io)**: Cập nhật tự động tức thì trên nhiều màn hình/thiết bị mà không cần tải lại trang.

---

## 🛠️ Cấu trúc thư mục

```
/quan_li_phong_tro
├── /server          → Express + Mongoose + Socket.io REST API & WebSocket
└── /client          → React (Vite) + Socket.io Client (Giao diện sổ tay)
```

---

## ⚡ Hướng dẫn cài đặt & Chạy local

### 1. Cài đặt dependencies
Chạy lệnh tại thư mục gốc dự án:
```bash
npm run install:all
```
*Hoặc cài đặt riêng:*
```bash
cd server && npm install
cd ../client && npm install
```

### 2. Cấu hình Biến Môi Trường (`.env`)

- **Server (`/server/.env`)**:
  ```env
  PORT=5000
  MONGODB_URI=mongodb://localhost:27017/quan_li_phong_tro
  ```
  *(Nếu dùng MongoDB Atlas, dán connection string của bạn vào `MONGODB_URI`)*

- **Client (`/client/.env`)**:
  ```env
  VITE_API_URL=http://localhost:5000/api
  VITE_SOCKET_URL=http://localhost:5000
  ```

### 3. Khởi tạo dữ liệu mẫu (Seed 12 phòng)
```bash
npm run seed
```

### 4. Chạy ứng dụng
Chạy cả Backend và Frontend song song:
```bash
npm run dev
```

Hoặc chạy từng phần:
- Backend: `npm run dev:server` (chạy tại http://localhost:5000)
- Frontend: `npm run dev:client` (chạy tại http://localhost:5173)
