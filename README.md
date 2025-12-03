# Dana Travel - Hệ Thống Lập Kế Hoạch Du Lịch Thông Minh

> **Tổng Quan**
>
> Dana Travel là giải pháp công nghệ hỗ trợ du khách tự động hóa quy trình lập kế hoạch du lịch tại Đà Nẵng, kết hợp thuật toán tối ưu hóa và trí tuệ nhân tạo.

---

## Bối Cảnh & Mục Tiêu

Du lịch tự túc mang lại sự tự do nhưng thường đi kèm với thách thức trong việc tìm kiếm thông tin, sắp xếp lịch trình và quản lý chi phí. Du khách thường mất nhiều giờ để tra cứu, so sánh và tổng hợp dữ liệu từ nhiều nguồn khác nhau.

**Dana Travel** được phát triển để giải quyết vấn đề này bằng cách cung cấp một nền tảng "All-in-One". Hệ thống đóng vai trò như một trợ lý ảo, tự động phân tích nhu cầu, ngân sách và sở thích để đề xuất một lộ trình tối ưu nhất, giúp tiết kiệm thời gian và nâng cao trải nghiệm chuyến đi.

## Luồng Trải Nghiệm Người Dùng

Hệ thống được thiết kế để đơn giản hóa tối đa các thao tác của người dùng:

1.  **Tiếp nhận nhu cầu**: Người dùng cung cấp các thông tin cơ bản: thời gian lưu trú, ngân sách dự kiến và các sở thích cá nhân (ẩm thực, văn hóa, nghỉ dưỡng...).
2.  **Xử lý & Tối ưu hóa**: Hệ thống áp dụng thuật toán để lựa chọn các điểm đến phù hợp nhất trong cơ sở dữ liệu, đồng thời sắp xếp thứ tự di chuyển để giảm thiểu quãng đường và thời gian.
3.  **Đề xuất lịch trình**: Kết quả trả về là một kế hoạch chi tiết theo từng khung giờ, bao gồm gợi ý địa điểm tham quan, ăn uống và nơi ở, kèm theo dự toán chi phí cụ thể.
4.  **Hỗ trợ thời gian thực**: Trong quá trình trải nghiệm, Chatbot AI luôn sẵn sàng cung cấp thông tin, giải đáp thắc mắc hoặc gợi ý các phương án thay thế khi có thay đổi (thời tiết xấu, thay đổi sở thích).

---

## Tài Liệu Kỹ Thuật

Dự án cung cấp tài liệu chuyên sâu về thiết kế và vận hành hệ thống:

### [KIẾN TRÚC HỆ THỐNG](docs/ARCHITECTURE.md)
Mô tả chi tiết thiết kế tổng thể, các luồng dữ liệu, sơ đồ thực thể mối quan hệ (ERD), thuật toán xử lý và các cơ chế bảo mật được áp dụng trong dự án.

---

## Tính Năng Chính

*   **Tự động hóa lịch trình**: Phân tích và tạo kế hoạch du lịch chi tiết dựa trên dữ liệu đầu vào.
*   **Tư vấn thông minh**: Chatbot tích hợp AI hỗ trợ tra cứu thông tin và xử lý các tình huống phát sinh.
*   **Trực quan hóa dữ liệu**: Hiển thị lộ trình trên bản đồ tương tác, giúp người dùng dễ dàng hình dung và di chuyển.

## Nền Tảng Công Nghệ

Dự án được xây dựng trên nền tảng các công nghệ web hiện đại:

*   **Frontend**: React, Vite, Tailwind CSS.
*   **Backend**: Node.js, Express.js.
*   **Database**: SQLite / PostgreSQL, Prisma ORM.
*   **AI Integration**: Google Gemini API.

## Hướng Dẫn Cài Đặt

Yêu cầu hệ thống: Node.js và Git.

```bash
# 1. Sao chép mã nguồn
git clone https://github.com/your-repo/dana-travel.git

# 2. Khởi chạy Backend
cd Backend
npm install
npm run dev

# 3. Khởi chạy Frontend
cd ../Frontend
npm install
npm run dev
```

## Đóng Góp & Phát Triển

Dự án luôn hoan nghênh các ý kiến đóng góp và đề xuất cải tiến từ cộng đồng để ngày càng hoàn thiện hơn.

---
*Dana Travel Project - 2025*
