
- 📊 **Traffic Analytics**: Biểu đồ lượt truy cập theo ngày/tuần/tháng (Chart.js)
- 🔍 **Search Trends**: Phân tích xu hướng tìm kiếm (tags phổ biến, budget trung bình)
- 🏨 **Location Management**: CRUD locations với upload ảnh, tags, menu, pricing
- 👥 **User Management**: Quản lý admin accounts với role-based access control (RBAC)
- 📜 **Access Logs**: Lịch sử truy cập với filter theo method, endpoint, user

---

## 🏗️ Kiến Trúc Hệ Thống

```mermaid
graph TB
    subgraph "Frontend Layer"
        UI[React SPA]
        TripForm[Trip Planning Form]
        ChatUI[Chat Interface]
        AdminUI[Admin Dashboard]
    end
    
    subgraph "Backend Layer"
        API[Express.js REST API]
        Auth[JWT Authentication]
        Services[Business Logic Services]
    end
    
    subgraph "Data Layer"
        DB[(SQLite/PostgreSQL)]
        Prisma[Prisma ORM]
    end
    
    subgraph "External APIs"
        Gemini[Google Gemini AI]
        OSM[OpenStreetMap]
    end
    
    UI --> API
    TripForm --> API
    ChatUI --> API
    AdminUI --> API
    
    API --> Auth
    API --> Services
    Services --> Prisma
    Prisma --> DB
    
    Services --> Gemini
    UI --> OSM
```

### 📁 Cấu Trúc Thư Mục

```
Dana-Travel/
├── Backend/
│   ├── src/
│   │   ├── controllers/      # Route handlers
│   │   ├── services/         # Business logic
│   │   │   ├── itinerary.service.js    # Thuật toán lập lịch
│   │   │   ├── chatbot.service.js      # RAG chatbot
│   │   │   ├── budget.service.js       # Tính toán ngân sách
│   │   │   └── location.service.js     # CRUD locations
│   │   ├── routes/           # API routes
│   │   ├── middleware/       # Auth, Logger, CORS
│   │   ├── adapters/         # Gemini API adapter
│   │   └── utils/            # Helpers
│   ├── prisma/
│   │   ├── schema.prisma     # Database schema
│   │   └── migrations/       # DB migrations
│   └── server.js             # Express entry point
│
├── Frontend/
│   ├── src/
│   │   ├── pages/            # Route pages
│   │   │   ├── HomePage.jsx
│   │   │   ├── ItineraryResultsPage.jsx
│   │   │   ├── ChatPage.jsx
│   │   │   └── AdminDashboardPage.jsx
│   │   ├── features/         # Feature modules
│   │   │   ├── trip-form/    # Multi-step form
│   │   │   ├── itinerary/    # Itinerary display
│   │   │   ├── chatbot/      # Chat components
│   │   │   └── admin/        # Admin components
│   │   ├── components/       # Shared components
│   │   ├── services/         # API client, storage
│   │   └── styles/           # CSS, Tailwind
│   └── main.jsx
│
└── README.md
```

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 (Hooks, Context API)
- **Build Tool**: Vite (Fast HMR, optimized builds)
- **Routing**: React Router v6
- **Styling**: Tailwind CSS + Custom CSS
- **Animations**: Framer Motion
- **Maps**: React-Leaflet + OpenStreetMap
- **Date Picker**: React-Datepicker
- **Charts**: Chart.js + React-Chartjs-2

### Backend
- **Runtime**: Node.js 18+ (ESM)
- **Framework**: Express.js
- **ORM**: Prisma
- **Database**: SQLite (dev) / PostgreSQL (prod)
- **Authentication**: JWT + HttpOnly Cookies
- **Validation**: Zod
- **Security**: Helmet, CORS, bcryptjs, Rate Limiting
- **AI**: Google Gemini API (RAG)

### DevOps & Tools
- **Version Control**: Git + GitHub
- **Package Manager**: npm
- **Linting**: ESLint
- **Process Manager**: PM2 (production)
- **Reverse Proxy**: Nginx
- **CI/CD**: GitHub Actions

---

## 📦 Cài Đặt

### Yêu Cầu Hệ Thống

- Node.js >= 18.0.0
- npm >= 9.0.0
- Git

### Bước 1: Clone Repository

```bash
git clone https://github.com/yourusername/dana-travel.git
cd dana-travel
```

### Bước 2: Cài Đặt Backend

```bash
cd Backend
npm install

# Tạo file .env
cp .env.example .env
```

**Cấu hình `.env`:**
```env
# Database
DATABASE_URL="file:./dev.db"

# Google Gemini API
GEMINI_API_KEY="your_gemini_api_key_here"

# JWT Secret
JWT_SECRET="your_secret_key_here"

# Server
PORT=3000
NODE_ENV=development
```

**Khởi tạo Database:**
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

**Development Mode (Khuyến nghị):**
```bash
# Terminal 1 - Backend
cd Backend
npm run dev

# Terminal 2 - Frontend
cd Frontend
npm run dev
```

**Hoặc dùng script tổng hợp (nếu có):**
```bash
npm run dev:all
```

**Truy cập:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- Admin Dashboard: http://localhost:5173/admin

---

## 🔐 Authentication

### Admin Login

**Default Credentials:**
```
Username: admin
Password: admin123
```

> ⚠️ **Lưu ý**: Đổi mật khẩu ngay sau khi deploy production!

