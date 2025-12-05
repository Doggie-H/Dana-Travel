# Báo Cáo Chi Tiết Toàn Bộ Hệ Thống (Exhaustive System Report)

Báo cáo này liệt kê và giải thích chi tiết **TẤT CẢ** các file mã nguồn trong dự án, đảm bảo không bỏ sót bất kỳ thành phần nào.

---

## I. BACKEND (`Backend`)

### 1. Root Configuration (Thư mục gốc)

#### `package.json`
*   **Mục đích**: Quản lý dự án Node.js.
*   **Nội dung**: Khai báo tên dự án, version, scripts (start, dev) và các thư viện phụ thuộc (dependencies).

#### `.env`
*   **Mục đích**: Biến môi trường (Environment Variables).
*   **Nội dung**: Chứa thông tin nhạy cảm như `DATABASE_URL`, `GEMINI_API_KEY`, `PORT`.

#### `.gitignore`
*   **Mục đích**: Cấu hình Git.
*   **Logic**: Chỉ định các file/thư mục không nên đưa lên Git (ví dụ: `node_modules`, `.env`).

### 2. Database (`Backend/prisma`)

#### `prisma/schema.prisma`
*   **Mục đích**: Định nghĩa cấu trúc Database (Schema).
*   **Nội dung**: Mô tả các bảng (Models) như `Location`, `Itinerary`, `Admin` và mối quan hệ giữa chúng.

#### `prisma/seed.js`
*   **Mục đích**: Dữ liệu mẫu (Seed Data).
*   **Logic**: Script chạy một lần để nạp dữ liệu ban đầu vào database (ví dụ: danh sách địa điểm, admin mặc định).

### 3. Source Code (`Backend/src`)

#### `src/server.js`
*   **Mục đích**: Điểm khởi chạy (Entry Point) của Backend.
*   **Liên kết**: Import tất cả Routes, Middleware và cấu hình Database.
*   **Logic**: Khởi tạo Express App, cấu hình CORS, Body Parser, Static Files, và lắng nghe port (3001).
*   **Kết quả**: Server chạy, sẵn sàng nhận request.

#### `config/app.constants.js`
*   **Mục đích**: Lưu trữ các hằng số dùng chung toàn hệ thống.
*   **Nội dung**: Các giá trị cố định như chi phí vận chuyển (`TRANSPORT_COSTS`), loại địa điểm, v.v.
*   **Kết quả**: Giúp quản lý cấu hình tập trung, dễ dàng thay đổi giá cả/tham số mà không cần sửa code logic.

### 2. Adapters (Kết nối bên ngoài)

#### `adapters/gemini.adapter.js`
*   **Mục đích**: Giao tiếp với Google Gemini API (AI).
*   **Logic**: Gửi prompt (câu hỏi + ngữ cảnh) lên Google, nhận về text trả lời.
*   **Kết quả**: Cung cấp trí tuệ cho Chatbot.

### 3. Middleware (Lớp trung gian)

#### `middleware/adminAuth.middleware.js`
*   **Mục đích**: Bảo vệ các API Admin.
*   **Logic**: Kiểm tra Cookie/Token trong request. Nếu hợp lệ -> cho qua, nếu không -> trả về lỗi 401.
*   **Kết quả**: Đảm bảo chỉ Admin mới truy cập được trang quản trị.

#### `middleware/error.handler.middleware.js`
*   **Mục đích**: Xử lý lỗi tập trung.
*   **Logic**: Bắt tất cả lỗi (Exception) xảy ra trong quá trình xử lý request và trả về format JSON chuẩn cho Frontend.
*   **Kết quả**: Tránh crash server, Frontend luôn nhận được phản hồi rõ ràng.

#### `middleware/logger.middleware.js`
*   **Mục đích**: Ghi log request.
*   **Logic**: Ghi lại thông tin (IP, URL, Method, Thời gian) của mỗi request vào console hoặc file.
*   **Kết quả**: Giúp debug và theo dõi lưu lượng truy cập.

### 4. Routes (Định tuyến API)

#### `routes/admin.routes.js`
*   **Mục đích**: Định nghĩa API cho Admin Panel.
*   **Endpoints**: Login, CRUD Locations, Stats, Logs.
*   **Kết quả**: Cung cấp backend cho trang Admin Dashboard.

#### `routes/chat.routes.js`
*   **Mục đích**: Định nghĩa API Chat.
*   **Endpoint**: `POST /api/chat`.
*   **Kết quả**: Nhận tin nhắn từ user.

#### `routes/itinerary.routes.js`
*   **Mục đích**: Định nghĩa API tạo lịch trình.
*   **Endpoint**: `POST /api/itinerary/generate`.
*   **Kết quả**: Nhận yêu cầu tạo lịch trình.

