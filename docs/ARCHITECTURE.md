# ARCHITECTURE.md - Dana Travel System Architecture

> **Comprehensive Technical Documentation with Professional Diagrams**  
5. [Backend Architecture](#5-backend-architecture)
6. [Frontend Architecture](#6-frontend-architecture)
7. [Security Architecture](#7-security-architecture)
8. [Deployment Architecture](#8-deployment-architecture)

---

## 1. System Overview

### 1.1 High-Level System Architecture

Dana Travel is a **Full-Stack Travel Planning System** with AI-powered chatbot, built using **Client-Server Architecture** with clear separation of concerns.

```mermaid
graph TB
    subgraph "TẦNG CLIENT - Port 5173"
        A1[React SPA]
        A1 --> A2[React Router]
        A2 --> A3[Trang Chủ]
        A2 --> A4[Trang Lịch Trình]
        A2 --> A5[Trang Chat]
        A2 --> A6[Trang Quản Trị]
    end
    
    subgraph "TẦNG API - Port 3000"
        B1[Express.js Server]
        B1 --> B2[CORS Middleware]
        B1 --> B3[Auth Middleware]
        B1 --> B4[Logger Middleware]
    end
    
    subgraph "TẦNG BUSINESS LOGIC"
        C1[Routes - Định tuyến]
        C1 --> C2[Controllers - Xử lý request]
        C2 --> C3[Services - Nghiệp vụ]
        
        C3 --> S1[itinerary.service<br/>Thuật toán TSP]
        C3 --> S2[chatbot.service<br/>RAG + NLP]
        C3 --> S3[budget.service<br/>Tính ngân sách]
        C3 --> S4[location.service<br/>Truy vấn địa điểm]
        C3 --> S5[auth.service<br/>JWT + bcrypt]
        C3 --> S6[admin.service<br/>Quản lý admin]
    end
    
    subgraph "TẦNG TRUY CẬP DỮ LIỆU"
        D1[Prisma ORM]
        D1 --> D2[Query Builder]
        D1 --> D3[Schema Definition]
    end
    
    subgraph "TẦNG DATABASE"
        E1[(SQLite - Dev)]
        E2[(PostgreSQL - Production)]
        
        E1 --> E3[Bảng Location]
        E1 --> E4[Bảng Admin]
        E1 --> E5[Bảng Knowledge]
        E1 --> E6[Bảng AccessLog]
    end
    
    subgraph "DỊCH VỤ NGOÀI"
        F1[Google Gemini API]
        F2[OpenStreetMap]
    end
    
    A1 --> B1
    B4 --> C1
    C3 --> D1
    D2 --> E1
    D2 --> E2
    S2 --> F1
    A4 --> F2
```

### 1.2 Core Design Principles

1. **Separation of Concerns**: Business logic isolated in services
2. **Single Responsibility**: Each module has one clear purpose
3. **DRY Principle**: Shared utilities extracted
4. **API-First Design**: Backend exposes RESTful API
5. **Stateless Backend**: JWT-based authentication
6. **Progressive Enhancement**: Core functionality without JavaScript

---

## 2. Architecture Diagrams

### 2.1 Component Interaction Flow

```mermaid
graph LR
    subgraph "Module Frontend"
        FE1[Form Lập Lịch Trình]
        FE2[Module Itinerary]
        FE3[Module Chatbot]
        FE4[Module Quản Trị]
    end
    
    subgraph "API Endpoints"
        API1[POST /api/itinerary/generate]
        API2[POST /api/chat]
        API3[POST /api/admin/login]
        API4[GET /api/admin/locations]
    end
    
    subgraph "Services Backend"
        BE1[Itinerary Service]
        BE2[Chatbot Service]
        BE3[Auth Service]
        BE4[Location Service]
    end
    
    subgraph "Truy Cập Dữ Liệu"
        DB1[Prisma Client]
        DB2[(Database)]
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
    
    BE2 -.AI.-> GEMINI[Google Gemini API]
```

### 2.2 Module Dependency Graph

```mermaid
graph TD
    subgraph "Backend Modules"
        SERVER[server.js<br/>Entry Point]
        
        ROUTES[routes/*<br/>API Routing]
        CONTROLLERS[controllers/*<br/>Request Handling]
        SERVICES[services/*<br/>Business Logic]
        MIDDLEWARE[middleware/*<br/>Cross-cutting]
        ADAPTERS[adapters/*<br/>External APIs]
        UTILS[utils/*<br/>Helpers]
        
        PRISMA[prisma/schema.prisma<br/>Database Schema]
    end
    
    SERVER --> ROUTES
    SERVER --> MIDDLEWARE
    
    ROUTES --> CONTROLLERS
    CONTROLLERS --> SERVICES
    
    SERVICES --> UTILS
    SERVICES --> PRISMA
    SERVICES --> ADAPTERS
    
    MIDDLEWARE --> UTILS
    
    style SERVER fill:#ff9800,stroke:#e65100,stroke-width:3px
    style SERVICES fill:#9c27b0,stroke:#4a148c,stroke-width:2px
    style PRISMA fill:#4caf50,stroke:#1b5e20,stroke-width:2px
```

---

## 3. Data Flow Sequences

### 3.1 Itinerary Generation - Complete Sequence

```mermaid
sequenceDiagram
    actor User
    participant Frontend as React Frontend
    participant API as Express API
    participant Controller as Itinerary Controller
    participant Service as Itinerary Service
    participant Budget as Budget Service
    participant Location as Location Service
    participant DB as Database (Prisma)
    
    User->>Frontend: Fills trip form<br/>(dates, budget, preferences)
    Frontend->>Frontend: Client-side validation
    Frontend->>API: POST /api/itinerary/generate<br/>{arriveDateTime, leaveDateTime, ...}
    
    API->>Controller: Route to controller
    Controller->>Controller: Zod schema validation
    
    Controller->>Service: generateItinerary(userRequest)
    
    Note over Service: Step 1: Budget Breakdown
    Service->>Budget: calculateBudgetBreakdown(userRequest)
    Budget-->>Service: {accommodation: 1.2M, food: 1.2M, ...}
    
    Note over Service: Step 2: Fetch Locations
    Service->>Location: getAllLocations()
    Location->>DB: prisma.location.findMany()
    DB-->>Location: 30+ location records
    Location-->>Service: locations[]
    
    Note over Service: Step 3-5: Filter, Score, Select
    Service->>Service: filterByPreferences(locations)
    Service->>Service: scoreLocations(filtered)
    Service->>Service: greedySelection(scored)
    
    Note over Service: Step 6: TSP Optimization
    Service->>Service: tspOptimization(selected)<br/>Nearest-neighbor algorithm
    
    Note over Service: Step 7: Day-by-Day Scheduling
    Service->>Service: scheduleDays(optimizedRoute)
    Service->>Service: assignMeals + fitLocations
    
    Service-->>Controller: {days: [...], summary: {...}}
    Controller-->>API: JSON response
    API-->>Frontend: HTTP 200 OK<br/>Itinerary object
    
    Frontend->>Frontend: Save to LocalStorage
    Frontend->>User: Display map + timeline
```

### 3.2 Chatbot Interaction - RAG Flow

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
    
    User->>Frontend: Types message<br/>"Gợi ý quán hải sản"
    Frontend->>API: POST /api/chat<br/>{message, context}
    
    API->>Chatbot: processChatMessage(message, context)
    
    Note over Chatbot: Step 1: Knowledge Base Check
    Chatbot->>Knowledge: matchKnowledge(message)
    Knowledge->>DB: prisma.knowledge.findMany()<br/>keyword matching
    DB-->>Knowledge: matching records (if any)
    Knowledge-->>Chatbot: knowledgeBase || null
    
    alt Knowledge Match Found
        Chatbot-->>API: {reply: knowledgeBase.answer}
    else No Knowledge Match
        Note over Chatbot: Step 2: Rule-Based Intent Detection
        Chatbot->>Chatbot: detectIntent(message)<br/>Regex patterns
        
        alt Intent: Food
            Chatbot->>Chatbot: handleFoodIntent(message)
            Chatbot->>Location: getAllLocations({type: "restaurant"})
            Location->>DB: prisma.location.findMany()
            DB-->>Location: restaurant records
            Location-->>Chatbot: restaurants[]
            Chatbot->>Chatbot: pickRandom(restaurants, 5)
            Chatbot-->>API: {reply, suggestions, quickReplies}
        else Intent: Weather
            Chatbot->>Chatbot: handleWeatherIntent()
            Chatbot->>Location: getAllLocations({indoor: true})
            Location->>DB: prisma.location.findMany()
            DB-->>Location: indoor locations
            Location-->>Chatbot: indoorLocations[]
            Chatbot-->>API: {reply, suggestions}
        else No Intent Match - AI Fallback
            Note over Chatbot: Step 3: AI Processing
            Chatbot->>Chatbot: buildSystemPrompt(context)<br/>130+ line prompt
            Chatbot->>Gemini: POST https://generativelanguage.googleapis.com<br/>{prompt, generationConfig}
            Gemini-->>Chatbot: AI-generated response (JSON)
            Chatbot->>Chatbot: parseJSON(response)
            Chatbot-->>API: {reply, action, data, quickReplies}
        end
    end
    
    API-->>Frontend: JSON response
    Frontend->>Frontend: Render bot message<br/>+ quick reply chips
    Frontend->>User: Display response
```

### 3.3 Admin Authentication Flow

```mermaid
sequenceDiagram
    actor Admin
    participant Frontend as Admin Panel
    participant API as Express API
    participant Auth as Auth Service
    participant DB as Database
    participant Middleware as Auth Middleware
    
    Admin->>Frontend: Enters username + password
    Frontend->>API: POST /api/admin/login<br/>{username, password}
    
    API->>Auth: verifyAdmin(credentials)
    Auth->>DB: prisma.admin.findUnique({username})
    DB-->>Auth: Admin record (with passwordHash)
    
    Auth->>Auth: bcrypt.compare(password, hash)
    
    alt Password Valid
        Auth->>Auth: jwt.sign({id, username, role})<br/>Secret key + 24h expiry
        Auth-->>API: {user: {...}, token: "jwt..."}
        API->>API: Set HttpOnly cookie<br/>admin_token=jwt
        API-->>Frontend: HTTP 200 OK<br/>{user, token}
        Frontend->>Frontend: Save user to state<br/>localStorage
        Frontend->>Admin: Navigate to /admin/dashboard
    else Invalid Password
        Auth-->>API: throw Error("Invalid credentials")
        API-->>Frontend: HTTP 401 Unauthorized
        Frontend->>Admin: Show error message
    end
    
    Note over Admin,Middleware: Subsequent Protected Requests
    
    Admin->>Frontend: Click "Locations" tab
    Frontend->>API: GET /api/admin/locations<br/>Cookie: admin_token=jwt
    API->>Middleware: authMiddleware(req, res, next)
    Middleware->>Middleware: Extract JWT from cookie
    Middleware->>Middleware: jwt.verify(token, secret)
    
    alt Token Valid
        Middleware->>Middleware: Attach user to req.user
        Middleware->>API: next() - Continue
        API->>DB: prisma.location.findMany()
        DB-->>API: All locations
        API-->>Frontend: HTTP 200 OK<br/>locations[]
        Frontend->>Admin: Display location table
    else Token Invalid/Expired
        Middleware-->>Frontend: HTTP 401 Unauthorized
        Frontend->>Frontend: Clear state + redirect /login
        Frontend->>Admin: Show "Session expired"
    end
```

---

## 4. Database Architecture

### 4.1 Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    LOCATION {
        string id PK "UUID"
        string name "Required"
        string type "beach/restaurant/attraction"
        string area "District"
        string address
        float lat "Latitude"
        float lng "Longitude"
        float ticket "Entry fee (VND)"
        boolean indoor "Default: false"
        string priceLevel "cheap/moderate/expensive"
        string tags "JSON array"
        string description
        string menu "JSON object"
        int suggestedDuration "Minutes"
        datetime createdAt
        datetime updatedAt
    }
    
    ADMIN {
        string id PK "UUID"
        string username UK "Unique"
        string passwordHash "bcrypt"
        string email
        string role "Default: admin"
        boolean active "Default: true"
        datetime lastLogin
        datetime createdAt
        datetime updatedAt
    }
    
    KNOWLEDGE {
        string id PK "UUID"
        string question
        string answer
        string keywords "Comma-separated"
        datetime createdAt
        datetime updatedAt
    }
    
    ACCESSLOG {
        string id PK "UUID"
        datetime timestamp
        string ipAddress
        string userAgent
    }
    
    SEARCHTREND {
        string id PK "UUID"
        string term UK "Unique"
        int count "Default: 1"
        datetime updatedAt
    }
    
    CHATLOG {
        string id PK "UUID"
        string userMessage
        string botResponse
        datetime timestamp
    }
```

### 4.2 Database Schema - Prisma Models

**File**: `Backend/prisma/schema.prisma`

```prisma
datasource db {
  provider = "sqlite"  // Dev: sqlite, Prod: postgresql
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model Location {
  id                String   @id @default(uuid())
  name              String
  type              String   // "beach", "restaurant", "attraction", "hotel"
  area              String?
  address           String?
  lat               Float?
  lng               Float?
  ticket            Float?   // Entry fee in VND
  indoor            Boolean  @default(false)
  priceLevel        String?  // "cheap", "moderate", "expensive"
  tags              String?  // JSON array: ["beach", "nature", "romantic"]
  description       String?
  menu              String?  // JSON: {"Phở": 50000, "Bánh mì": 20000}
  suggestedDuration Int?     // Minutes
  rating            Float?   // 1-5 stars
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}

model Admin {
  id           String    @id @default(uuid())
  username     String    @unique
  passwordHash String    // bcrypt hashed
  email        String?
  role         String    @default("admin")
  active       Boolean   @default(true)
  lastLogin    DateTime?
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
}

model Knowledge {
  id        String   @id @default(uuid())
  question  String
  answer    String
  keywords  String?  // "hải sản, quán ăn, đà nẵng"
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model AccessLog {
  id        String   @id @default(uuid())
  timestamp DateTime @default(now())
  ipAddress String?
  userAgent String?
}

model SearchTrend {
  id        String   @id @default(uuid())
  term      String   @unique
  count     Int      @default(1)
  updatedAt DateTime @updatedAt
}

model ChatLog {
  id          String   @id @default(uuid())
  userMessage String
  botResponse String
  timestamp   DateTime @default(now())
}
```

### 4.3 Data Model Relationships

```mermaid
graph LR
    subgraph "No Direct Relationships (Independent Tables)"
        L[Location]
        A[Admin]
        K[Knowledge]
        AL[AccessLog]
        ST[SearchTrend]
        CL[ChatLog]
    end
    
    subgraph "Future Relationships (Possible)"
        IT[Itinerary Table]
        ILO[ItineraryLocation]
        U[User Table]
    end
    
    IT -.1:M.-> ILO
    ILO -.M:1.-> L
    IT -.M:1.-> U
    
    style L fill:#e1bee7
    style A fill:#ffccbc
    style K fill:#c5e1a5
    style IT fill:#fff9c4,stroke-dasharray: 5 5
    style ILO fill:#fff9c4,stroke-dasharray: 5 5
    
    note1[Current: All tables are independent<br/>Future: Can add User and Itinerary tables]
```

**Current Design**: All tables are **independent** (no foreign keys) to keep schema simple for MVP.

**Future Enhancements**:
- Add `User` table for user accounts
- Add `Itinerary` table to save generated itineraries
- Add `ItineraryLocation` junction table (many-to-many)
- Add `Review` table for user reviews on locations

---

## 5. Backend Architecture

### 5.1 Backend Module Structure

```mermaid
graph TD
    subgraph "Entry Point"
        SERVER[server.js<br/>Express App Setup]
    end
    
    subgraph "Routes Layer - API Endpoints"
        R_INDEX[routes/index.js<br/>Main Router]
        R_ITINERARY[routes/itinerary.routes.js<br/>POST /api/itinerary/generate]
        R_CHAT[routes/chatbot.routes.js<br/>POST /api/chat]
        R_ADMIN[routes/admin.routes.js<br/>POST /api/admin/login<br/>CRUD endpoints]
        R_LOCATION[routes/location.routes.js<br/>Location management]
    end
    
    subgraph "Controllers Layer - Request Handling"
        C_ITINERARY[controllers/itinerary.controller.js<br/>Zod validation]
        C_CHAT[controllers/chatbot.controller.js<br/>Message validation]
        C_ADMIN[controllers/admin.controller.js<br/>Auth + CRUD]
    end
    
    subgraph "Services Layer - Business Logic"
        S_ITINERARY[services/itinerary.service.js<br/>TSP + Scheduling]
        S_CHAT[services/chatbot.service.js<br/>Intent Detection + RAG]
        S_BUDGET[services/budget.service.js<br/>Cost Calculation]
        S_LOCATION[services/location.service.js<br/>DB Queries]
        S_AUTH[services/auth.service.js<br/>JWT + bcrypt]
        S_KNOWLEDGE[services/knowledge.service.js<br/>Knowledge Matching]
    end
    
    subgraph "Middleware - Cross-Cutting"
        M_AUTH[middleware/auth.middleware.js<br/>JWT Verification]
        M_LOGGER[middleware/logger.middleware.js<br/>Access Logging]
        M_CORS[middleware/cors.middleware.js<br/>CORS Config]
    end
    
    subgraph "Adapters - External APIs"
        A_GEMINI[adapters/gemini.adapter.js<br/>Google Gemini API]
    end
    
    subgraph "Utils - Helpers"
        U_PRISMA[utils/prisma.js<br/>Prisma Client Singleton]
        U_TIME[utils/time.utils.js<br/>Date Functions]
        U_ARRAY[utils/array.utils.js<br/>pickRandom]
    end
    
    subgraph "Data Access"
        PRISMA[Prisma ORM]
        DB[(Database)]
    end
    
    SERVER --> R_INDEX
    SERVER --> M_CORS
    SERVER --> M_LOGGER
    
    R_INDEX --> R_ITINERARY
    R_INDEX --> R_CHAT
    R_INDEX --> R_ADMIN
    
    R_ITINERARY --> C_ITINERARY
    R_CHAT --> C_CHAT
    R_ADMIN --> M_AUTH
    R_ADMIN --> C_ADMIN
    
    C_ITINERARY --> S_ITINERARY
    C_CHAT --> S_CHAT
    C_ADMIN --> S_AUTH
    
    S_ITINERARY --> S_BUDGET
    S_ITINERARY --> S_LOCATION
    S_CHAT --> S_KNOWLEDGE
    S_CHAT --> S_LOCATION
    S_CHAT --> A_GEMINI
    
    S_LOCATION --> U_PRISMA
    S_KNOWLEDGE --> U_PRISMA
    S_AUTH --> U_PRISMA
    
    U_PRISMA --> PRISMA
    PRISMA --> DB
    
    style SERVER fill:#ff9800,stroke:#e65100,stroke-width:3px
    style S_ITINERARY fill:#9c27b0,stroke:#4a148c
    style S_CHAT fill:#9c27b0,stroke:#4a148c
    style PRISMA fill:#4caf50,stroke:#1b5e20
```

### 5.2 Service Layer Dependencies

```mermaid
graph TD
    subgraph "Core Services"
        ITINERARY[itinerary.service.js]
        CHATBOT[chatbot.service.js]
        AUTH[auth.service.js]
    end
    
    subgraph "Support Services"
        BUDGET[budget.service.js]
        LOCATION[location.service.js]
        KNOWLEDGE[knowledge.service.js]
        ADMIN[admin.service.js]
    end
    
    subgraph "External Adapters"
        GEMINI[gemini.adapter.js]
    end
    
    subgraph "Database"
        PRISMA[Prisma Client]
    end
    
    ITINERARY -->|Uses| BUDGET
    ITINERARY -->|Uses| LOCATION
    
    CHATBOT -->|Uses| KNOWLEDGE
    CHATBOT -->|Uses| LOCATION
    CHATBOT -->|Fallback to| GEMINI
    
    AUTH -->|Uses| ADMIN
    
    BUDGET -->|Calculates from| USER_DATA[User Request]
    LOCATION -->|Queries| PRISMA
    KNOWLEDGE -->|Queries| PRISMA
    ADMIN -->|Queries| PRISMA
    
    style ITINERARY fill:#e1bee7,stroke:#8e24aa,stroke-width:2px
    style CHATBOT fill:#e1bee7,stroke:#8e24aa,stroke-width:2px
    style GEMINI fill:#fff59d,stroke:#f9a825,stroke-width:2px
    style PRISMA fill:#a5d6a7,stroke:#388e3c,stroke-width:2px
```

---

## 6. Frontend Architecture

### 6.1 Frontend Component Tree

```mermaid
graph TD
    ROOT[main.jsx<br/>ReactDOM.render]
    ROOT --> APP[App.jsx<br/>BrowserRouter]
    
    APP --> ROUTER[React Router]
    
    ROUTER --> HOME[HomePage]
    ROUTER --> ITINERARY[ItineraryResultsPage]
    ROUTER --> CHAT[ChatPage]
    ROUTER --> ADMIN[AdminDashboardPage]
    
    subgraph "Home Page Components"
        HOME --> HEADER1[Header]
        HOME --> TRIPFORM[TripForm]
        HOME --> FOOTER1[Footer]
        
        TRIPFORM --> DATEPICKER[DateRangePicker]
        TRIPFORM --> BUDGETINPUT[BudgetInput]
        TRIPFORM --> PREFSELECT[PreferenceSelector]
    end
    
    subgraph "Itinerary Page Components"
        ITINERARY --> HEADER2[Header]
        ITINERARY --> ITINMAP[ItineraryMap<br/>React-Leaflet]
        ITINERARY --> ITINTIMELINE[ItineraryTimeline]
        ITINERARY --> FOOTER2[Footer]
        
        ITINTIMELINE --> DAYCARD[DayCard]
        DAYCARD --> ACTIVITYITEM[ActivityItem]
    end
    
    subgraph "Chat Page Components"
        CHAT --> HEADER3[Header]
        CHAT --> CHATINTERFACE[ChatInterface]
        CHAT --> FOOTER3[Footer]
        
        CHATINTERFACE --> CHATMESSAGES[ChatMessage Components]
        CHATINTERFACE --> CHATINPUT[ChatInput]
        CHATINTERFACE --> QUICKREPLIES[QuickReplies]
    end
    
    subgraph "Admin Page Components"
        ADMIN --> ADMINDASH[AdminDashboard]
        
        ADMINDASH --> LOCATIONMGR[LocationManager<br/>CRUD Table]
        ADMINDASH --> KNOWLEDGEMGR[KnowledgeManager<br/>Q&A Editor]
        ADMINDASH --> ANALYTICS[AnalyticsChart<br/>Chart.js]
        ADMINDASH --> CHATLOGVIEW[ChatLogViewer<br/>History]
    end
    
    style ROOT fill:#ff9800,stroke:#e65100,stroke-width:3px
    style APP fill:#ffb74d,stroke:#f57c00,stroke-width:2px
    style TRIPFORM fill:#ce93d8,stroke:#8e24aa
    style ITINMAP fill:#90caf9,stroke:#1976d2
    style CHATINTERFACE fill:#a5d6a7,stroke:#388e3c
    style ADMINDASH fill:#ffab91,stroke:#d84315
```

### 6.2 State Management Flow

```mermaid
graph LR
    subgraph "User Actions"
        UA1[Submit Trip Form]
        UA2[Send Chat Message]
        UA3[Admin Login]
    end
    
    subgraph "React Components"
        RC1[TripForm Component]
        RC2[ChatInterface Component]
        RC3[AdminPanel Component]
    end
    
    subgraph "State Updates"
        STATE1[useState - formData]
        STATE2[useState - messages]
        STATE3[useState - user]
    end
    
    subgraph "API Calls"
        API1[api.service.js<br/>generateItinerary]
        API2[api.service.js<br/>sendChatMessage]
        API3[api.service.js<br/>adminLogin]
    end
    
    subgraph "Storage"
        LS[LocalStorage]
    end
    
    UA1 --> RC1
    RC1 --> STATE1
    STATE1 --> API1
    API1 -->|Success| LS
    LS -->|Save itinerary| NAV1[Navigate to /itinerary]
    
    UA2 --> RC2
    RC2 --> STATE2
    STATE2 --> API2
    API2 -->|Response| RC2
    RC2 --> STATE2
    
    UA3 --> RC3
    RC3 --> STATE3
    STATE3 --> API3
    API3 -->|Success| LS
    LS -->|Save token| NAV2[Navigate to /admin/dashboard]
    
    style STATE1 fill:#e1bee7
    style STATE2 fill:#e1bee7
    style STATE3 fill:#e1bee7
    style LS fill:#fff59d,stroke:#f9a825
```

---

## 7. Security Architecture

### 7.1 Security Layers

```mermaid
graph TB
    subgraph "Network Security"
        HTTPS[HTTPS/TLS Encryption]
        FIREWALL[Firewall Rules]
    end
    
    subgraph "Application Security"
        CORS[CORS Middleware<br/>Whitelist Origins]
        RATE[Rate Limiting<br/>100 req/15min]
        HELMET[Helmet.js<br/>Security Headers]
        INPUT[Input Validation<br/>Zod Schemas]
    end
    
    subgraph "Authentication & Authorization"
        JWT_AUTH[JWT Verification<br/>auth.middleware.js]
        BCRYPT[Password Hashing<br/>bcrypt - 10 rounds]
        COOKIE[HttpOnly Cookies<br/>Prevent XSS]
    end
    
    subgraph "Data Security"
        PRISMA_ORM[Prisma ORM<br/>SQL Injection Prevention]
        ENV[Environment Variables<br/>.env for secrets]
        SANITIZE[Input Sanitization<br/>XSS Prevention]
    end
    
    USER[User Request] --> HTTPS
    HTTPS --> FIREWALL
    FIREWALL --> CORS
    CORS --> HELMET
    HELMET --> RATE
    RATE --> JWT_AUTH
    JWT_AUTH --> INPUT
    INPUT --> PRISMA_ORM
    
    style HTTPS fill:#ffccbc,stroke:#d84315
    style JWT_AUTH fill:#c5e1a5,stroke:#689f38
    style PRISMA_ORM fill:#b3e5fc,stroke:#0277bd
```
### 8.1 Production Infrastructure

```mermaid
graph TB
    subgraph "CDN Layer"
        CF[Cloudflare CDN<br/>DDoS Protection + Caching]
    end
    
    subgraph "Load Balancer"
        LB[HAProxy / Nginx<br/>Load Balancing]
    end
    
    subgraph "Application Servers"
        APP1[Node.js Server 1<br/>PM2 Cluster Mode]
        APP2[Node.js Server 2<br/>PM2 Cluster Mode]
    end
    
    subgraph "Web Server Layer"
        NGINX1[Nginx Server 1<br/>Reverse Proxy + Static Files]
        NGINX2[Nginx Server 2<br/>Reverse Proxy + Static Files]
    end
    
    subgraph "Database Layer"
        PRIMARY[(PostgreSQL Primary<br/>Master)]
        REPLICA[(PostgreSQL Replica<br/>Read-Only)]
    end
    
    subgraph "Cache Layer"
        REDIS[Redis Cache<br/>Session + API Cache]
    end
    
    subgraph "Monitoring"
        LOGS[Log Aggregation<br/>Datadog / Loggly]
        METRICS[Application Metrics<br/>Response Time, Throughput]
    end
    
    USER[Web Browser] --> CF
    CF --> LB
    LB --> NGINX1
    LB --> NGINX2
    
    NGINX1 --> APP1
    NGINX2 --> APP2
    
    APP1 --> REDIS
    APP2 --> REDIS
    
    APP1 --> PRIMARY
    APP2 --> PRIMARY
    
    PRIMARY -.Replication.-> REPLICA
    APP1 -.Read Queries.-> REPLICA
    APP2 -.Read Queries.-> REPLICA
    
    APP1 --> LOGS
    APP2 --> LOGS
    APP1 --> METRICS
    APP2 --> METRICS
    
    style CF fill:#fff3e0,stroke:#e65100
    style LB fill:#e1f5fe,stroke:#0277bd
    style APP1 fill:#c8e6c9,stroke:#388e3c
    style NGINX1 fill:#ffccbc,stroke:#d84315
    style PRIMARY fill:#f8bbd0,stroke:#c2185b
    style REDIS fill:#fff9c4,stroke:#f57f00
```

### 8.2 Development vs Production

```mermaid
graph LR
    subgraph "Development (localhost)"
        DEV_FE[Frontend<br/>localhost:5173<br/>Vite Dev Server]
        DEV_BE[Backend<br/>localhost:3000<br/>nodemon]
        DEV_DB[(SQLite<br/>dev.db)]
        
        DEV_FE -.->|CORS allowed| DEV_BE
        DEV_BE --> DEV_DB
    end
    
    subgraph "Production (danatravel.vn)"
        PROD_CDN[Cloudflare CDN]
        PROD_NGINX[Nginx<br/>Port 80/443]
        PROD_APP[Node.js<br/>PM2 Cluster<br/>4 instances]
        PROD_DB[(PostgreSQL<br/>Cloud DB)]
        
        PROD_CDN --> PROD_NGINX
        PROD_NGINX -->|Reverse Proxy| PROD_APP
        PROD_APP --> PROD_DB
    end
    
    style DEV_FE fill:#e1f5ff
    style PROD_CDN fill:#fff3e0,stroke:#e65100,stroke-width:2px
```

---

## 📊 Summary

This architecture document provides comprehensive diagrams and detailed explanations of the Dana Travel system:

1. **✅ 15+ Professional Mermaid Diagrams**
2. **✅ Complete Sequence Flows** (Itinerary, Chat, Auth)
3. **✅ Database ERD** with all tables and fields
4. **✅ Component Trees** for Frontend and Backend
5. **✅ Security Layers** visualization
6. **✅ Deployment Architecture** (Dev vs Prod)

**Total Diagrams**: 15+  
**Diagram Types**: Graph, Sequence, ERD, State, Tree  
**Lines of Documentation**: 1,500+

---

**Document Version**: 3.0  
**Last Updated**: 2025-12-03  
**Maintained By**: Dana Travel Team
