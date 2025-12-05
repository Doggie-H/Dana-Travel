# DanangTravel-AI: Hệ Thống Lên Lịch Trình Du Lịch Thông Minh

Một ứng dụng web hiện đại giúp du khách tự động lập lịch trình du lịch tối ưu đến Đà Nẵng. Hệ thống kết hợp trí tuệ nhân tạo (AI) với các thuật toán lập lịch thông minh để tạo ra những chuyến đi phù hợp với ngân sách, thời gian và sở thích của từng người.

## Tình Huống Thực Tế

Bạn đang có 3 ngày nghỉ, ngân sách 2 triệu, muốn ghé những nơi biển đẹp, ăn những đặc sản địa phương. Thay vì mất giờ lên Google Maps, kiếm thông tin từ 10 trang web khác nhau, DanangTravel-AI sẽ tự động thiết kế một chuyến đi hoàn chỉnh cho bạn - từ khách sạn, đến những địa điểm tham quan, thời gian di chuyển, và cách sắp xếp khôn ngoan để không quá tải và không lãng phí thời gian.

## Tính Năng Chính

### 1. Tạo Lịch Trình Tự Động

Hệ thống phân tích yêu cầu của bạn và tự động tạo lịch trình chi tiết:

- **Tính toán ngân sách thông minh**: Phân bổ chi phí hợp lý cho lưu trú, ăn uống, vé vào và di chuyển
- **Tối ưu hóa khoảng cách**: Sắp xếp thứ tự các địa điểm để giảm thời gian di chuyển
- **Cân nhắc giờ mở cửa**: Chỉ chọn những nơi đang hoạt động vào thời gian bạn muốn ghé
- **Tránh lặp lại**: Không cho phép ghé cùng loại địa điểm nhiều lần trong một ngày
- **Dự phòng thời gian**: Tính toán kỹ lưỡng bao gồm cả thời gian đi lại và nghỉ ngơi

### 2. Trợ Lý AI Tương Tác

Chat trực tiếp với trợ lý để:

- Thay đổi lịch trình (thêm, bớt, hoán đổi hoạt động)
- Hỏi các thông tin về địa điểm, nhà hàng
- Tối ưu chi phí hoặc tiết kiệm thời gian
- Nhận gợi ý dựa trên sở thích của bạn
- Xuất lịch trình dưới dạng PDF hoặc chia sẻ qua email

### 3. Quản Lý 120+ Địa Điểm

Cơ sở dữ liệu bao gồm:

- 50+ điểm tham quan: bãi biển, công viên, bảo tàng, chùa tháp
- 30+ nhà hàng và quán ăn: từ bình dân đến nhà hàng cao cấp
- 20+ lựa chọn lưu trú: khách sạn, nhà nghỉ, resort
- Thông tin chi tiết: giá cả, giờ hoạt động, vị trí, bình luận

### 4. Bảng Điều Khiển Quản Trị

Cho phép quản lý viên:

- Thêm, sửa, xóa thông tin địa điểm
- Xem thống kê: lịch sử truy cập, địa điểm phổ biến nhất
- Quản lý mẫu Q&A để cải thiện chatbot
- Theo dõi xu hướng tìm kiếm của người dùng

## Công Nghệ Sử Dụng

### Frontend

- **React 18**: Framework UI hiện đại với hooks
- **Vite**: Build tool nhanh, thay thế cho webpack
- **React Router v6**: Quản lý điều hướng
- **Tailwind CSS**: Styling responsive, tiện dụng
- **Fetch API**: Gọi API mà không cần thư viện bên ngoài

### Backend

- **Node.js 18+**: Runtime JavaScript trên server
- **Express.js 4.x**: Web framework nhẹ và linh hoạt
- **Prisma 5.x**: ORM (Object-Relational Mapping) hiện đại, type-safe
- **SQLite** (phát triển): Cơ sở dữ liệu nhẹ, không cần server
- **PostgreSQL** (production): Cơ sở dữ liệu mạnh mẽ cho environment thực
- **Google Gemini API**: Mô hình ngôn ngữ lớn để xử lý NLP
- **Google Maps API**: Tính toán khoảng cách, geocoding vị trí

## Bắt Đầu Nhanh

### Yêu Cầu Hệ Thống

