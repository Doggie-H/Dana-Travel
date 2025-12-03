# Dana Travel - Hệ Thống Lập Kế Hoạch Du Lịch Thông Minh

**Ứng dụng web hỗ trợ lập kế hoạch du lịch Đà Nẵng tự động với AI Chatbot**

---

## Giới Thiệu

Dana Travel là nền tảng web giúp du khách tự động lập kế hoạch du lịch tại Đà Nẵng dựa trên:
- Ngân sách có sẵn
- Thời gian đi và về
- Sở thích cá nhân (bãi biển, ẩm thực, văn hóa, v.v.)

Hệ thống kết hợp thuật toán tối ưu hóa lộ trình với AI Chatbot để tạo trải nghiệm du lịch được cá nhân hóa.

---

## Vấn Đề Cần Giải Quyết

**Các khó khăn của du khách hiện nay:**

1. **Quá tải thông tin**: Phải mất 2-3 giờ để nghiên cứu và lập kế hoạch du lịch
2. **Khó tối ưu ngân sách**: Không biết cách phân bổ chi phí hợp lý cho ăn, ở, di chuyển
3. **Lộ trình không hiệu quả**: Di chuyển lòng vòng, tốn thời gian và tiền bạc
4. **Thiếu hỗ trợ thời gian thực**: Không có tư vấn khi thay đổi kế hoạch đột xuất

**Giải pháp của Dana Travel:**

1. **Tự động tạo lịch trình** trong dưới 3 giây với thuật toán Greedy + Local Optimization
2. **Phân bổ ngân sách tự động** dựa trên số người, số ngày và loại chỗ ở
3. **Tối ưu hóa lộ trình** giảm thiểu quãng đường di chuyển (thuật toán TSP)
4. **AI Chatbot 24/7** hỗ trợ tư vấn và thay đổi kế hoạch

---

## Tính Năng Chính

### 1. Lập Lịch Trình Tự Động

**Chức năng:**
- Form đa bước thu thập thông tin: ngày giờ, ngân sách, sở thích
- Lọc địa điểm theo sở thích (bãi biển, ẩm thực, văn hóa, v.v.)
- Tự động phân bổ ngân sách cho chỗ ở, ăn uống, di chuyển, tham quan
- Lên lịch chi tiết theo giờ cho mỗi ngày
- Hiển thị trên bản đồ tương tác với lộ trình tối ưu

**Thuật toán:**
- Greedy Selection: Chọn địa điểm phù hợp với ngân sách
- TSP Optimization: Tối ưu hóa thứ tự thăm quan
- Day-by-Day Scheduling: Phân bổ thời gian hợp lý

### 2. AI Chatbot Thông Minh

**Chức năng:**
- Hiểu tiếng Việt tự nhiên ("quán ăn ngon gần đây", "trời mưa đi đâu")
- Cung cấp thông tin về địa điểm, giá vé, menu
- Gợi ý thay đổi lịch trình theo tình huống
- Trả lời câu hỏi về du lịch Đà Nẵng

**Công nghệ:**
- RAG Architecture: Kết hợp Knowledge Base với Google Gemini AI
- Intent Detection: Phát hiện ý định người dùng (rule-based + AI)
- Context-Aware: Hiểu ngữ cảnh cuộc hội thoại

### 3. Bảng Quản Trị Admin

**Chức năng:**
- Quản lý địa điểm (thêm, sửa, xóa)
- Quản lý knowledge base cho chatbot
- Xem thống kê lượt truy cập
- Phân tích xu hướng tìm kiếm
- Quản lý tài khoản admin

---

## Kiến Trúc Hệ Thống

### Tổng Quan

Hệ thống được xây dựng theo mô hình Client-Server với các tầng:

**Frontend (React)**
- Giao diện người dùng
- Tương tác với API
- Hiển thị bản đồ và lịch trình

**Backend (Node.js + Express)**
- API RESTful
- Xử lý logic nghiệp vụ
- Tích hợp AI
- Xác thực JWT

**Database (Prisma + SQLite/PostgreSQL)**
- Lưu trữ địa điểm
- Quản lý admin
- Knowledge base
- Logs và analytics

**External Services**
- Google Gemini API: Xử lý AI
- OpenStreetMap: Bản đồ

### Cấu Trúc Thư Mục

```
Dana-Travel/
├── Backend/
│   ├── src/
│   │   ├── controllers/       # Xử lý HTTP request
│   │   ├── services/          # Logic nghiệp vụ
│   │   │   ├── itinerary.service.js    # Tạo lịch trình
│   │   │   ├── chatbot.service.js      # Chatbot AI
│   │   │   ├── budget.service.js       # Tính ngân sách
│   │   │   └── location.service.js     # Quản lý địa điểm
│   │   ├── routes/            # Định tuyến API
│   │   ├── middleware/        # Middleware (Auth, Logger)
│   │   ├── adapters/          # Tích hợp API ngoài
│   │   └── utils/             # Hàm tiện ích
│   ├── prisma/
│   │   ├── schema.prisma      # Schema database
│   │   └── seed.js            # Dữ liệu mẫu
│   └── server.js              # Khởi động server
│
├── Frontend/
│   ├── src/
│   │   ├── pages/             # Các trang chính
│   │   │   ├── HomePage.jsx
│   │   │   ├── ItineraryResultsPage.jsx
│   │   │   ├── ChatPage.jsx
│   │   │   └── AdminDashboardPage.jsx
│   │   ├── features/          # Các module tính năng
│   │   │   ├── trip-form/     # Form lập lịch trình
│   │   │   ├── itinerary/     # Hiển thị lịch trình
│   │   │   ├── bot/           # Chatbot
│   │   │   └── admin/         # Quản trị
│   │   ├── components/        # Component dùng chung
│   │   ├── services/          # API client
│   │   └── styles/            # CSS
│   └── main.jsx
│
└── docs/
    ├── ARCHITECTURE.md        # Tài liệu kiến trúc
    └── API.md                 # Tài liệu API
```

