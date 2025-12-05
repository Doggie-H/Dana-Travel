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

## 3. Sơ đồ Use Case

Sơ đồ Use Case mô tả các tương tác giữa các tác nhân (Actors) và hệ thống.

### 3.1. Các Tác nhân (Actors)

1.  **Khách du lịch (User)**: Người dùng cuối truy cập hệ thống để tìm kiếm thông tin và lập kế hoạch du lịch.
2.  **Quản trị viên (Admin)**: Người quản lý nội dung, dữ liệu địa điểm và theo dõi hoạt động của hệ thống.
3.  **Hệ thống AI (Gemini)**: Tác nhân phụ hỗ trợ trả lời câu hỏi và gợi ý lịch trình thông minh.

### 3.2. Danh sách Use Case

**Nhóm Khách du lịch:**
*   **Lập lịch trình tự động**: Nhập ngân sách, số ngày, sở thích để tạo lịch trình.
*   **Tùy chỉnh lịch trình**: Thay đổi các tham số để tạo lại lịch trình.
*   **Trò chuyện với AI**: Hỏi đáp thông tin du lịch Đà Nẵng.
*   **Tra cứu địa điểm**: Xem thông tin chi tiết, giá vé, menu của các địa điểm.

**Nhóm Quản trị viên:**
*   **Đăng nhập hệ thống**: Truy cập vào trang quản trị.
*   **Quản lý địa điểm**: Thêm, sửa, xóa thông tin địa điểm du lịch/ăn uống.
*   **Quản lý tri thức AI**: Cập nhật cơ sở dữ liệu câu hỏi/câu trả lời cho Chatbot.
*   **Xem báo cáo thống kê**: Xem lưu lượng truy cập, xu hướng tìm kiếm.
*   **Quản lý tài khoản**: Thêm hoặc xóa các quản trị viên khác.

### 3.3. Sơ đồ Minh họa

```mermaid
usecaseDiagram
    actor "Khách du lịch" as User
    actor "Quản trị viên" as Admin
    actor "Hệ thống AI" as AI

    package "Hệ thống DanaTravel" {
        usecase "Lập lịch trình" as UC1
        usecase "Chatbot tư vấn" as UC2
        usecase "Tra cứu địa điểm" as UC3
        usecase "Đăng nhập Admin" as UC4
        usecase "Quản lý dữ liệu" as UC5
    }

    User --> UC1
    User --> UC2
    User --> UC3

    Admin --> UC4
    UC4 ..> UC5 : include

    UC2 ..> AI : sử dụng
    UC1 ..> AI : hỗ trợ
```

## 4. Thiết kế Cơ sở dữ liệu (ERD)

Sơ đồ mô tả cấu trúc dữ liệu và mối quan hệ giữa các thực thể trong hệ thống.

### 4.1. Các Thực thể (Entities)

1.  **Location (Địa điểm)**: Lưu trữ thông tin các điểm tham quan, nhà hàng, khách sạn.
2.  **Admin (Quản trị viên)**: Tài khoản quản trị hệ thống.
3.  **Knowledge (Tri thức)**: Dữ liệu hỏi đáp mẫu dùng cho RAG (Retrieval-Augmented Generation).
4.  **ChatLog (Lịch sử Chat)**: Lưu lại các cuộc hội thoại giữa người dùng và Bot.
5.  **AccessLog (Nhật ký truy cập)**: Ghi lại hoạt động truy cập API để thống kê.
6.  **SearchTrend (Xu hướng tìm kiếm)**: Lưu lại các từ khóa và nhu cầu tìm kiếm của người dùng.
7.  **Transport (Phương tiện)**: Bảng giá và loại hình phương tiện di chuyển.

### 4.2. Sơ đồ Minh họa

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

## 5. Luồng Hoạt động (Activity Flows)

### 5.1. Quy trình Lập Lịch trình (Algorithm)

Đây là quy trình phức tạp nhất, sử dụng thuật toán CSP (Constraint Satisfaction Problem) để đảm bảo lịch trình khả thi.