**JWT Flow:**
```
1. POST /api/admin/login → nhận JWT token
2. Token lưu trong HttpOnly Cookie
3. Mọi request sau đều gửi kèm cookie
4. Middleware verify token trước khi cho phép truy cập
```

---

## 📡 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Public Endpoints

#### 1. Generate Itinerary
```http
POST /itinerary/generate
Content-Type: application/json

{
  "arriveDateTime": "2025-12-20T08:00:00",
  "leaveDateTime": "2025-12-23T18:00:00",
  "numPeople": 4,
  "budgetTotal": 5000000,
  "transport": "taxi",
  "accommodation": "hotel",
  "preferences": ["beach", "food", "culture"]
}
```

**Response:**
```json
{
  "days": [
    {
      "dayNumber": 1,
      "date": "2025-12-20",
      "items": [
        {
          "timeStart": "08:00",
          "timeEnd": "09:30",
          "title": "Ăn sáng",
          "category": "meal",
          "cost": 120000
        }
      ]
    }
  ],
  "summary": {
    "totalCost": 4440000,
    "remainingBudget": 560000
  }
}
```

#### 2. Chatbot
```http
POST /chat
Content-Type: application/json

{
  "message": "Gợi ý quán ăn hải sản ngon",
  "context": {
    "itinerary": {...},
    "userRequest": {...}
  }
}
```

### Protected Endpoints (Require JWT)

#### 3. Get All Locations (Admin)
```http
GET /admin/locations
Authorization: Bearer <token>
```

#### 4. Create Location (Admin)
```http
POST /admin/locations
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Bãi biển Mỹ Khê",
  "latitude": 16.0471,
  "longitude": 108.2425,
  "type": "beach",
  "tags": ["beach", "nature"],
  "cost": 0,
  "rating": 4.8
}
```

📘 **Full API Docs**: Xem chi tiết tại `docs/API.md`

---

## 🧪 Testing

### Backend Tests
```bash
cd Backend
npm test
```

### Frontend Tests
```bash
cd Frontend
npm test
```

### Test Coverage
```bash
npm run test:coverage
```

---

## 🚢 Deployment

### Production Build

**Backend:**
```bash
cd Backend
npm run build
pm2 start ecosystem.config.js
```

**Frontend:**
```bash
cd Frontend
npm run build
# Serve dist/ với Nginx hoặc Vercel
```

### Environment Variables (Production)

```env
DATABASE_URL="postgresql://user:password@localhost:5432/dana_travel"
GEMINI_API_KEY="prod_key"
JWT_SECRET="super_secret_key"
NODE_ENV=production
ALLOWED_ORIGINS="https://yourdomain.com"
```

### Nginx Configuration

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Frontend
    location / {
        root /var/www/dana-travel/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 📚 Tài Liệu

Dự án có bộ tài liệu đầy đủ trong thư mục [`/docs`](docs/).

### Tài liệu có sẵn

- 📐 **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** - Kiến trúc hệ thống chi tiết
  - High-level architecture diagrams
  - Data flow & component interaction
  - Security & deployment architecture
  - Scalability considerations

- 📡 **[API.md](docs/API.md)** - Tài liệu API đầy đủ
  - 14 endpoints với examples
  - Request/Response schemas
  - Authentication guide
  - Error codes & rate limiting

- 🤝 **[CONTRIBUTING.md](docs/CONTRIBUTING.md)** - Hướng dẫn đóng góp
  - Development setup
  - Coding standards
  - Git workflow & commit guidelines
  - Pull request process

- 📝 **[CHANGELOG.md](docs/CHANGELOG.md)** - Lịch sử phiên bản
  - Version history
  - Features & bug fixes
  - Breaking changes & upgrade guides

---

## 🤝 Đóng Góp

Chúng tôi hoan nghênh mọi đóng góp! Vui lòng làm theo các bước sau:

1. Fork repository
2. Tạo branch mới (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Mở Pull Request

### Coding Standards
- **ESLint**: Tuân thủ cấu hình ESLint
- **Prettier**: Format code trước khi commit
- **Comments**: Viết comment bằng tiếng Việt cho business logic

---

## 📄 License

Dự án này được cấp phép theo giấy phép MIT - xem file [LICENSE](LICENSE) để biết thêm chi tiết.

---

## 👨‍💻 Tác Giả

**Dana Travel Team**

- 📧 Email: contact@danatravel.vn
- 🌐 Website: [danatravel.vn](https://danatravel.vn)
- 💼 LinkedIn: [Dana Travel](https://linkedin.com/company/dana-travel)

---

## 🙏 Acknowledgments

- [Google Gemini](https://ai.google.dev/) - AI/ML Platform
- [OpenStreetMap](https://www.openstreetmap.org/) - Map data
- [Tailwind CSS](https://tailwindcss.com/) - Styling framework
- [Prisma](https://www.prisma.io/) - Database ORM

---

## 📊 Project Stats

![GitHub stars](https://img.shields.io/github/stars/yourusername/dana-travel?style=social)
![GitHub forks](https://img.shields.io/github/forks/yourusername/dana-travel?style=social)
![GitHub issues](https://img.shields.io/github/issues/yourusername/dana-travel)
![GitHub pull requests](https://img.shields.io/github/issues-pr/yourusername/dana-travel)

---

<div align="center">

**⭐ Nếu bạn thấy dự án hữu ích, hãy cho chúng tôi một ngôi sao!**

Made with ❤️ in Da Nang, Vietnam 🇻🇳

</div>
