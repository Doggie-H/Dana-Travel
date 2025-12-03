# Dana Travel - Hệ Thống Lập Kế Hoạch Du Lịch Thông Minh

> **Chào mừng đến với Dana Travel**
>
> Ứng dụng web hỗ trợ du khách tạo lịch trình du lịch Đà Nẵng tự động, tối ưu hóa trải nghiệm với Chatbot AI tích hợp.

---

## Tài Liệu Chính

Đây là cổng thông tin chính của dự án. Vui lòng truy cập các tài liệu chi tiết dưới đây tùy theo nhu cầu tham khảo:

### 1. [HƯỚNG DẪN PHÁT TRIỂN (Dành cho Developer)](docs/HUONG_DAN_PHAT_TRIEN.md)
*   **Nội dung**: Hướng dẫn cài đặt môi trường, cấu trúc thư mục, giải thích chi tiết mã nguồn (Frontend & Backend), quy trình thêm/sửa/xóa tính năng.
*   **Đối tượng**: Lập trình viên mới tham gia dự án hoặc cần triển khai mã nguồn.

### 2. [KIẾN TRÚC HỆ THỐNG (Dành cho Architect)](docs/ARCHITECTURE.md)
*   **Nội dung**: Sơ đồ tổng quan, luồng dữ liệu (Data Flow), thuật toán cốt lõi (TSP, RAG), thiết kế Cơ sở dữ liệu, cơ chế bảo mật và chiến lược triển khai.
*   **Đối tượng**: Kiến trúc sư hệ thống hoặc người cần hiểu sâu về vận hành kỹ thuật.

---

## Tính Năng Nổi Bật

1.  **Lập Lịch Trình Tự Động**:
    *   Sử dụng thuật toán tối ưu hóa lộ trình (TSP) để giảm thiểu thời gian di chuyển.
    *   Tự động phân bổ ngân sách hợp lý cho các hạng mục: Ăn uống, Lưu trú, Vé tham quan.
2.  **AI Chatbot (Tích hợp Gemini)**:
    *   Tư vấn ngữ cảnh như hướng dẫn viên bản địa.
    *   Tra cứu thông tin vé, giờ mở cửa theo thời gian thực.
3.  **Bản Đồ Tương Tác**:
    *   Hiển thị trực quan lộ trình di chuyển chi tiết trong ngày.

## Công Nghệ Sử Dụng

*   **Frontend**: React, Vite, Tailwind CSS.
*   **Backend**: Node.js, Express.js.
*   **Database**: SQLite (Môi trường Dev) / PostgreSQL (Môi trường Prod), Prisma ORM.
*   **AI**: Google Gemini API.

## Cài Đặt Nhanh

Để chạy dự án, yêu cầu hệ thống đã cài đặt **Node.js** và **Git**.

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

## Đóng Góp

Mọi đóng góp đều được trân trọng. Vui lòng tạo **Pull Request** hoặc mở **Issue** nếu phát hiện vấn đề cần cải thiện.

---
*© 2025 Dana Travel Team.*