**Mô tả luồng:**
1.  Người dùng nhập: Ngân sách, Số ngày, Sở thích (Tags).
2.  Hệ thống lọc danh sách `Location` phù hợp với Sở thích.
3.  Hệ thống khởi tạo lịch trình rỗng cho từng ngày.
4.  **Vòng lặp xếp lịch (Greedy + Backtracking)**:
    *   Chọn địa điểm ăn trưa/tối phù hợp ngân sách.
    *   Chọn địa điểm tham quan dựa trên khoảng cách địa lý (gần địa điểm trước đó) và giờ mở cửa.
    *   Kiểm tra ràng buộc: Tổng chi phí < Ngân sách, Tổng thời gian < Thời gian trong ngày.
5.  Nếu không tìm được phương án khả thi -> Thông báo hoặc gợi ý nới lỏng ngân sách.
6.  Nếu thành công -> Trả về JSON lịch trình chi tiết.

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

### 5.2. Quy trình Chatbot (RAG)

Quy trình xử lý khi người dùng đặt câu hỏi cho Chatbot.

**Mô tả luồng:**
1.  Người dùng gửi tin nhắn.
2.  Hệ thống tìm kiếm từ khóa trong bảng `Knowledge` và `Location`.
3.  Lấy các thông tin liên quan nhất (Context).
4.  Gửi Prompt = "Context + Câu hỏi người dùng" đến Google Gemini AI.
5.  Gemini trả về câu trả lời tự nhiên.
6.  Hệ thống lưu hội thoại vào `ChatLog` và hiển thị cho người dùng.

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

## 6. Cấu trúc Thư mục Dự án

```
Dana-Travel/
├── Frontend/           # Ứng dụng React
│   ├── src/
│   │   ├── components/ # Các thành phần UI tái sử dụng
│   │   ├── features/   # Các module tính năng (itinerary, admin...)
│   │   ├── pages/      # Các trang điều hướng (Route pages)
│   │   └── services/   # Các service gọi API
│
├── Backend/            # Ứng dụng Express
│   ├── prisma/         # Schema cơ sở dữ liệu & seeds
│   ├── src/
│   │   ├── adapters/   # Kết nối dịch vụ ngoài (Gemini)
│   │   ├── config/     # Cấu hình & Hằng số (Rules, prompts)
│   │   ├── controllers/# Bộ xử lý yêu cầu (Request handlers)
│   │   ├── middleware/ # Middleware (Auth, Logger, Error)
│   │   ├── services/   # Logic nghiệp vụ (The "Brain")
│   │   ├── routes/     # Các điểm cuối API (Endpoints)
│   │   └── utils/      # Tiện ích hỗ trợ (Tính khoảng cách, định dạng)
│
└── docs/               # Tài liệu dự án
```

## 7. Hướng dẫn Cài đặt & Triển khai

### Yêu cầu hệ thống
- Node.js (v18 trở lên)
- Git

### Bước 1: Clone dự án
```bash
git clone <repository-url>
cd Dana-Travel
```

### Bước 2: Cài đặt Backend
```bash
cd Backend
npm install
# Tạo file .env (tham khảo .env.example)
# Chạy migration và seed dữ liệu
npx prisma migrate dev --name init
npx prisma db seed
# Khởi chạy server
npm run dev
```

**Cấu hình .env (Backend):**
```env
PORT=3000
DATABASE_URL="file:./dev.db"
GEMINI_API_KEY="<YOUR_API_KEY>"
GEMINI_MODEL="gemini-1.5-flash"
```

### Bước 3: Cài đặt Frontend
```bash
cd ../Frontend
npm install
# Khởi chạy dev server
npm run dev
```
Truy cập: `http://localhost:5173`

## 8. Tóm tắt API

### Authentication
- `POST /api/admin/login`: Đăng nhập Admin
- `POST /api/admin/logout`: Đăng xuất

### Itinerary
- `POST /api/itinerary/generate`: Tạo lịch trình mới
- `GET /api/locations`: Lấy danh sách địa điểm

### Chatbot
- `POST /api/chat/message`: Gửi tin nhắn và nhận phản hồi từ AI

### Locations
- `GET /api/locations/:id`: Chi tiết địa điểm
- `POST /api/locations`: Thêm địa điểm (Admin)
- `PUT /api/locations/:id`: Cập nhật địa điểm (Admin)
- `DELETE /api/locations/:id`: Xóa địa điểm (Admin)
