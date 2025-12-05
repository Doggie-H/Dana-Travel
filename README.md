# DanaTravel: Hệ thống Lập Lịch Trình & Hỗ Trợ Du Lịch

## Abstract (Tóm tắt)

**DanaTravel** là ứng dụng web thông minh được thiết kế để tối ưu hóa trải nghiệm du lịch tại Đà Nẵng. Hệ thống kết hợp thuật toán lập lịch trình (Constraint Satisfaction Algorithm) với trí tuệ nhân tạo (Google Gemini LLM) để cung cấp giải pháp du lịch cá nhân hóa. Dự án giải quyết vấn đề quá tải thông tin và khó khăn trong việc lên kế hoạch của khách du lịch.

---

## 1. Giới thiệu

Ngành du lịch đang chuyển đổi số mạnh mẽ. DanaTravel đóng vai trò là một trợ lý du lịch ảo, cung cấp:
- **Lập lịch trình tự động:** Dựa trên ngân sách, thời gian, sở thích và logic địa lý.
- **Chatbot thông minh:** Hỗ trợ giải đáp thắc mắc, gợi ý real-time.
- **Thông tin phong phú:** Cơ sở dữ liệu chi tiết về địa điểm, ẩm thực, văn hóa.

> 📚 **Tài liệu tham khảo chi tiết:**
> - [Kiến trúc hệ thống (Architecture)](./docs/ARCHITECTURE.md)
> - [Hướng dẫn phát triển (Developer Guide)](./docs/HUONG_DAN_PHAT_TRIEN.md)
> - [Hướng dẫn cơ chế ngân sách (Budget Guide)](./docs/BUDGET_GUIDE.md)
> - [Tài liệu API (API Docs)](./docs/API.md)

---

## 2. Kiến trúc Hệ thống

Hệ thống tuân theo kiến trúc **Client-Server** hiện đại:

### 2.1 Sơ đồ tổng quan

```mermaid
graph TD
    User[Người dùng] -->|HTTPS| Client[Frontend (React/Vite)]
    Client -->|REST API| Server[Backend (Node.js/Express)]
    Server -->|ORM| DB[(SQLite/Prisma)]
    Server -->|API| Gemini[Google Gemini AI]
    Admin[Quản trị viên] -->|CMS| Client
```

### 2.2 Thành phần công nghệ

| Thành phần | Công nghệ | Vai trò |
| :--- | :--- | :--- |
| **Frontend** | React 18, Vite, TailwindCSS | Giao diện người dùng, tương tác bản đồ, hiển thị lịch trình |
| **Backend** | Node.js, Express | Xử lý logic nghiệp vụ, API, xác thực (JWT) |
| **Database** | SQLite, Prisma ORM | Lưu trữ dữ liệu quan hệ (Locations, Users, Itineraries) |
| **AI Engine** | Google Gemini 1.5 | Xử lý ngôn ngữ tự nhiên, RAG (Retrieval-Augmented Generation) |

---

## 3. Tính năng chính

### 3.1 Tạo Lịch Trình (Smart Itinerary)
Sử dụng thuật toán `generate-day-schedule-strict` để xây dựng lộ trình từng ngày:
- **Tối ưu hóa:** Khoảng cách di chuyển, chi phí, giờ mở cửa.
- **Cá nhân hóa:** Ưu tiên địa điểm theo sở thích (Biển, Văn hóa, Ẩm thực...).
- **Chi tiết:** Bao gồm chi phí di chuyển (Grab/Taxi), vé tham quan, tiền ăn.

### 3.2 AI Chatbot
Chatbot hỗ trợ ngữ cảnh, sử dụng RAG để truy xuất thông tin chính xác từ Database trước khi trả lời, giảm thiểu ảo giác (hallucination) của AI.

### 3.3 Dashboard Quản trị
CMS cho phép admin quản lý, chỉnh sửa dữ liệu địa điểm, xem thống kê người dùng.

---

## 4. Cài đặt và Triển khai

### Yêu cầu
- Node.js v16+
- npm hoặc yarn

### Các bước cài đặt

1.  **Clone dự án**
    ```bash
    git clone https://github.com/your-repo/Dana-Travel.git
    cd Dana-Travel
    ```

2.  **Cài đặt Backend**
    ```bash
    cd Backend
    npm install
    cp .env.example .env
    # Cấu hình .env (DATABASE_URL, GEMINI_API_KEY...)
    npx prisma migrate dev
    npx prisma db seed
    npm run dev
    ```

3.  **Cài đặt Frontend**
    ```bash
    cd Frontend
    npm install
    cp .env.example .env
    # Cấu hình VITE_API_BASE_URL
    npm run dev
    ```

4.  **Truy cập**
    - Web App: `http://localhost:5173`
    - API Server: `http://localhost:3000`

---

## 5. Bảo mật

**QUAN TRỌNG:** Không bao giờ commit file `.env` chứa API Key lên GitHub.
- Dự án đã cấu hình `.gitignore` để loại bỏ các file nhạy cảm.
- Vui lòng sử dụng `.env.example` làm mẫu cấu hình.

---

*Báo cáo Đồ án - 2025*