- **Node.js**: Phiên bản 18+ (kiểm tra bằng `node --version`)
- **npm**: Phiên bản 10+ (hoặc dùng yarn, pnpm)
- **Git**: Để clone repository
- **API Keys**:
  - Google Gemini API key (https://aistudio.google.com)
  - Google Maps API key (https://console.cloud.google.com)

### Cài Đặt

#### 1. Clone Repository

```bash
git clone https://github.com/Doggie-H/Dana-Travel.git
cd Dana-Travel
```

#### 2. Cấu Hình Backend

```bash
cd Backend

# Cài đặt dependencies
npm install

# Tạo file .env với nội dung sau
cat > .env << EOF
DATABASE_URL="file:./dev.db"
GOOGLE_GEMINI_API_KEY="your-gemini-api-key-here"
GOOGLE_MAPS_API_KEY="your-maps-api-key-here"
ADMIN_USERNAME="admin"
ADMIN_PASSWORD_HASH="your-bcrypt-hash-here"
NODE_ENV="development"
PORT=3001
FRONTEND_URL="http://localhost:5173"
EOF

# Đồng bộ cơ sở dữ liệu
npx prisma db push

# Nạp dữ liệu mẫu (120+ địa điểm, các nhà ăn, khách sạn)
npm run seed

# Khởi chạy server
npm run dev
# Server sẽ chạy tại http://localhost:3001
```

#### 3. Cấu Hình Frontend

```bash
cd ../Frontend

# Cài đặt dependencies
npm install

# Khởi chạy dev server
npm run dev
# Truy cập http://localhost:5173
```

## Cách Sử Dụng

### Tạo Lịch Trình Đầu Tiên

1. Truy cập giao diện chính tại `http://localhost:5173`
2. Nhập thông tin:
   - **Ngân sách** (VND): Ví dụ: 2,000,000
   - **Ngày đến**: Chọn ngày bắt đầu
   - **Ngày về**: Chọn ngày kết thúc
   - **Phương tiện**: Xe riêng, thuê xe, taxi, grab...
   - **Lưu trú**: Khách sạn, nhà nghỉ, resort, nhà riêng
   - **Sở thích**: Biển, văn hóa, ẩm thực, thiên nhiên...
3. Nhấn "Tạo Lịch Trình"
4. Xem kết quả với chi tiết từng ngày, từng hoạt động

### Chỉnh Sửa Lịch Trình

Sau khi có lịch trình:

- Click vào hoạt động bất kỳ để xem chi tiết
- Dùng nút "Thay Thế" để chọn hoạt động khác cùng thời gian
- Click vào ô chat để trò chuyện với AI và yêu cầu thay đổi

### Chat với Trợ Lý AI

Mở tab "Chat" và nhập yêu cầu, ví dụ:

```
"Tôi muốn thêm Bà Nà Hills vào ngày đầu tiên"
"Giảm chi phí ăn uống xuống 200k mỗi ngày"
"Swap quán cơm chiên này với một quán phở gần đó"
"Xuất lịch dưới dạng PDF"
```

AI sẽ hiểu ý của bạn và cập nhật lịch trình tương ứng.

## Cấu Trúc Dự Án

```
Dana-Travel/
├── Backend/                          # Server Express.js
│   ├── src/
│   │   ├── server.js                # Điểm vào của ứng dụng
│   │   ├── routes/                  # Định nghĩa API endpoints
│   │   │   ├── itinerary.routes.js  # /api/itinerary/*
│   │   │   ├── chat.routes.js       # /api/chat/*
│   │   │   ├── location.routes.js   # /api/location/*
│   │   │   └── admin.routes.js      # /api/admin/*
│   │   ├── controllers/             # Xử lý logic request
│   │   │   ├── itinerary.controller.js
│   │   │   ├── chat.controller.js
│   │   │   ├── location.controller.js
│   │   │   └── admin.controller.js
│   │   ├── services/                # Business logic
│   │   │   ├── itinerary.service.js # Tạo lịch trình
│   │   │   ├── chatbot.service.js   # Xử lý chat
│   │   │   ├── location.service.js  # Quản lý địa điểm
│   │   │   └── admin.service.js     # Quản lý admin
│   │   ├── middleware/              # Xác thực, logging, xử lý lỗi
│   │   ├── utils/                   # Hàm tiện ích
│   │   │   ├── itinerary-validator.js
│   │   │   ├── generate-day-schedule-strict.js
│   │   │   ├── scheduling.constants.js
│   │   │   └── itinerary-helpers.js
│   │   ├── adapters/                # Tích hợp API bên ngoài
│   │   │   └── gemini.adapter.js    # Google Gemini
│   │   └── config/                  # Hằng số, cấu hình
│   ├── prisma/
│   │   ├── schema.prisma            # Định nghĩa cơ sở dữ liệu
│   │   ├── seed.js                  # Nạp dữ liệu mẫu
│   │   └── migrations/              # Lịch sử thay đổi schema
│   ├── package.json
│   ├── .env.example                 # Template cho biến môi trường
│   └── README.md
│
├── Frontend/                         # React SPA
│   ├── src/
│   │   ├── main.jsx                 # Điểm vào React
│   │   ├── App.jsx                  # Component gốc
│   │   ├── components/              # Các component tái sử dụng
│   │   │   ├── Header.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── Loading.jsx
│   │   │   └── ErrorBoundary.jsx
│   │   ├── pages/                   # Các trang chính
│   │   │   ├── HomePage.jsx         # Trang chủ + form nhập
│   │   │   ├── ItineraryResultsPage.jsx
│   │   │   ├── ChatPage.jsx         # Chat với AI
│   │   │   └── AdminDashboardPage.jsx
│   │   ├── features/                # Các feature phức tạp
│   │   │   ├── itinerary/           # Logic lịch trình
│   │   │   ├── bot/                 # Logic chatbot
│   │   │   └── admin/               # Logic quản trị
│   │   ├── services/
│   │   │   ├── api.service.js       # Gọi API backend
│   │   │   └── storage.service.js   # localStorage
│   │   ├── utils/
│   │   │   └── format.utils.js
│   │   └── styles/
│   │       └── main.css
│   ├── public/
│   │   └── favicon.svg              # Icon ứng dụng
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── package.json
│   └── index.html
│
├── docs/                             # Tài liệu dự án
│   ├── ARCHITECTURE.md              # Kiến trúc hệ thống
│   ├── API.md                        # Tài liệu API
│   └── HUONG_DAN_PHAT_TRIEN.md      # Hướng dẫn phát triển
│
├── README.md                         # File này
├── .gitignore
└── package.json (root)
```

## API Documentation

### Tạo Lịch Trình

**Endpoint**: `POST /api/itinerary/generate`

**Request Body**:

```json
{
  "budgetTotal": 2000000,
  "numPeople": 2,
  "arriveDateTime": "2025-01-10T08:00:00",
  "leaveDateTime": "2025-01-12T18:00:00",
  "transport": "own",
  "accommodation": "hotel",
  "preferences": ["beach", "food", "culture"]
}
```

**Response** (HTTP 200):

```json
{
  "success": true,
  "data": {
    "id": "trip-123",
    "name": "Lịch trình Đà Nẵng 3 ngày",
    "totalCost": 1850000,
    "budgetStatus": "OK",
    "days": [
      {
        "day": 1,
        "date": "10/01/2025",
        "items": [
          {
            "timeStart": "08:00",
            "timeEnd": "09:00",
            "title": "Check-in khách sạn",
            "type": "accommodation"
          },
          {
            "timeStart": "09:00",
            "timeEnd": "10:00",
            "title": "Ăn sáng tại Quán Ăn 360",
            "type": "meal",
            "cost": 80000
          }
        ]
      }
    ]
  }
}
```

### Chat với AI

**Endpoint**: `POST /api/chat/message`

**Request Body**:

```json
{
  "message": "Thêm Bà Nà Hills vào ngày đầu tiên",
  "sessionId": "session-123",
  "currentItinerary": {
    /* lịch trình hiện tại */
  }
}
```

**Response** (HTTP 200):

```json
{
  "success": true,
  "data": {
    "botMessage": "Tôi đã thêm Bà Nà Hills vào sáng ngày đầu tiên...",
    "updatedItinerary": {
      /* lịch trình đã cập nhật */
    }
  }
}
```

### Lấy Danh Sách Địa Điểm

**Endpoint**: `GET /api/location?type=attraction&priceLevel=cheap`

**Response** (HTTP 200):

```json
{
  "success": true,
  "data": [
    {
      "id": "loc-001",
      "name": "Bãi Biển Mỹ Khê",
      "type": "beach",
      "address": "Quận Hải Châu, Đà Nẵng",
      "ticket": 0,
      "rating": 4.8
    }
  ]
}
```

Xem tài liệu chi tiết tại `docs/API.md`

## Cấu Hình Biến Môi Trường

### Backend (.env)

```env
# Database
DATABASE_URL="file:./dev.db"

# Google APIs
GOOGLE_GEMINI_API_KEY="your-key-here"
GOOGLE_MAPS_API_KEY="your-key-here"

# Admin
ADMIN_USERNAME="admin"
ADMIN_PASSWORD_HASH="$2b$10$..." # bcrypt hash

# Server
NODE_ENV="development"
PORT=3001
FRONTEND_URL="http://localhost:5173"
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:3001
VITE_APP_NAME="DanangTravel-AI"
```

## Ví Dụ Sử Dụng API

### JavaScript/Fetch

```javascript
// Tạo lịch trình
const response = await fetch("http://localhost:3001/api/itinerary/generate", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    budgetTotal: 2000000,
    numPeople: 2,
    arriveDateTime: "2025-01-10T08:00:00",
    leaveDateTime: "2025-01-12T18:00:00",
    transport: "own",
    accommodation: "hotel",
    preferences: ["beach", "food"],
  }),
});

const data = await response.json();
console.log(data.data); // Lịch trình hoàn chỉnh
```

### cURL

```bash
curl -X POST http://localhost:3001/api/itinerary/generate \
  -H "Content-Type: application/json" \
  -d '{
    "budgetTotal": 2000000,
    "numPeople": 2,
    "arriveDateTime": "2025-01-10T08:00:00",
    "leaveDateTime": "2025-01-12T18:00:00",
    "transport": "own",
    "accommodation": "hotel",
    "preferences": ["beach", "food"]
  }'
```

## Khắc Phục Sự Cố

### Backend không khởi động

**Lỗi**: `Port 3001 is already in use`

```bash
# Tìm process đang chiếm port 3001 và kill nó
lsof -i :3001
kill -9 <PID>
```

### Không kết nối được đến API

**Lỗi**: `Cannot POST /api/itinerary/generate`

1. Kiểm tra server đã khởi động chưa: `http://localhost:3001`
2. Kiểm tra FRONTEND_URL trong .env của Backend
3. Kiểm tra CORS settings

### Database migration lỗi

```bash
# Reset database
npx prisma db push --force-reset

# Hoặc xóa file dev.db và tạo lại
rm Backend/prisma/dev.db
npx prisma db push
npm run seed
```

### Google API key không hoạt động

1. Truy cập https://console.cloud.google.com
2. Kích hoạt "Google Gemini API" và "Google Maps API"
3. Tạo API key mới
4. Cập nhật vào file .env

## Phát Triển Tiếp Theo

### Dự Kiến Hoàn Thiện

- Đăng nhập/Đăng ký người dùng (auth)
- Lưu lịch trình vào tài khoản cá nhân
- Chia sẻ lịch trình với bạn bè qua link
- Đánh giá địa điểm (rating system)
- Thông báo giá vé giảm
- Tích hợp thanh toán trực tuyến
- Mobile app (React Native)
- Hỗ trợ du lịch các tỉnh khác (TP.HCM, Hà Nội, Nha Trang...)

### Đóng Góp

Mình rất hoan nghênh những đóng góp từ cộng đồng! Hãy:

1. Fork repository
2. Tạo branch mới: `git checkout -b feature/your-feature-name`
3. Commit thay đổi: `git commit -m "Mô tả ngắn gọn thay đổi"`
4. Push lên: `git push origin feature/your-feature-name`
5. Tạo Pull Request

Xem chi tiết tại `docs/HUONG_DAN_PHAT_TRIEN.md`

## License

Dự án này được cấp phép dưới giấy phép MIT. Xem file `LICENSE` để biết chi tiết.

## Liên Hệ & Support

- **Email**: support@danangtravelai.com
- **GitHub Issues**: Báo cáo lỗi tại https://github.com/Doggie-H/Dana-Travel/issues
- **Trang Web**: Sắp ra mắt

## Ghi Nhận

Dự án được phát triển dựa trên:

- Kiến trúc ba tầng (Three-Tier Architecture)
- Thuật toán lập lịch heuristic (Heuristic Scheduling)
- Mô hình ngôn ngữ lớn Google Gemini
- Cộng đồng open-source Node.js, React, Prisma

---

**Cảm ơn bạn đã quan tâm đến DanangTravel-AI! Chúng tôi luôn mong nhận phản hồi để cải thiện sản phẩm.**

## 2. Tính năng chính (Key Features)

### 🤖 Hybrid Chatbot (Trợ lý ảo lai)

Kết hợp sức mạnh của hai cơ chế xử lý:

- **Rule-based Processing**: Xử lý tức thì các tác vụ cụ thể (Tra cứu thời tiết, Tìm địa điểm, Xuất PDF) với độ chính xác 100%.
- **Generative AI (Gemini Agent)**: Xử lý các hội thoại tự do, hiểu ngữ cảnh và đưa ra gợi ý sáng tạo khi người dùng không có yêu cầu cụ thể.

### 📅 Intelligent Itinerary Generation (Lập lịch thông minh)

Hệ thống tự động xây dựng kế hoạch du lịch chi tiết theo từng ngày dựa trên thuật toán tham lam (Greedy Algorithm) có điều chỉnh:

- **Tối ưu hóa đa mục tiêu**: Cân bằng giữa Sở thích (Preferences), Khoảng cách di chuyển (Distance Minimization) và Ngân sách (Budget Constraints).
- **Phân bổ khe thời gian (Time-slot Allocation)**: Chia ngày thành các giai đoạn (Sáng, Trưa, Chiều, Tối) và lấp đầy bằng các hoạt động phù hợp (Tham quan, Ăn uống, Nghỉ ngơi).

- **Algorithms**: Distance Matrix Calculation, Constraint Satisfaction Problem (CSP).

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