#### `routes/location.routes.js`
*   **Mục đích**: Định nghĩa API tìm kiếm địa điểm.
*   **Endpoint**: `GET /api/location/search`.
*   **Kết quả**: Trả về danh sách địa điểm.

### 5. Controllers (Xử lý Request)

#### `controllers/chat.controller.js`
*   **Mục đích**: Nhận request chat, gọi service xử lý.
*   **Logic**: Lấy message từ body -> Gọi `chatbot.service` -> Trả kết quả.

#### `controllers/itinerary.controller.js`
*   **Mục đích**: Nhận request tạo lịch trình.
*   **Logic**: Validate dữ liệu đầu vào -> Gọi `itinerary.service` -> Trả kết quả.

#### `controllers/location.controller.js`
*   **Mục đích**: Nhận request tìm kiếm.
*   **Logic**: Lấy query params -> Gọi `location.service` -> Trả kết quả.

### 6. Services (Logic nghiệp vụ)

#### `services/admin.service.js`
*   **Mục đích**: Logic quản lý tài khoản Admin.
*   **Logic**: Tạo Admin, xác thực mật khẩu (Login), đổi mật khẩu.

#### `services/budget.service.js`
*   **Mục đích**: Tính toán ngân sách chi tiết.
*   **Logic**: Ước tính chi phí khách sạn, ăn uống, di chuyển dựa trên số người và thời gian.

#### `services/chatLog.service.js`
*   **Mục đích**: Quản lý lịch sử chat.
*   **Logic**: Lưu tin nhắn vào database, lấy lịch sử chat gần đây.

#### `services/chatbot.service.js`
*   **Mục đích**: Logic chính của Chatbot.
*   **Logic**:
    1.  Kiểm tra Knowledge Base (câu hỏi thường gặp).
    2.  Nếu không có, gọi Gemini AI.
    3.  Xử lý các intent đặc biệt (tìm quán ăn, đổi địa điểm).

#### `services/itinerary.service.js`
*   **Mục đích**: Logic tạo lịch trình (Core Feature).
*   **Logic**: Thuật toán sắp xếp địa điểm, tối ưu thời gian và chi phí.

#### `services/knowledge.service.js`
*   **Mục đích**: Quản lý dữ liệu huấn luyện Chatbot.
*   **Logic**: Thêm/Sửa/Xóa các cặp câu hỏi-câu trả lời mẫu.

#### `services/location.service.js`
*   **Mục đích**: Truy xuất dữ liệu địa điểm từ Database.
*   **Logic**: Các hàm CRUD (Create, Read, Update, Delete) cho bảng Location.

### 7. Utils (Tiện ích)

#### `utils/array.utils.js`
*   **Mục đích**: Các hàm xử lý mảng.
*   **Hàm**: `pickRandom` (chọn ngẫu nhiên), `shuffle` (trộn).

#### `utils/format.utils.js`
*   **Mục đích**: Các hàm định dạng dữ liệu.
*   **Hàm**: `formatCurrency` (VND), `formatDate`, `formatTime`.

#### `utils/prisma.js`
*   **Mục đích**: Khởi tạo Prisma Client.
*   **Kết quả**: Kết nối Database duy nhất dùng chung cho toàn app.

#### `utils/time.utils.js`
*   **Mục đích**: Các hàm xử lý thời gian phức tạp.
*   **Hàm**: `addMinutes`, `generateDateRange`, `parseTimeOnDate`.

---

## II. FRONTEND (`Frontend`)

### 1. Root Configuration (Thư mục gốc)

#### `package.json`
*   **Mục đích**: Quản lý dự án React.
*   **Nội dung**: Khai báo dependencies (React, Vite, Tailwind...) và scripts build.

#### `vite.config.js`
*   **Mục đích**: Cấu hình Vite (Build Tool).
*   **Logic**: Thiết lập Proxy cho API (chuyển hướng `/api` sang Backend port 3001) để tránh lỗi CORS khi dev.

#### `tailwind.config.js`
*   **Mục đích**: Cấu hình Tailwind CSS.
*   **Logic**: Định nghĩa các đường dẫn file cần scan class CSS (`content`) và mở rộng theme (màu sắc, font).

#### `postcss.config.js`
*   **Mục đích**: Cấu hình PostCSS.
*   **Logic**: Plugin xử lý CSS (Autoprefixer, Tailwind).

#### `index.html`
*   **Mục đích**: File HTML chính.
*   **Logic**: Chứa thẻ `<div id="root"></div>` nơi React sẽ mount vào.

### 2. Source Code (`Frontend/src`)

#### `src/main.jsx`
*   **Mục đích**: Điểm khởi chạy React.
*   **Logic**: Render `App` vào thẻ `#root` trong HTML.

#### `App.jsx`
*   **Mục đích**: Component gốc, chứa Layout chính.
*   **Logic**: Định nghĩa Header, Footer và Routing Outlet. Ghi nhận Session Visit.

