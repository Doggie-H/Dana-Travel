# Tên Dự Án: DanangTravel-AI - Hệ thống Lên lịch trình Du lịch Đà Nẵng Tự động

## 1. Giới thiệu (Introduction)
**DanangTravel-AI** là một hệ thống web thông minh tích hợp **Generative AI (Trí tuệ nhân tạo tạo sinh)** nhằm giải quyết bài toán cá nhân hóa trải nghiệm du lịch. Thay vì sử dụng các lịch trình mẫu cứng nhắc, hệ thống sử dụng thuật toán **Heuristic Scheduling** kết hợp với mô hình ngôn ngữ lớn (**LLM - Google Gemini**) để tự động thiết kế lộ trình tham quan tối ưu theo thời gian thực.

Dự án tập trung vào việc xử lý ngôn ngữ tự nhiên (NLP) để hiểu nhu cầu du khách, đồng thời áp dụng các ràng buộc logic (thời gian, ngân sách, khoảng cách địa lý) để đảm bảo lịch trình tạo ra không chỉ "thông minh" mà còn "khả thi".

## 2. Tính năng chính (Key Features)

### 🤖 Hybrid Chatbot (Trợ lý ảo lai)
Kết hợp sức mạnh của hai cơ chế xử lý:
-   **Rule-based Processing**: Xử lý tức thì các tác vụ cụ thể (Tra cứu thời tiết, Tìm địa điểm, Xuất PDF) với độ chính xác 100%.
-   **Generative AI (Gemini Agent)**: Xử lý các hội thoại tự do, hiểu ngữ cảnh và đưa ra gợi ý sáng tạo khi người dùng không có yêu cầu cụ thể.

### 📅 Intelligent Itinerary Generation (Lập lịch thông minh)
Hệ thống tự động xây dựng kế hoạch du lịch chi tiết theo từng ngày dựa trên thuật toán tham lam (Greedy Algorithm) có điều chỉnh:
-   **Tối ưu hóa đa mục tiêu**: Cân bằng giữa Sở thích (Preferences), Khoảng cách di chuyển (Distance Minimization) và Ngân sách (Budget Constraints).
-   **Phân bổ khe thời gian (Time-slot Allocation)**: Chia ngày thành các giai đoạn (Sáng, Trưa, Chiều, Tối) và lấp đầy bằng các hoạt động phù hợp (Tham quan, Ăn uống, Nghỉ ngơi).

### 🗺️ Context-Aware Location Services (Dịch vụ địa điểm theo ngữ cảnh)
-   **Dynamic Suggestions**: Gợi ý địa điểm thay thế dựa trên vị trí hiện tại của người dùng.
-   **Weather Adaptation**: Tự động đề xuất các địa điểm trong nhà (`indoor: true`) khi phát hiện từ khóa về thời tiết xấu.

### 📊 Admin Dashboard (Quản trị hệ thống)
-   Quản lý cơ sở dữ liệu địa điểm, danh mục và phương tiện.
-   Theo dõi hành vi người dùng thông qua biểu đồ xu hướng tìm kiếm và nhật ký truy cập (Access Logs).

## 3. Công nghệ sử dụng (Tech Stack)
-   **Frontend**: ReactJS (Vite), Tailwind CSS, Recharts (Data Visualization).
-   **Backend**: Node.js, Express.js (RESTful API).
-   **Database**: SQLite (Dev) / PostgreSQL (Prod), quản lý qua **Prisma ORM**.
-   **AI Core**: Google Gemini 1.5/2.5 Flash (via Google AI Studio).
-   **Algorithms**: Distance Matrix Calculation, Constraint Satisfaction Problem (CSP).

## 4. Hướng dẫn cài đặt (Installation)
1.  **Clone repository**:
    ```bash
    git clone https://github.com/username/Dana-Travel.git
    cd Dana-Travel
    ```
2.  **Cài đặt Backend**:
    ```bash
    cd Backend
    npm install
    # Tạo file .env và cấu hình (xem bên dưới)
    npx prisma db push  # Đồng bộ cấu trúc DB
    npm run seed        # Nạp dữ liệu mẫu
    npm run dev         # Khởi chạy Server (Port 3000)
    ```
3.  **Cài đặt Frontend**:
    ```bash
    cd Frontend
    npm install
    npm run dev         # Khởi chạy Client (Port 5173)
    ```
