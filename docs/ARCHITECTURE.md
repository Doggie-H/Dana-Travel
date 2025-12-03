# KIẾN TRÚC HỆ THỐNG - Dana Travel

> **Tài liệu Kỹ thuật Chi tiết**  
> **Phiên bản**: 3.1 (Detailed Edition)  
> **Cập nhật**: 2025-12-03
> **Mô tả**: Tài liệu này mô tả chi tiết kiến trúc phần mềm, luồng dữ liệu, và các quyết định kỹ thuật của dự án Dana Travel.

---

## Mục Lục

1. [Tổng Quan Hệ Thống](#1-tổng-quan-hệ-thống)
2. [Sơ Đồ Kiến Trúc](#2-sơ-đồ-kiến-trúc)
3. [Luồng Dữ Liệu Chi Tiết](#3-luồng-dữ-liệu-chi-tiết)
4. [Kiến Trúc Database](#4-kiến-trúc-database)
5. [Kiến Trúc Backend](#5-kiến-trúc-backend)
6. [Kiến Trúc Frontend](#6-kiến-trúc-frontend)
7. [Kiến Trúc Bảo Mật](#7-kiến-trúc-bảo-mật)
8. [Kiến Trúc Triển Khai](#8-kiến-trúc-triển-khai)

---

## 1. Tổng Quan Hệ Thống

### 1.1 Giới Thiệu
Dana Travel là một ứng dụng web trọn gói (Full-Stack Web Application) giúp khách du lịch lập kế hoạch chuyến đi đến Đà Nẵng một cách tự động và thông minh. Hệ thống tích hợp Chatbot AI để tư vấn theo thời gian thực.

### 1.2 Công Nghệ Sử Dụng (Tech Stack)
Chúng tôi lựa chọn các công nghệ hiện đại và phổ biến nhất hiện nay:

*   **Frontend**: **React** (Thư viện UI), **Vite** (Build tool siêu tốc), **Tailwind CSS** (Styling).
    *   *Lý do*: React giúp chia nhỏ giao diện thành các component tái sử dụng. Vite giúp môi trường dev khởi động ngay lập tức.
*   **Backend**: **Node.js** & **Express.js**.
    *   *Lý do*: Sử dụng chung ngôn ngữ JavaScript với Frontend, tận dụng hệ sinh thái npm khổng lồ.
*   **Database**: **SQLite** (Dev) / **PostgreSQL** (Prod) + **Prisma ORM**.
    *   *Lý do*: Prisma giúp thao tác database an toàn (type-safe) và dễ dàng migration.
*   **AI**: **Google Gemini API**.
    *   *Lý do*: Mô hình ngôn ngữ lớn mạnh mẽ, chi phí hợp lý và phản hồi nhanh.

### 1.3 Kiến Trúc Tổng Quan (High-Level Architecture)

Hệ thống tuân theo mô hình **Client-Server** truyền thống nhưng được hiện đại hóa bằng kiến trúc **RESTful API**.

```mermaid
graph TB
    subgraph "TẦNG CLIENT - Port 5173"
        A1["React SPA"]
        A1 --> A2["React Router"]
        A2 --> A3["Trang Chủ"]
        A2 --> A4["Trang Lịch Trình"]
        A2 --> A5["Trang Chat"]
        A2 --> A6["Trang Quản Trị"]
    end
    
    subgraph "TẦNG API - Port 3000"
        B1["Express.js Server"]
        B1 --> B2["CORS Middleware"]
        B1 --> B3["Auth Middleware"]
        B1 --> B4["Logger Middleware"]
    end
    
    subgraph "TẦNG BUSINESS LOGIC"
        C1["Routes - Định tuyến"]
        C1 --> C2["Controllers - Xử lý request"]
        C2 --> C3["Services - Nghiệp vụ"]
        
        C3 --> S1["itinerary.service<br/>Thuật toán TSP"]
        C3 --> S2["chatbot.service<br/>RAG + NLP"]
        C3 --> S3["budget.service<br/>Tính ngân sách"]
        C3 --> S4["location.service<br/>Truy vấn địa điểm"]
        C3 --> S5["auth.service<br/>JWT + bcrypt"]
        C3 --> S6["admin.service<br/>Quản lý admin"]
    end
    
    subgraph "TẦNG TRUY CẬP DỮ LIỆU"
        D1["Prisma ORM"]
        D1 --> D2["Query Builder"]
        D1 --> D3["Schema Definition"]
    end
    
    subgraph "TẦNG DATABASE"
        E1[("SQLite - Dev")]
        E2[("PostgreSQL - Production")]
        
        E1 --> E3["Bảng Location"]
        E1 --> E4["Bảng Admin"]
        E1 --> E5["Bảng Knowledge"]
        E1 --> E6["Bảng AccessLog"]
    end
    
    subgraph "DỊCH VỤ NGOÀI"
        F1["Google Gemini API"]
        F2["OpenStreetMap"]
    end
    
    A1 --> B1
    B4 --> C1
    C3 --> D1
    D2 --> E1
    D2 --> E2
    S2 --> F1
    A4 --> F2
```

**Giải thích chi tiết:**
1.  **Client**: Người dùng tương tác qua trình duyệt. React Router điều hướng mà không cần tải lại trang (SPA).
2.  **API Layer**: Cổng vào của Backend. Middleware xử lý các vấn đề chung như bảo mật (CORS), xác thực (Auth), và ghi nhật ký (Logger).
3.  **Business Logic**: Nơi chứa "chất xám" của dự án. Code được chia thành 3 lớp:
    *   *Routes*: Định nghĩa đường dẫn (URL).
    *   *Controllers*: Nhận dữ liệu đầu vào, kiểm tra hợp lệ.
    *   *Services*: Thực hiện tính toán, gọi thuật toán, xử lý nghiệp vụ.
4.  **Data Access**: Prisma ORM đóng vai trò trung gian, giúp code JS nói chuyện với Database SQL mà không cần viết câu lệnh SQL trần.

---

## 2. Sơ Đồ Kiến Trúc

### 2.1 Luồng Tương Tác Giữa Các Thành Phần

Sơ đồ này minh họa cách các module Frontend gọi xuống các module Backend tương ứng.

```mermaid
graph LR
    subgraph "Module Frontend"
        FE1["Form Lập Lịch Trình"]
        FE2["Module Itinerary"]
        FE3["Module Chatbot"]
        FE4["Module Quản Trị"]
    end
    
    subgraph "API Endpoints"
        API1["POST /api/itinerary/generate"]
        API2["POST /api/chat"]
        API3["POST /api/admin/login"]
        API4["GET /api/admin/locations"]
    end
    
    subgraph "Services Backend"
        BE1["Itinerary Service"]
        BE2["Chatbot Service"]
        BE3["Auth Service"]
        BE4["Location Service"]
    end
    
    subgraph "Truy Cập Dữ Liệu"
        DB1["Prisma Client"]
        DB2[("Database")]
    end
    
    FE1 -->|Gửi form| API1
    FE3 -->|Gửi tin nhắn| API2
    FE4 -->|Đăng nhập| API3
    FE4 -->|Lấy dữ liệu| API4
    
    API1 --> BE1
    API2 --> BE2
    API3 --> BE3
    API4 --> BE4
    
    BE1 --> DB1
    BE2 --> DB1
    BE3 --> DB1
    BE4 --> DB1
    
    DB1 --> DB2
    
    BE2 -.AI.-> GEMINI["Google Gemini API"]
```

### 2.2 Sơ Đồ Phụ Thuộc Giữa Các Module

Mô tả sự phụ thuộc của code. Mũi tên chỉ hướng "phụ thuộc vào". Ví dụ: Controller phụ thuộc vào Service.

```mermaid
graph TD
    subgraph "Các Module Backend"
        SERVER["server.js<br/>Điểm Khởi Đầu"]
        
        ROUTES["routes/*<br/>Định Tuyến API"]
        CONTROLLERS["controllers/*<br/>Xử Lý Request"]
        SERVICES["services/*<br/>Logic Nghiệp Vụ"]
        MIDDLEWARE["middleware/*<br/>Mối Quan Tâm Chung"]
        ADAPTERS["adapters/*<br/>APIs Bên Ngoài"]
        UTILS["utils/*<br/>Hàm Hỗ Trợ"]
        
        PRISMA["prisma/schema.prisma<br/>Schema Database"]
    end
    
    SERVER --> ROUTES
    SERVER --> MIDDLEWARE
    
    ROUTES --> CONTROLLERS
    CONTROLLERS --> SERVICES
    
    SERVICES --> UTILS
    SERVICES --> PRISMA
    SERVICES --> ADAPTERS
    
    MIDDLEWARE --> UTILS
```

---

## 3. Luồng Dữ Liệu Chi Tiết

### 3.1 Quy Trình Tạo Lịch Trình (Itinerary Algorithm)

Đây là tính năng phức tạp nhất. Hệ thống sử dụng kết hợp thuật toán **Greedy (Tham lam)** để chọn địa điểm và **Nearest Neighbor (Hàng xóm gần nhất)** để sắp xếp lộ trình.

**Các bước xử lý:**
1.  **Nhận Input**: Ngày đi, Ngày về, Ngân sách, Sở thích (Biển, Núi, Ăn uống...).
2.  **Tính Ngân Sách**: Chia nhỏ ngân sách tổng thành: Vé tham quan (40%), Ăn uống (40%), Di chuyển (20%).
3.  **Lọc Địa Điểm**: Tìm trong DB các địa điểm phù hợp với sở thích và nằm trong ngân sách cho phép.
4.  **Chấm Điểm (Scoring)**: Mỗi địa điểm được chấm điểm dựa trên độ phù hợp với sở thích user.
5.  **Chọn Địa Điểm (Greedy)**: Lấy các địa điểm điểm cao nhất cho đến khi hết ngân sách hoặc hết thời gian.
6.  **Sắp Xếp (TSP)**: Từ khách sạn, tìm điểm gần nhất -> đi đến đó -> tìm điểm gần nhất tiếp theo.
7.  **Phân Bổ**: Chia các điểm đã sắp xếp vào Sáng - Trưa - Chiều - Tối của từng ngày.

```mermaid
sequenceDiagram
    actor User
    participant Frontend as React Frontend
    participant API as Express API
    participant Controller as Itinerary Controller
    participant Service as Itinerary Service
    participant Budget as Budget Service
    participant Location as Location Service
    participant DB as Database
    
    User->>Frontend: Điền form (ngày, tiền, sở thích)
    Frontend->>Frontend: Validate dữ liệu
    Frontend->>API: POST /api/itinerary/generate
    
    API->>Controller: Chuyển đến controller
    Controller->>Controller: Validate schema Zod
    
    Controller->>Service: generateItinerary()
    
    Note over Service: Bước 1: Tính toán ngân sách
    Service->>Budget: calculateBudgetBreakdown()
    Budget-->>Service: Chi tiết ngân sách (ăn, ở, chơi)
    
    Note over Service: Bước 2: Lấy dữ liệu địa điểm
    Service->>Location: getAllLocations()
    Location->>DB: prisma.location.findMany()
    DB-->>Location: Danh sách địa điểm
    Location-->>Service: Danh sách địa điểm
    
    Note over Service: Bước 3-5: Lọc và Chọn
    Service->>Service: Lọc theo sở thích
    Service->>Service: Chấm điểm địa điểm
    Service->>Service: Chọn địa điểm (Greedy)
    
    Note over Service: Bước 6: Tối ưu lộ trình (TSP)
    Service->>Service: Sắp xếp thứ tự đi (Nearest-neighbor)
    
    Note over Service: Bước 7: Lên lịch chi tiết
    Service->>Service: Phân bổ vào từng ngày
    
    Service-->>Controller: Kết quả lịch trình
    Controller-->>API: JSON response
    API-->>Frontend: HTTP 200 OK
    
    Frontend->>Frontend: Lưu vào LocalStorage
    Frontend->>User: Hiển thị bản đồ + lịch trình
```

### 3.2 Quy Trình Chatbot (RAG - Retrieval Augmented Generation)

Chatbot không chỉ "chém gió" mà còn trả lời chính xác nhờ kỹ thuật **RAG**.

**Cơ chế hoạt động:**
1.  **Tra cứu (Retrieval)**: Khi user hỏi, hệ thống tìm kiếm từ khóa trong bảng `Knowledge` (CSDL câu hỏi mẫu) và `Location` (Thông tin địa điểm).
2.  **Tăng cường (Augmented)**: Nếu tìm thấy thông tin, hệ thống ghép thông tin đó vào câu hỏi.
3.  **Sinh câu trả lời (Generation)**: Gửi toàn bộ ngữ cảnh (Context) + Câu hỏi cho Google Gemini để nó viết ra câu trả lời tự nhiên.

```mermaid
sequenceDiagram
    actor User
    participant Frontend as Chat Interface
    participant API as Express API
    participant Chatbot as Chatbot Service
    participant Knowledge as Knowledge Service
    participant Location as Location Service
    participant Gemini as Gemini API
    participant DB as Database
    
    User->>Frontend: Nhập tin nhắn
    Frontend->>API: POST /api/chat
    
    API->>Chatbot: processChatMessage()
    
    Note over Chatbot: Bước 1: Kiểm tra Knowledge Base
    Chatbot->>Knowledge: matchKnowledge()
    Knowledge->>DB: Tìm theo từ khóa
    DB-->>Knowledge: Kết quả tìm kiếm
    Knowledge-->>Chatbot: Thông tin tìm được
    
    alt Có thông tin trong KB
        Chatbot-->>API: Trả về câu trả lời có sẵn
    else Không có trong KB
        Note over Chatbot: Bước 2: Nhận diện ý định (Intent)
        Chatbot->>Chatbot: detectIntent()
        
        alt Intent: Ăn uống
        Chatbot->>Location: Tìm nhà hàng
        Location->>DB: Query DB
        DB-->>Location: Danh sách nhà hàng
        Chatbot-->>API: Gợi ý nhà hàng
        else Intent: Thời tiết
        Chatbot->>Location: Tìm chỗ trong nhà
        Location->>DB: Query DB
        DB-->>Location: Danh sách chỗ trong nhà
        Chatbot-->>API: Gợi ý chỗ trong nhà
        else Không rõ Intent - Dùng AI
        Note over Chatbot: Bước 3: Xử lý bằng AI
        Chatbot->>Chatbot: Tạo prompt cho AI
        Chatbot->>Gemini: Gọi Google Gemini API
        Gemini-->>Chatbot: Phản hồi từ AI
        Chatbot-->>API: Trả về phản hồi AI
        end
    end
    
    API-->>Frontend: JSON response
    Frontend->>User: Hiển thị tin nhắn
```

### 3.3 Quy Trình Đăng Nhập Admin

Sử dụng cơ chế **HttpOnly Cookie** để bảo mật tối đa, tránh bị đánh cắp Token qua XSS.

```mermaid
sequenceDiagram
    actor Admin
    participant Frontend as Admin Panel
    participant API as Express API
    participant Auth as Auth Service
    participant DB as Database
    participant Middleware as Auth Middleware
    
    Admin->>Frontend: Nhập username + password
    Frontend->>API: POST /api/admin/login
    
    API->>Auth: verifyAdmin()
    Auth->>DB: Tìm admin theo username
    DB-->>Auth: Thông tin admin (có hash pass)
    
    Auth->>Auth: So sánh password (bcrypt)
    
    alt Password Đúng
        Auth->>Auth: Tạo JWT token
        Auth-->>API: User info + Token
        API->>API: Set HttpOnly cookie
        API-->>Frontend: HTTP 200 OK
        Frontend->>Admin: Chuyển đến Dashboard
    else Password Sai
        Auth-->>API: Lỗi
        API-->>Frontend: HTTP 401 Unauthorized
        Frontend->>Admin: Hiện thông báo lỗi
    end
    
    Note over Admin,Middleware: Các request sau đó
    
    Admin->>Frontend: Truy cập trang quản trị
    Frontend->>API: Request kèm Cookie
    API->>Middleware: Kiểm tra Auth
    Middleware->>Middleware: Xác thực JWT
    
    alt Token Hợp lệ
        Middleware->>API: Cho phép đi tiếp
        API->>DB: Lấy dữ liệu
        DB-->>API: Dữ liệu
        API-->>Frontend: Hiển thị dữ liệu
    else Token Hết hạn/Sai
        Middleware-->>Frontend: HTTP 401
        Frontend->>Admin: Yêu cầu đăng nhập lại
    end
```

---

## 4. Kiến Trúc Database

### 4.1 Sơ Đồ Thực Thể (ERD)

```mermaid
erDiagram
    LOCATION {
        string id PK
        string name "Tên địa điểm"
        string type "Loại hình"
        string address "Địa chỉ"
        float ticket "Giá vé"
        boolean indoor "Trong nhà"
        string description "Mô tả"
        string menu "Menu món ăn"
    }
    
    ADMIN {
        string id PK
        string username "Tên đăng nhập"
        string passwordHash "Mật khẩu hash"
        string role "Quyền hạn"
    }
    
    KNOWLEDGE {
        string id PK
        string question "Câu hỏi"
        string answer "Câu trả lời"
        string keywords "Từ khóa"
    }
    
    ACCESSLOG {
        string id PK
        datetime timestamp "Thời gian"
        string ipAddress "IP"
    }
    
    SEARCHTREND {
        string id PK
        string term "Từ khóa tìm kiếm"
        int count "Số lần tìm"
    }
    
    CHATLOG {
        string id PK
        string userMessage "Tin nhắn user"
        string botResponse "Phản hồi bot"
    }
```

### 4.2 Mô Tả Chi Tiết Các Bảng

1.  **Location (Địa điểm)**: Bảng quan trọng nhất. Chứa dữ liệu du lịch.
    *   `type`: Phân loại (Biển, Núi, Chùa, Nhà hàng...). Dùng để lọc theo sở thích.
    *   `indoor`: Boolean. Dùng để gợi ý khi trời mưa.
    *   `ticket`: Giá vé. Dùng để tính toán ngân sách.
2.  **Admin**: Tài khoản quản trị viên. Mật khẩu được mã hóa bằng `bcrypt` trước khi lưu.
3.  **Knowledge**: "Bộ não" tĩnh của Chatbot. Chứa các cặp câu hỏi-đáp cố định (Ví dụ: "Giá vé Bà Nà bao nhiêu?").
4.  **AccessLog**: Ghi lại mỗi lần có người vào trang web. Dùng để vẽ biểu đồ "Lưu lượng truy cập".
5.  **SearchTrend**: Ghi lại từ khóa người dùng tìm kiếm. Giúp Admin biết xu hướng du lịch.
6.  **ChatLog**: Lưu lại hội thoại để Admin xem lại và cải thiện Chatbot.

---

## 5. Kiến Trúc Backend

Backend được tổ chức theo mô hình **Layered Architecture** (Kiến trúc phân lớp) để dễ bảo trì.

### 5.1 Cấu Trúc Module

```mermaid
graph TD
    subgraph "Entry Point"
        SERVER["server.js"]
    end
    
    subgraph "Routes - API"
        R_ITINERARY["itinerary.routes.js"]
        R_CHAT["chatbot.routes.js"]
        R_ADMIN["admin.routes.js"]
        R_LOCATION["location.routes.js"]
    end
    
    subgraph "Controllers - Xử lý"
        C_ITINERARY["itinerary.controller.js"]
        C_CHAT["chatbot.controller.js"]
        C_ADMIN["admin.controller.js"]
    end
    
    subgraph "Services - Logic"
        S_ITINERARY["itinerary.service.js"]
        S_CHAT["chatbot.service.js"]
        S_BUDGET["budget.service.js"]
        S_LOCATION["location.service.js"]
        S_AUTH["auth.service.js"]
    end
    
    subgraph "Database"
        PRISMA["Prisma ORM"]
    end
    
    SERVER --> R_ITINERARY
    SERVER --> R_CHAT
    SERVER --> R_ADMIN
    
    R_ITINERARY --> C_ITINERARY
    R_CHAT --> C_CHAT
    R_ADMIN --> C_ADMIN
    
    C_ITINERARY --> S_ITINERARY
    C_CHAT --> S_CHAT
    C_ADMIN --> S_AUTH
    
    S_ITINERARY --> S_BUDGET
    S_ITINERARY --> S_LOCATION
    S_CHAT --> S_LOCATION
    
    S_LOCATION --> PRISMA
    S_AUTH --> PRISMA
```

---

## 6. Kiến Trúc Frontend

Frontend được xây dựng bằng React, tập trung vào trải nghiệm người dùng (UX) mượt mà.

### 6.1 Cây Component

```mermaid
graph TD
    ROOT["main.jsx"] --> APP["App.jsx"]
    
    APP --> HOME["Trang Chủ"]
    APP --> ITINERARY["Trang Lịch Trình"]
    APP --> CHAT["Trang Chat"]
    APP --> ADMIN["Trang Admin"]
    
    subgraph "Trang Chủ"
        HOME --> TRIPFORM["Form Lập Lịch"]
        TRIPFORM --> DATE["Chọn Ngày"]
        TRIPFORM --> BUDGET["Nhập Ngân Sách"]
        TRIPFORM --> PREF["Chọn Sở Thích"]
    end
    
    subgraph "Trang Lịch Trình"
        ITINERARY --> MAP["Bản Đồ"]
        ITINERARY --> TIMELINE["Lịch Trình Chi Tiết"]
        TIMELINE --> DAY["Thẻ Ngày"]
        DAY --> ACTIVITY["Thẻ Hoạt Động"]
    end
    
    subgraph "Trang Chat"
        CHAT --> CHATUI["Giao Diện Chat"]
        CHATUI --> MSG["Tin Nhắn"]
        CHATUI --> INPUT["Ô Nhập Liệu"]
    end
    
    subgraph "Trang Admin"
        ADMIN --> DASHBOARD["Bảng Điều Khiển"]
        DASHBOARD --> LOC_MGR["Quản Lý Địa Điểm"]
        DASHBOARD --> KNOW_MGR["Quản Lý Knowledge"]
        DASHBOARD --> STATS["Thống Kê"]
    end
```

### 6.2 Luồng Quản Lý State

```mermaid
graph LR
    subgraph "Hành Động User"
        UA1["Gửi Form"]
        UA2["Gửi Tin Nhắn"]
        UA3["Đăng Nhập Admin"]
    end
    
    subgraph "React State"
        STATE1["State Form"]
        STATE2["State Tin Nhắn"]
        STATE3["State User"]
    end
    
    subgraph "API Calls"
        API1["generateItinerary"]
        API2["sendChatMessage"]
        API3["adminLogin"]
    end
    
    subgraph "Lưu Trữ"
        LS["LocalStorage"]
    end
    
    UA1 --> STATE1 --> API1 --> LS
    UA2 --> STATE2 --> API2 --> STATE2
    UA3 --> STATE3 --> API3 --> LS
```

---

## 7. Kiến Trúc Bảo Mật

Bảo mật là ưu tiên hàng đầu, đặc biệt là với trang Admin.

### 7.1 Các Lớp Bảo Mật

```mermaid
graph TB
    subgraph "Mạng"
        L1["HTTPS"]
        L2["Firewall"]
    end
    
    subgraph "Ứng Dụng"
        L3["CORS - Chặn domain lạ"]
        L4["Rate Limit - Chặn spam"]
        L5["Helmet - Header bảo mật"]
        L6["Input Validation - Kiểm tra dữ liệu"]
    end
    
    subgraph "Xác Thực"
        L7["JWT Token"]
        L8["Mã hóa mật khẩu"]
        L9["HttpOnly Cookie"]
    end
    
    subgraph "Dữ Liệu"
        L10["Chống SQL Injection"]
        L11["Biến môi trường .env"]
    end
    
    L1 --> L3
    L3 --> L4
    L4 --> L7
    L7 --> L10
```

### 7.2 Giải Thích Cơ Chế Bảo Mật
1.  **CORS (Cross-Origin Resource Sharing)**: Chỉ cho phép Frontend (localhost:5173) gọi API. Các trang web khác không thể gọi trộm API của chúng ta.
2.  **JWT (JSON Web Token)**: Dùng để xác thực Admin. Token chứa thông tin user và thời hạn hiệu lực.
3.  **HttpOnly Cookie**: Token không được lưu ở LocalStorage (dễ bị hack lấy trộm) mà lưu trong Cookie đặc biệt. JavaScript không thể đọc được Cookie này, giúp chống tấn công XSS.
4.  **Bcrypt**: Mật khẩu Admin không bao giờ được lưu dưới dạng văn bản thường (plain text). Nó được băm (hash) ra chuỗi ký tự ngẫu nhiên không thể dịch ngược.

---

## 8. Kiến Trúc Triển Khai

### 8.1 Hạ Tầng Production

Khi đưa lên mạng (Deploy), hệ thống sẽ chạy như sau:

```mermaid
graph TB
    subgraph "Internet"
        USER["Người Dùng"]
    end

    subgraph "Server"
        NGINX["Nginx (Reverse Proxy)"]
        APP["Node.js App (PM2)"]
        DB[("PostgreSQL")]
    end
    
    USER --> NGINX
    NGINX --> APP
    APP --> DB
```

### 8.2 Môi Trường Dev vs Prod

```mermaid
graph LR
    subgraph "Development (Máy cá nhân)"
        DEV_FE["Frontend (Vite)"]
        DEV_BE["Backend (Nodemon)"]
        DEV_DB[("SQLite")]
        
        DEV_FE --> DEV_BE --> DEV_DB
    end
    
    subgraph "Production (Server thật)"
        PROD_FE["Nginx"]
        PROD_BE["Node.js (PM2)"]
        PROD_DB[("PostgreSQL")]
        
        PROD_FE --> PROD_BE --> PROD_DB
    end
```

**Sự khác biệt chính:**
*   **Database**: Dev dùng SQLite (file) cho gọn nhẹ. Prod dùng PostgreSQL để chịu tải cao và ổn định.
*   **Process Manager**: Dev dùng `nodemon` để tự restart khi sửa code. Prod dùng `PM2` để quản lý tiến trình, tự khởi động lại khi crash.
*   **Web Server**: Prod dùng Nginx làm cổng đón request, giúp xử lý SSL (HTTPS) và cân bằng tải.
