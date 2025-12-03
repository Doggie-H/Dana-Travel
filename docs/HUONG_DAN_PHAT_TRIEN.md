# HƯỚNG DẪN PHÁT TRIỂN & TRA CỨU TOÀN TẬP - DANA TRAVEL

> **Phiên bản**: 2.0 (Exhaustive Edition)
> **Cập nhật**: 03/12/2025
> **Mục đích**: Tài liệu này là "Cuốn bách khoa toàn thư" về dự án. Nó chứa mọi thông tin từ cơ bản đến nâng cao, không bỏ sót bất kỳ file nào.

---

# MỤC LỤC

1.  [PHẦN 1: NHẬP MÔN (Dành cho người mới)](#phần-1-nhập-môn)
2.  [PHẦN 2: CẤU HÌNH & CÀI ĐẶT (Setup)](#phần-2-cấu-hình--cài-đặt)
3.  [PHẦN 3: TRA CỨU BACKEND (Chi tiết từng file)](#phần-3-tra-cứu-backend)
4.  [PHẦN 4: TRA CỨU FRONTEND (Chi tiết từng file)](#phần-4-tra-cứu-frontend)
5.  [PHẦN 5: DATABASE & PRISMA](#phần-5-database--prisma)
6.  [PHẦN 6: CÔNG CỤ & SCRIPTS](#phần-6-công-cụ--scripts)

---

# PHẦN 1: NHẬP MÔN

*Dành cho người mới bắt đầu, giải thích các khái niệm cốt lõi một cách đơn giản.*

### 1.1 Mô hình dự án (Architecture)
Dự án hoạt động như một **Nhà Hàng**:
*   **Frontend (React)**: Là **Khu vực bàn ăn**. Khách (User) xem menu, gọi món.
*   **Backend (Node.js)**: Là **Nhà bếp**. Tiếp nhận order, chế biến món ăn.
*   **Database (SQLite)**: Là **Kho nguyên liệu**. Lưu trữ thịt, cá, rau củ (dữ liệu).
*   **AI (Gemini)**: Là **Bếp trưởng thông thái**. Tư vấn món ăn ngon khi khách hỏi khó.

### 1.2 Quy trình chạy dự án
Bạn cần mở 2 cửa sổ Terminal (cmd/powershell):

**Terminal 1 (Backend - Nhà bếp):**
```bash
cd Backend
npm run dev
# Chạy tại: http://localhost:3000
```

**Terminal 2 (Frontend - Nhà hàng):**
```bash
cd Frontend
npm run dev
# Chạy tại: http://localhost:5173
```

---

# PHẦN 2: CẤU HÌNH & CÀI ĐẶT

*Các file cấu hình nằm ở thư mục gốc, quyết định cách dự án vận hành.*

### 2.1 Root Project
| File | Chức năng |
|------|-----------|
| `audit_codebase.js` | Tool tự viết để quét lỗi code (emoji, console.log). Chạy bằng: `node audit_codebase.js`. |
| `audit_report.json` | Kết quả báo cáo từ tool trên. |
| `.gitignore` | Danh sách các file không đưa lên Git (như `node_modules`, `.env`). |

### 2.2 Backend Config (`Backend/`)
| File | Chức năng |
|------|-----------|
| `.env` | **QUAN TRỌNG**. Chứa mật khẩu, API Key. (Ví dụ: `GEMINI_API_KEY`, `DATABASE_URL`). |
| `package.json` | Khai báo thư viện Backend (Express, Prisma, Cors...). |
| `jsconfig.json` | Cấu hình gợi ý code thông minh cho VS Code. |

### 2.3 Frontend Config (`Frontend/`)
| File | Chức năng |
|------|-----------|
| `vite.config.js` | Cấu hình công cụ build Vite. (Port, Proxy, Alias). |
| `tailwind.config.js` | Cấu hình giao diện Tailwind (Màu sắc, Font chữ, Breakpoints). |
| `postcss.config.js` | Plugin xử lý CSS cho Tailwind. |
| `index.html` | File HTML gốc duy nhất. React sẽ "vẽ" giao diện vào thẻ `<div id="root">`. |

---

# PHẦN 3: TRA CỨU BACKEND

*Vị trí: `d:\Dana-Travel\Backend\src`*

### 3.1 Entry Point (Cửa ngõ)
*   **`server.js`**: File khởi động chính.
    *   Khởi tạo Express App.
    *   Cấu hình CORS (cho phép Frontend gọi).
    *   Kết nối Routes (`/api/chat`, `/api/itinerary`...).
    *   Xử lý lỗi toàn cục (Global Error Handler).

### 3.2 Services (Logic Nghiệp vụ - Bộ não)
*Nằm trong `src/services/`*

1.  **`itinerary.service.js`**: **(Core)** Thuật toán tạo lịch trình.
    *   `generateItinerary()`: Hàm chính, nhận input (ngày, tiền, sở thích) -> trả về lịch trình.
    *   Logic "Greedy": Chọn địa điểm tốt nhất trong tầm giá.
    *   Logic "TSP": Sắp xếp thứ tự đi để tối ưu quãng đường.
2.  **`chatbot.service.js`**: **(AI)** Logic Chatbot.
    *   `processChatMessage()`: Phân tích tin nhắn -> Tìm trong DB (RAG) -> Nếu không có thì hỏi Gemini.
3.  **`knowledge.service.js`**: Tìm kiếm câu trả lời mẫu trong DB (Fuzzy Search).
4.  **`location.service.js`**: Thêm/Sửa/Xóa/Tìm kiếm địa điểm.
5.  **`budget.service.js`**: Tính toán tổng chi phí chuyến đi.
6.  **`admin.service.js`**: Xử lý đăng nhập Admin, mã hóa mật khẩu (bcrypt).
7.  **`chatLog.service.js`**: Lưu lịch sử chat vào DB.

### 3.3 Controllers (Người điều phối)
*Nằm trong `src/controllers/`*

*   **`itinerary.controller.js`**: Nhận request tạo lịch trình -> Gọi Service -> Trả JSON.
*   **`chat.controller.js`**: Nhận tin nhắn -> Gọi Chatbot Service -> Trả lời.
*   **`location.controller.js`**: API CRUD cho địa điểm.

### 3.4 Routes (Đường dẫn API)
*Nằm trong `src/routes/`*

*   **`admin.routes.js`**: API quản trị (Login, Stats, Manage Data). Có bảo mật.
*   **`itinerary.routes.js`**: `POST /generate`.
*   **`chat.routes.js`**: `POST /message`.
*   **`location.routes.js`**: `GET /list`, `GET /search`.

### 3.5 Adapters (Cổng kết nối)
*Nằm trong `src/adapters/`*

*   **`gemini.adapter.js`**: Code giao tiếp với Google Gemini API.
    *   `buildSystemPrompt()`: Tạo "nhân cách" cho AI (Hướng dẫn viên vui tính).
    *   `callGeminiAPI()`: Gửi request HTTP sang Google.
*   **`maps.adapter.js`**: (Placeholder) Để mở rộng kết nối Google Maps sau này.

### 3.6 Middleware (Bảo vệ & Tiện ích)
*Nằm trong `src/middleware/`*

*   **`adminAuth.middleware.js`**: Chặn người lạ truy cập trang Admin. Kiểm tra Cookie `admin_token`.
*   **`logger.middleware.js`**: Ghi lại mọi request vào console để debug.
*   **`error.handler.middleware.js`**: Bắt lỗi crash server và trả về thông báo đẹp.

### 3.7 Utils (Công cụ nhỏ)
*Nằm trong `src/utils/`*

*   **`prisma.js`**: Khởi tạo kết nối Database (Singleton).
*   **`format.utils.js`**: Format tiền (100.000đ), ngày tháng.
*   **`time.utils.js`**: Cộng trừ giờ, kiểm tra giờ mở cửa.
*   **`array.utils.js`**: Hàm random, shuffle mảng.

---

# PHẦN 4: TRA CỨU FRONTEND

*Vị trí: `d:\Dana-Travel\Frontend\src`*

### 4.1 Core (Cốt lõi)
*   **`main.jsx`**: Điểm khởi đầu của React.
*   **`App.jsx`**: Layout chính (Header + Outlet + Footer).
*   **`styles/main.css`**: CSS toàn cục (Tailwind directives).

### 4.2 Pages (Màn hình chính)
*Nằm trong `src/pages/`*

1.  **`HomePage.jsx`**: Trang chủ. Chứa Banner và Form lập kế hoạch.
2.  **`ItineraryResultsPage.jsx`**: Trang hiển thị kết quả lịch trình chi tiết.
3.  **`ChatPage.jsx`**: Trang chat full-screen với AI.
4.  **`AdminDashboardPage.jsx`**: Trang quản trị viên (cần đăng nhập).

### 4.3 Features (Tính năng chi tiết)
*Nằm trong `src/features/`*

#### A. Trip Form (`trip-form/`)
*   **`TripPlanningForm.jsx`**: Form nhập liệu phức tạp (Ngày, Tiền, Sở thích). Logic validate dữ liệu rất kỹ ở đây.

#### B. Itinerary (`itinerary/`)
*   **`ItineraryCard.jsx`**: Thẻ hiển thị tóm tắt 1 ngày.
*   **`ItineraryItem.jsx`**: Dòng hiển thị 1 địa điểm (Giờ, Tên, Giá).
*   **`ItinerarySummary.jsx`**: Bảng tổng kết chi phí.

#### C. Bot (`bot/`)
*   **`ChatMessage.jsx`**: Bong bóng chat. Xử lý hiển thị Markdown và Quick Replies (nút bấm nhanh).

#### D. Admin (`admin/`)
*   **`AdminLogin.jsx`**: Form đăng nhập.
*   **`AdminLayout.jsx`**: Sidebar menu của Admin.
*   **`AdminDashboard.jsx`**: Biểu đồ thống kê (Chart.js).
*   **`AdminLocations.jsx`**: Bảng quản lý địa điểm (Thêm/Sửa/Xóa).
*   **`AdminKnowledge.jsx`**: Bảng dạy AI (Thêm câu hỏi mẫu).
*   **`AdminAccounts.jsx`**: Quản lý nhân viên.
*   **`AdminChatLogs.jsx`**: Xem trộm lịch sử chat của khách (để cải thiện AI).
*   **`utils/permissions.js`**: Phân quyền (Ai được làm gì).

### 4.4 Common Components (Dùng chung)
*Nằm trong `src/components/`*

*   **`Header.jsx`**: Menu trên cùng.
*   **`Footer.jsx`**: Chân trang.
*   **`Loading.jsx`**: Vòng quay loading.
*   **`Notification.jsx`**: Thông báo nổi (Toast message).
*   **`ErrorBoundary.jsx`**: Màn hình báo lỗi "Oops!" khi web bị crash.

### 4.5 Services (Giao tiếp Backend)
*Nằm trong `src/services/`*

*   **`api.service.js`**: Hàm gọi API (`fetch` wrapper). Tự động thêm Token vào Header.
*   **`storage.service.js`**: Quản lý `localStorage` (Lưu lịch trình tạm, Token).

---

# PHẦN 5: DATABASE & PRISMA

*Vị trí: `d:\Dana-Travel\Backend\prisma`*

### 5.1 Schema (`schema.prisma`)
Định nghĩa cấu trúc dữ liệu:
*   `model Location`: Địa điểm (Tên, Giá, Tọa độ, Tags...).
*   `model Itinerary`: Lịch trình đã tạo.
*   `model Admin`: Tài khoản quản trị.
*   `model Knowledge`: Dữ liệu tri thức cho AI.
*   `model ChatLog`: Lịch sử chat.

### 5.2 Seeding (`seed.js`)
Script nạp dữ liệu mẫu.
*   Chạy lệnh: `npx prisma db seed`.
*   Tác dụng: Xóa sạch DB cũ -> Nạp Admin mặc định (`admin`/`admin123`) -> Nạp 50+ địa điểm mẫu từ `data/locations.js`.

### 5.3 Data (`data/locations.js`)
File chứa dữ liệu thô (JSON) của các địa điểm du lịch Đà Nẵng.

---

# PHẦN 6: CÔNG CỤ & SCRIPTS

### 6.1 Scripts (Trong `package.json`)
*   `npm run dev`: Chạy server/web ở chế độ Dev.
*   `npm run build`: Đóng gói dự án để deploy.
*   `npm run lint`: Kiểm tra lỗi cú pháp.

### 6.2 Audit Tool (`audit_codebase.js`)
Tool tự động kiểm tra chất lượng code.
*   **Chức năng**: Quét toàn bộ file `.js`, `.jsx`.
*   **Tìm kiếm**:
    *   Emoji (🚫 Không được dùng trong code).
    *   `console.log` (🚫 Phải xóa trước khi nộp).
    *   `TODO` (🚫 Phải làm xong hết).
*   **Kết quả**: Ghi vào `audit_report.json`.

---


---

# PHẦN 7: HƯỚNG DẪN THAO TÁC & TƯ DUY LOGIC (HOW-TO)

*Phần này hướng dẫn bạn cách "đụng tay" vào code: Thêm, Sửa, Xóa và hiểu luồng đi của dữ liệu.*

### 7.1 Tư duy Luồng Dữ Liệu (Data Flow)
Trước khi sửa code, bạn phải hiểu dữ liệu chạy như thế nào. Quy tắc bất di bất dịch:
**Frontend (Gửi Request) -> Backend (Route -> Controller -> Service -> DB) -> Backend (Trả Response) -> Frontend (Nhận & Hiển thị)**

### 7.2 Hướng dẫn Thêm Tính Năng Mới (Ví dụ: Thêm "Tin Tức")

**Bước 1: Database (Kho chứa)**
1.  Mở `Backend/prisma/schema.prisma`.
2.  Thêm model mới:
    ```prisma
    model News {
      id      String @id @default(uuid())
      title   String
      content String
    }
    ```
3.  Chạy lệnh cập nhật DB: `npx prisma migrate dev --name add_news` (Tại thư mục Backend).

**Bước 2: Backend (Xử lý)**
1.  **Service**: Tạo `src/services/news.service.js`. Viết hàm `createNews`, `getNews` gọi `prisma.news.create`.
2.  **Controller**: Tạo `src/controllers/news.controller.js`. Viết hàm nhận `req.body` và gọi Service.
3.  **Route**: Tạo `src/routes/news.routes.js`. Định nghĩa `POST /`, `GET /`.
4.  **Đăng ký Route**: Mở `src/server.js`, thêm `app.use('/api/news', newsRoutes)`.

**Bước 3: Frontend (Giao diện)**
1.  **API**: Mở `src/services/api.service.js`, thêm hàm `fetchNews()`.
2.  **Page**: Tạo `src/pages/NewsPage.jsx`.
3.  **Component**: Dùng `useEffect` để gọi `fetchNews()` và hiển thị dữ liệu ra màn hình.
4.  **Route**: Mở `src/main.jsx` (hoặc `App.jsx`), thêm `<Route path="/news" element={<NewsPage />} />`.

### 7.3 Hướng dẫn Sửa Logic (Ví dụ: Đổi cách tính tiền)

**Tình huống**: Bạn muốn tăng giá vé tham quan lên 10%.
1.  **Xác định vị trí**: Logic tính tiền nằm ở đâu? -> `Backend/src/services/budget.service.js`.
2.  **Tìm code**: Tìm hàm `calculateTotal()`.
3.  **Sửa code**: Tìm đoạn cộng `ticketPrice`. Sửa thành `ticketPrice * 1.1`.
4.  **Kiểm tra**: Ra Frontend, tạo thử lịch trình xem giá tổng đã tăng chưa.

### 7.4 Hướng dẫn Xóa Tính Năng (Ví dụ: Xóa "Chatbot")

**Nguyên tắc**: Xóa từ ngoài vào trong (Frontend -> Backend -> DB).
1.  **Frontend**:
    *   Xóa file `src/pages/ChatPage.jsx`.
    *   Xóa file `src/features/bot/`.
    *   Vào `App.jsx` xóa dòng `<Route path="/chat" ... />`.
    *   Vào `Header.jsx` xóa nút "Chat".
2.  **Backend**:
    *   Vào `server.js`, xóa dòng `app.use('/api/chat', ...)`.
    *   Xóa file `src/routes/chat.routes.js`.
    *   Xóa file `src/controllers/chat.controller.js`.
    *   Xóa file `src/services/chatbot.service.js`.
3.  **Database** (Nếu cần):
    *   Vào `schema.prisma`, xóa model `ChatLog`.
    *   Chạy `npx prisma migrate dev --name remove_chat`.

### 7.5 Cách Debug (Sửa lỗi)
Khi bấm nút mà "không có gì xảy ra" hoặc lỗi đỏ lòm:

1.  **F12 (Frontend)**: Mở Console của trình duyệt.
    *   Nếu thấy lỗi đỏ: Đọc xem nó báo file nào, dòng mấy.
    *   Nếu thấy lỗi 404/500: Là lỗi do Backend.
2.  **Terminal (Backend)**: Xem cửa sổ chạy server Node.js.
    *   Nó sẽ in ra lỗi chi tiết (nhờ `logger.middleware.js`).
    *   Đọc dòng lỗi: Ví dụ `ReferenceError: x is not defined` -> Biến x chưa khai báo.

---

**TỔNG KẾT**:
Tài liệu này đã bao phủ 100% các file trong dự án. Nếu bạn gặp file nào không có trong danh sách này, đó có thể là file rác hoặc file tự sinh ra (như `package-lock.json`, `.DS_Store`). Hãy xóa nó đi nếu không cần thiết.

Chúc bạn làm chủ hoàn toàn dự án này! 🚀
