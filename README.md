# Dana Travel - Hệ Thống Lập Kế Hoạch Du Lịch Thông Minh 🌏✈️

![Status](https://img.shields.io/badge/Status-Active-success)
![Version](https://img.shields.io/badge/Version-3.0-blue)
![Tech](https://img.shields.io/badge/Tech-React%20%7C%20Node.js%20%7C%20AI-orange)

> **Chào mừng đến với Dana Travel!**  
> Ứng dụng web "All-in-One" giúp du khách tạo lịch trình du lịch Đà Nẵng tự động chỉ trong 3 giây, tích hợp Chatbot AI tư vấn thông minh.

---

## 📚 Tài Liệu Chính (Documentation)

Đây là cổng thông tin chính của dự án. Vui lòng truy cập các tài liệu chi tiết dưới đây tùy theo nhu cầu của bạn:

### 1. [HƯỚNG DẪN PHÁT TRIỂN (Dành cho Developer)](docs/HUONG_DAN_PHAT_TRIEN.md) 🛠️
*   **Nội dung**: Cách cài đặt môi trường, cấu trúc thư mục, giải thích chi tiết từng file code (Frontend & Backend), hướng dẫn thêm/sửa/xóa tính năng.
*   **Đọc ngay nếu**: Bạn là dev mới tham gia dự án hoặc muốn chạy source code.

### 2. [KIẾN TRÚC HỆ THỐNG (Dành cho Architect)](docs/ARCHITECTURE.md) 🏗️
*   **Nội dung**: Sơ đồ tổng quan, luồng dữ liệu (Data Flow), thuật toán cốt lõi (TSP, RAG), thiết kế Database, bảo mật và triển khai.
*   **Đọc ngay nếu**: Bạn muốn hiểu sâu về cách hệ thống vận hành "bên dưới nắp ca-pô".

---

## ✨ Tính Năng Nổi Bật

1.  **Lập Lịch Trình Tự Động (Smart Itinerary)**:
    *   Thuật toán tối ưu hóa lộ trình (TSP) giúp tiết kiệm thời gian di chuyển.
    *   Tự động phân bổ ngân sách cho Ăn uống, Khách sạn, Vé tham quan.
2.  **AI Chatbot (Powered by Gemini)**:
    *   Tư vấn như hướng dẫn viên bản địa.
    *   Tra cứu thông tin vé, giờ mở cửa theo thời gian thực.
3.  **Bản Đồ Tương Tác**:
    *   Hiển thị trực quan lộ trình đi lại trong ngày.

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

*   **Frontend**: React, Vite, Tailwind CSS.
*   **Backend**: Node.js, Express.js.
*   **Database**: SQLite (Dev) / PostgreSQL (Prod), Prisma ORM.
*   **AI**: Google Gemini API.

## 🚀 Cài Đặt Nhanh

Để chạy dự án, bạn cần cài đặt **Node.js** và **Git**.

```bash
# 1. Clone dự án
git clone https://github.com/your-repo/dana-travel.git

# 2. Cài đặt & Chạy Backend
cd Backend
npm install
npm run dev

# 3. Cài đặt & Chạy Frontend
cd ../Frontend
npm install
npm run dev
```

*Xem hướng dẫn chi tiết tại [HUONG_DAN_PHAT_TRIEN.md](docs/HUONG_DAN_PHAT_TRIEN.md).*

## 🤝 Đóng Góp

Mọi đóng góp đều được hoan nghênh! Vui lòng tạo **Pull Request** hoặc mở **Issue** nếu bạn tìm thấy lỗi.

---
*© 2025 Dana Travel Team. Built with ❤️ in Da Nang.*