---

## Công Nghệ Sử Dụng

### Frontend

- **React 18**: Framework UI
- **Vite**: Build tool
- **React Router v6**: Điều hướng
- **Tailwind CSS**: Styling
- **React-Leaflet**: Bản đồ
- **Chart.js**: Biểu đồ

### Backend

- **Node.js 18+**: Runtime
- **Express.js**: Web framework
- **Prisma**: ORM
- **SQLite** (dev) / **PostgreSQL** (production): Database
- **JWT**: Xác thực
- **bcrypt**: Mã hóa mật khẩu
- **Google Gemini API**: AI

### DevOps

- **Git**: Version control
- **npm**: Package manager
- **PM2**: Process manager (production)
- **Nginx**: Reverse proxy

---

## Hướng Dẫn Cài Đặt

### Yêu Cầu Hệ Thống

- Node.js >= 18.0.0
- npm >= 9.0.0
- Git

### Bước 1: Clone Project

```bash
git clone https://github.com/yourusername/dana-travel.git
cd dana-travel
```

### Bước 2: Cài Đặt Backend

```bash
cd Backend
npm install
```

Tạo file `.env`:
```env
DATABASE_URL="file:./dev.db"
GEMINI_API_KEY="your_gemini_api_key_here"
JWT_SECRET="your_secret_key_here"
PORT=3000
NODE_ENV=development
```

Khởi tạo database:
```bash
npx prisma migrate dev --name init
npx prisma db seed
```

### Bước 3: Cài Đặt Frontend

```bash
cd ../Frontend
npm install
```

### Bước 4: Chạy Ứng Dụng

**Terminal 1 - Backend:**
```bash
cd Backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd Frontend
npm run dev
```

**Truy cập:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

---

## Cấu Trúc Database

### Các Bảng Chính

**Location** - Địa điểm du lịch
- id, name, type, area, address
- lat, lng (tọa độ)
- ticket (giá vé)
- indoor (trong nhà hay ngoài trời)
- priceLevel (mức giá)
- tags (từ khóa)
- description, menu
- suggestedDuration (thời gian gợi ý)

**Admin** - Tài khoản quản trị
- id, username, passwordHash
- email, role, active
- lastLogin

**Knowledge** - Knowledge base cho chatbot
- id, question, answer
- keywords (từ khóa tìm kiếm)

**AccessLog** - Nhật ký truy cập
- id, timestamp
- ipAddress, userAgent

**SearchTrend** - Xu hướng tìm kiếm
- id, term, count
- updatedAt

**ChatLog** - Lịch sử chat
- id, userMessage, botResponse
- timestamp

---

## API Endpoints

### Public APIs

**POST /api/itinerary/generate**
- Tạo lịch trình tự động
- Body: arriveDateTime, leaveDateTime, numPeople, budgetTotal, preferences
- Response: Lịch trình chi tiết theo ngày

**POST /api/chat**
- Gửi tin nhắn đến chatbot
- Body: message, context
- Response: reply, quickReplies, suggestions

### Admin APIs (Cần xác thực)

**POST /api/admin/login**
- Đăng nhập admin
- Body: username, password
- Response: user, token (JWT)

**GET /api/admin/locations**
- Lấy danh sách địa điểm

**POST /api/admin/locations**
- Thêm địa điểm mới

**PUT /api/admin/locations/:id**
- Cập nhật địa điểm

**DELETE /api/admin/locations/:id**
- Xóa địa điểm

---

## Bảo Mật

### Các biện pháp bảo mật

1. **Xác thực**: JWT với HttpOnly cookies
2. **Mã hóa mật khẩu**: bcrypt với 10 salt rounds
3. **CORS**: Whitelist origins
4. **Rate Limiting**: Giới hạn 100 requests/15 phút
5. **Input Validation**: Zod schemas
6. **SQL Injection Prevention**: Prisma ORM
7. **XSS Prevention**: Input sanitization
8. **Security Headers**: Helmet.js

---

## Triển Khai Production

### Chuẩn Bị

1. **Database**: Chuyển từ SQLite sang PostgreSQL
2. **Environment Variables**: Cấu hình production
3. **Build Frontend**: `npm run build`
4. **Process Manager**: PM2 cho backend

### Các Bước Triển Khai

1. Build frontend:
```bash
cd Frontend
npm run build
```

2. Upload code lên server

3. Cài đặt dependencies:
```bash
npm install --production
```

4. Migrate database:
```bash
npx prisma migrate deploy
npx prisma db seed
```

5. Chạy với PM2:
```bash
pm2 start server.js --name dana-travel-api
pm2 save
```

6. Cấu hình Nginx reverse proxy

---

## Tài Liệu Tham Khảo

Để hiểu chi tiết hơn về hệ thống, xem các tài liệu sau:

- **docs/ARCHITECTURE.md**: Kiến trúc chi tiết với sơ đồ
- **docs/API.md**: Tài liệu API đầy đủ

---

## Thông Tin Thêm

**Phiên bản**: 1.0.0  
**Ngày cập nhật**: 2025-12-03  
**Nhóm phát triển**: Dana Travel Team

---

## Liên Hệ

Nếu có câu hỏi hoặc góp ý, vui lòng liên hệ qua:
- Email: contact@danatravel.vn
- GitHub Issues: [Project Issues](https://github.com/yourusername/dana-travel/issues)