#### `styles/main.css`
*   **Mục đích**: File CSS toàn cục.
*   **Nội dung**: Import Tailwind CSS directives.

### 2. Components (Thành phần chung)

#### `components/Header.jsx`
*   **Mục đích**: Thanh điều hướng trên cùng.
*   **Logic**: Hiển thị Logo và Menu (Trang chủ, Chat AI...).

#### `components/Footer.jsx`
*   **Mục đích**: Chân trang.
*   **Logic**: Hiển thị thông tin bản quyền và liên kết.

#### `components/Loading.jsx`
*   **Mục đích**: Hiệu ứng loading quay vòng.
*   **Sử dụng**: Hiển thị khi đang gọi API hoặc chờ dữ liệu.

#### `components/ErrorBoundary.jsx`
*   **Mục đích**: Bắt lỗi giao diện.
*   **Logic**: Nếu một component con bị lỗi, hiển thị thông báo thay vì sập toàn bộ trang.

### 3. Pages (Màn hình chính)

#### `pages/HomePage.jsx`
*   **Mục đích**: Trang chủ.
*   **Chứa**: `TripPlanningForm` (Form nhập liệu).

#### `pages/ItineraryResultsPage.jsx`
*   **Mục đích**: Trang kết quả.
*   **Chứa**: `ItinerarySummary` (Tổng quan) và danh sách `ItineraryCard` (Chi tiết ngày).

#### `pages/ChatPage.jsx`
*   **Mục đích**: Trang Chatbot.
*   **Chứa**: Giao diện khung chat.

#### `pages/AdminDashboardPage.jsx`
*   **Mục đích**: Trang quản trị.
*   **Logic**: Kiểm tra đăng nhập -> Hiển thị `AdminLayout`.

### 4. Features (Tính năng cụ thể)

#### **Trip Form**
*   `features/trip-form/TripPlanningForm.jsx`: Form nhập thông tin (Ngày, Ngân sách, Sở thích).
*   `features/trip-form/index.js`: File export.

#### **Itinerary**
*   `features/itinerary/ItinerarySummary.jsx`: Hiển thị tổng chi phí, số ngày.
*   `features/itinerary/ItineraryCard.jsx`: Hiển thị lịch trình của **một ngày**.
*   `features/itinerary/ItineraryItem.jsx`: Hiển thị chi tiết **một hoạt động** (Giờ, Tên, Giá).
*   `features/itinerary/index.js`: File export.

#### **Bot**
*   `features/bot/ChatMessage.jsx`: Hiển thị một dòng tin nhắn (User hoặc Bot).
*   `features/bot/index.js`: File export.

#### **Admin**
*   `features/admin/AdminLogin.jsx`: Form đăng nhập Admin.
*   `features/admin/AdminLayout.jsx`: Layout trang Admin (Sidebar + Content).
*   `features/admin/components/AdminDashboard.jsx`: Biểu đồ thống kê.
*   `features/admin/components/AdminLocations.jsx`: Quản lý địa điểm (Bảng danh sách + Form thêm/sửa).
*   `features/admin/components/AdminAccounts.jsx`: Quản lý tài khoản Admin.
*   `features/admin/components/AdminKnowledge.jsx`: Quản lý dữ liệu Chatbot.
*   `features/admin/components/AdminChatLogs.jsx`: Xem lịch sử chat của user.
*   `features/admin/utils/permissions.js`: Kiểm tra quyền hạn (Role).

### 5. Services (Giao tiếp Backend)

#### `services/api.service.js`
*   **Mục đích**: Gọi API Backend.
*   **Hàm**: `generateItinerary`, `sendChatMessage`, `searchLocations`.

#### `services/storage.service.js`
*   **Mục đích**: Lưu dữ liệu vào Session Storage.
*   **Hàm**: `saveItinerary`, `loadItinerary` (giữ trạng thái khi F5).

### 6. Utils (Tiện ích Frontend)

#### `utils/format.utils.js`
*   **Mục đích**: Định dạng hiển thị.
*   **Hàm**: `formatCurrency`, `formatDate`.

---

## TỔNG KẾT

Hệ thống được chia tách rất rõ ràng theo mô hình **MVC (Model-View-Controller)** ở Backend và **Component-based** ở Frontend.

*   **Backend**:
    *   **Controller** nhận việc.
    *   **Service** làm việc.
    *   **Route** chỉ đường.
*   **Frontend**:
    *   **Page** là màn hình chính.
    *   **Feature** là các khối chức năng lớn.
    *   **Component** là các viên gạch nhỏ dùng chung.
    *   **Service** là người đưa thư (gửi/nhận dữ liệu).

Cấu trúc này đảm bảo tính logic, dễ bảo trì và mở rộng sau này.
