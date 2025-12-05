# Tài liệu Kiến trúc Hệ thống DanaTravel

Tài liệu này cung cấp cái nhìn tổng quan về kỹ thuật, kiến trúc, thiết kế dữ liệu và các luồng hoạt động chính của hệ thống DanaTravel.

## 1. Tổng quan Hệ thống

DanaTravel là một nền tảng **Trợ lý Du lịch Thông minh** sử dụng AI và các thuật toán ràng buộc chặt chẽ để lập kế hoạch du lịch cá nhân hóa.

### 1.1. Bối cảnh Hệ thống (C4 Level 1)

```mermaid
graph TD
    User[Khách du lịch] --> System[Hệ thống DanaTravel]
    Admin[Quản trị viên] --> System
    System --> Gemini[Google Gemini AI]
```

### 1.2. Kiến trúc Container (C4 Level 2)

Hệ thống được xây dựng theo kiến trúc Monolithic với Frontend và Backend tách biệt, giao tiếp qua RESTful APIs.

```mermaid
graph TD
    User[Người dùng] --> FE[Frontend React]
    FE --> API[Backend API]
    API --> DB[(Database SQLite)]
    API --> Gemini[Google Gemini AI]
```

## 2. Công nghệ Sử dụng (Tech Stack)

| Thành phần | Công nghệ | Phiên bản | Mô tả |
| :--- | :--- | :--- | :--- |
| **Frontend** | React | ^18.2.0 | Thư viện UI chính |
| | Vite | ^5.0.8 | Build tool siêu tốc |
| | TailwindCSS | ^3.4.18 | Framework CSS utility-first |
| | React Router | ^6.20.0 | Quản lý điều hướng |
| **Backend** | Node.js | LTS | Môi trường chạy JavaScript |
| | Express | ^4.18.2 | Web framework |
| | Prisma | ^5.22.0 | ORM làm việc với Database |
| | SQLite | - | Cơ sở dữ liệu nhẹ |
| **AI** | Google Gemini | 1.5 Flash | Mô hình ngôn ngữ lớn (LLM) |

## 3. Thiết kế Cơ sở dữ liệu (ERD)

Dưới đây là sơ đồ thực thể - quan hệ (ERD) đầy đủ của hệ thống, phản ánh chính xác cấu trúc trong `schema.prisma`.

```mermaid
erDiagram
    Admin {
        String id PK
        String username
        String passwordHash
        String email
        String role
        Boolean active
        DateTime lastLogin
        DateTime createdAt
        DateTime updatedAt
    }

    Location {
        String id PK
        String name
        String type
        String area
        String address
        Float lat
        Float lng
        Float ticket
        Boolean indoor
        String priceLevel
        String tags
        String description
        String menu
        Int suggestedDuration
        String openTime
        String closeTime
        String visitType
        DateTime createdAt
        DateTime updatedAt
    }

    Knowledge {
        String id PK
        String question
        String answer
        String keywords
        DateTime createdAt
        DateTime updatedAt
    }

    ChatLog {
        String id PK
        String userMessage
        String botResponse
        DateTime timestamp
    }

    AccessLog {
        String id PK
        String ip
        String userAgent
        String endpoint
        String method
        String username
        String role
        DateTime timestamp
    }

    SearchTrend {
        String id PK
        String tags
        String duration
        Float budget
        Int people
        DateTime createdAt
    }

    Transport {
        String id PK
        String name
        String type
        Float basePrice
        Float pricePerKm
        String description
        DateTime createdAt
        DateTime updatedAt
    }
```

## 4. Luồng Hoạt động (Activity Flows)

### 4.1. Quy trình Lập Lịch trình (Algorithm)

```mermaid
flowchart TD
    Start([Bắt đầu]) --> Input[/Nhập: Ngân sách, Số ngày, Sở thích/]
    Input --> Filter[Lọc Địa điểm theo Sở thích]
    Filter --> Init[Khởi tạo Lịch trình rỗng]
    
    Init --> LoopDay{Còn ngày trống?}
    LoopDay -- Có --> SelectFood[Chọn quán ăn]
    SelectFood --> SelectAttr[Chọn điểm tham quan gần nhất]
    SelectAttr --> CheckConstraint{Kiểm tra Ràng buộc}
    
    CheckConstraint -- Thỏa mãn --> AddToPlan[Thêm vào Lịch trình]
    CheckConstraint -- Vi phạm --> Backtrack[Quay lui / Chọn điểm khác]
    
    AddToPlan --> LoopDay
    LoopDay -- Hết --> Result[/Trả về Lịch trình/]
    Result --> End([Kết thúc])
```

### 4.2. Quy trình Chatbot (RAG)

```mermaid
sequenceDiagram
    participant User as Người dùng
    participant System as Hệ thống
    participant DB as Database
    participant AI as Gemini

    User->>System: Gửi câu hỏi
    System->>DB: Tìm kiếm thông tin liên quan
    DB-->>System: Trả về dữ liệu (Context)
    System->>AI: Gửi Prompt (Context + Câu hỏi)
    AI-->>System: Trả về câu trả lời
    System->>DB: Lưu lịch sử chat
    System-->>User: Hiển thị câu trả lời
```

## 5. Cấu trúc Thư mục Dự án

```
Dana-Travel/
├── Frontend/           # Ứng dụng React
│   ├── src/
│   │   ├── components/ # Các thành phần UI tái sử dụng
│   │   ├── features/   # Các module tính năng
│   │   ├── pages/      # Các trang điều hướng
│   │   └── services/   # Các service gọi API
│
├── Backend/            # Ứng dụng Express
│   ├── prisma/         # Schema cơ sở dữ liệu & seeds
│   ├── src/
│   │   ├── adapters/   # Kết nối dịch vụ ngoài (Gemini)
│   │   ├── config/     # Cấu hình & Hằng số
│   │   ├── controllers/# Bộ xử lý yêu cầu
│   │   ├── middleware/ # Middleware
│   │   ├── services/   # Logic nghiệp vụ
│   │   ├── routes/     # Các điểm cuối API
│   │   └── utils/      # Tiện ích hỗ trợ
│
└── docs/               # Tài liệu dự án
```

## 6. Tóm tắt API

### Authentication
- `POST /api/admin/login`: Đăng nhập Admin

### Itinerary
- `POST /api/itinerary/generate`: Tạo lịch trình
- `GET /api/locations`: Lấy danh sách địa điểm

### Chatbot
- `POST /api/chat/message`: Chat với AI

### Locations
- `GET /api/locations/:id`: Chi tiết địa điểm
- `POST /api/locations`: Thêm địa điểm (Admin)
- `PUT /api/locations/:id`: Sửa địa điểm (Admin)
- `DELETE /api/locations/:id`: Xóa địa điểm (Admin)
