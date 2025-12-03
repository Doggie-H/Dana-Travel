# System Architecture - Dana Travel

## Table of Contents
1. [Overview](#overview)
2. [Architecture Patterns](#architecture-patterns)
3. [System Components](#system-components)
4. [Data Flow](#data-flow)
5. [Technology Stack](#technology-stack)
6. [Security Architecture](#security-architecture)
7. [Deployment Architecture](#deployment-architecture)

---

## Overview

Dana Travel follows a **Client-Server Architecture** with clear separation of concerns between presentation, business logic, and data layers. The system is designed as a **Modular Monolith** for simplicity while maintaining the flexibility to transition to microservices if needed.

### High-Level Architecture

```
┌─────────────────────────────────────────────────────┐
│                   CLIENT LAYER                       │
│  ┌─────────────────────────────────────────────┐   │
│  │   React SPA (Single Page Application)       │   │
│  │   - Vite (Build Tool)                       │   │
│  │   - React Router (Routing)                  │   │
│  │   - Tailwind CSS (Styling)                  │   │
│  └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
                        ▼ HTTP/HTTPS
┌─────────────────────────────────────────────────────┐
│                   API GATEWAY                        │
│  ┌─────────────────────────────────────────────┐   │
│  │   Express.js REST API                       │   │
│  │   - CORS Middleware                         │   │
│  │   - Rate Limiting                           │   │
│  │   - JWT Authentication                      │   │
│  └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
                        ▼
┌─────────────────────────────────────────────────────┐
│                 BUSINESS LOGIC LAYER                 │
│  ┌──────────────┬──────────────┬─────────────┐     │
│  │  Itinerary   │   Chatbot    │   Budget    │     │
│  │  Service     │   Service    │   Service   │     │
│  └──────────────┴──────────────┴─────────────┘     │
│  ┌──────────────┬──────────────┬─────────────┐     │
│  │  Location    │     Auth     │   Admin     │     │
│  │  Service     │   Service    │   Service   │     │
│  └──────────────┴──────────────┴─────────────┘     │
└─────────────────────────────────────────────────────┘
                        ▼
┌─────────────────────────────────────────────────────┐
│                    DATA LAYER                        │
│  ┌─────────────────────────────────────────────┐   │
│  │         Prisma ORM                          │   │
│  │   - Schema Definition                       │   │
│  │   - Query Builder                           │   │
│  │   - Migration Management                    │   │
│  └─────────────────────────────────────────────┘   │
│                        ▼                             │
│  ┌─────────────────────────────────────────────┐   │
│  │    SQLite (Dev) / PostgreSQL (Prod)        │   │
│  │   - Locations, Admins, Knowledge            │   │
│  │   - AccessLogs, SearchTrends                │   │
│  └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
                        ▼
┌─────────────────────────────────────────────────────┐
│                EXTERNAL SERVICES                     │
│  ┌──────────────────┬────────────────────────┐     │
│  │  Google Gemini   │   OpenStreetMap        │     │
│  │  (AI/NLP)        │   (Mapping)            │     │
│  └──────────────────┴────────────────────────┘     │
└─────────────────────────────────────────────────────┘
```

---

## Architecture Patterns

### 1. Layered Architecture

**Presentation Layer (Frontend)**
- React components for UI rendering
- Client-side routing with React Router
- State management with React Hooks and Context API
- LocalStorage for session persistence

**Application Layer (Backend)**
- Express.js routes as entry points
- Controllers for request validation
- Business logic encapsulated in services
- Middleware for cross-cutting concerns

**Data Access Layer**
- Prisma ORM as abstraction over database
- Repository pattern via Prisma schema
- Database migrations for schema evolution

### 2. Service-Oriented Pattern

Each major feature is implemented as an independent service:

```
itinerary.service.js    // TSP algorithm, scheduling
chatbot.service.js      // RAG, intent detection
budget.service.js       // Cost calculation
location.service.js     // CRUD operations
auth.service.js         // JWT, session management
```

**Benefits:**
- Clear separation of concerns
- Easy to test in isolation
- Can be extracted to microservices later

### 3. Repository Pattern

Prisma acts as our repository layer:

```javascript
// Example: location.service.js
export const getAllLocations = async (filters = {}) => {
  return await prisma.location.findMany({ where: filters });
};
```

**Benefits:**
- Database-agnostic business logic
- Easy to mock for testing
- Centralized data access

---

## System Components

### Frontend Components

```
src/
├── pages/                    # Route-level components
│   ├── HomePage              # Landing + Form
│   ├── ItineraryResultsPage  # Results display
│   ├── ChatPage              # Chatbot interface
│   └── AdminDashboardPage    # Admin panel
├── features/                 # Feature modules
│   ├── trip-form/            # Multi-step wizard
│   ├── itinerary/            # Itinerary components
│   ├── bot/                  # Chatbot components
│   └── admin/                # Admin components
├── components/               # Shared components
│   ├── Header, Footer
│   ├── Loading, Notification
│   └── ErrorBoundary
└── services/                 # API & Storage
    ├── api.service.js        # HTTP client
    └── storage.service.js    # LocalStorage
```

### Backend Components

```
src/
├── routes/                   # API endpoints
│   ├── itinerary.routes.js   # /api/itinerary/*
│   ├── chatbot.routes.js     # /api/chat
│   └── admin.routes.js       # /api/admin/*
├── controllers/              # Request handlers
├── services/                 # Business logic
├── middleware/               # Cross-cutting
│   ├── auth.middleware.js    # JWT verification
│   ├── logger.middleware.js  # Access logging
│   └── cors.middleware.js    # CORS config
├── adapters/                 # External APIs
│   └── gemini.adapter.js     # Google AI
└── utils/                    # Helpers
    ├── prisma.js             # DB client
    └── time.utils.js         # Date helpers
```

---

## Data Flow

### 1. Itinerary Generation Flow

```
User Input (Form)
    ↓
Frontend Validation
    ↓
POST /api/itinerary/generate
    ↓
Controller: validateRequest()
    ↓
Service: itinerary.service.js
    ├─→ getAllLocations()           [Data Layer]
    ├─→ calculateBudgetBreakdown()  [Budget Service]
    ├─→ Greedy Selection Algorithm
    ├─→ TSP Optimization
    └─→ Day-by-Day Scheduling
    ↓
Return JSON Response
    ↓
Frontend: Display on Map + Timeline
    ↓
Save to LocalStorage
```

### 2. Chatbot Interaction Flow (RAG)

```
User Question
    ↓
POST /api/chat
    ↓
chatbot.service.js
    ├─→ 1. Intent Detection (Hybrid)
    │   ├─→ Rule-based (Regex)
    │   └─→ AI Fallback
    ├─→ 2. Knowledge Retrieval
    │   ├─→ matchKnowledge() [DB]
    │   └─→ getAllLocations() [DB]
    ├─→ 3. Context Augmentation
    │   └─→ Build prompt with context
    └─→ 4. AI Generation
        └─→ Google Gemini API
    ↓
Return { reply, quickReplies, suggestions }
    ↓
Frontend: Render message
```

### 3. Admin Authentication Flow

```
Admin Login
    ↓
POST /api/admin/login
    ↓
auth.service.js
    ├─→ verifyAdmin(username, password)
    ├─→ bcrypt.compare()
    └─→ JWT.sign()
    ↓
Set HttpOnly Cookie
    ↓
Return { user, token }
    ↓
Frontend: Store in state
    ↓
Subsequent Requests
    ↓
auth.middleware.js
    ├─→ Extract cookie
    ├─→ JWT.verify()
    └─→ Attach user to req.user
    ↓
Protected Route Access
```

---

## Technology Stack

### Frontend Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | React 18 | Component-based UI |
| Build Tool | Vite | Fast dev server & builds |
| Routing | React Router v6 | Client-side navigation |
| Styling | Tailwind CSS | Utility-first CSS |
| Animations | Framer Motion | Smooth transitions |
| Maps | React-Leaflet | Interactive maps |
| Charts | Chart.js | Analytics visualization |
| HTTP Client | Fetch API | API communication |

### Backend Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Runtime | Node.js 18+ | JavaScript runtime |
| Framework | Express.js | Web server |
| ORM | Prisma | Database abstraction |
| Database | SQLite/PostgreSQL | Data persistence |
| Auth | JWT + bcrypt | Authentication |
| Validation | Zod | Input validation |
| AI | Google Gemini | Natural language processing |
| Security | Helmet, CORS | HTTP security |

---

## Security Architecture

### 1. Authentication & Authorization

**JWT-Based Authentication:**
```
Login → Verify Credentials → Generate JWT → Set HttpOnly Cookie
Request → Extract Cookie → Verify JWT → Attach User → Proceed
```

**Role-Based Access Control (RBAC):**
```javascript
// Middleware checks user role
if (req.user.role !== 'admin') {
  return res.status(403).json({ error: 'Forbidden' });
}
```

### 2. Security Layers

```
┌─────────────────────────────────────┐
│   1. Network Layer                  │
│   - HTTPS/TLS encryption            │
│   - Firewall rules                  │
└─────────────────────────────────────┘
            ↓
┌─────────────────────────────────────┐
│   2. Application Layer              │
│   - CORS restrictions               │
│   - Rate limiting                   │
│   - Helmet (HTTP headers)           │
└─────────────────────────────────────┘
            ↓
┌─────────────────────────────────────┐
│   3. Authentication Layer           │
│   - JWT verification                │
│   - HttpOnly cookies                │
│   - Password hashing (bcrypt)       │
└─────────────────────────────────────┘
            ↓
┌─────────────────────────────────────┐
│   4. Authorization Layer            │
│   - RBAC (Role-Based Access)        │
│   - Permission checks               │
└─────────────────────────────────────┘
            ↓
┌─────────────────────────────────────┐
│   5. Data Layer                     │
│   - SQL injection prevention (ORM)  │
│   - Input validation (Zod)          │
│   - XSS protection                  │
└─────────────────────────────────────┘
```

### 3. Security Best Practices

- ✅ Passwords hashed with bcrypt (salt rounds: 10)
- ✅ JWT in HttpOnly cookies (prevents XSS)
- ✅ CORS whitelist (only allowed origins)
- ✅ Rate limiting (max 100 requests/15min per IP)
- ✅ Input validation on all endpoints
- ✅ SQL injection prevention via Prisma ORM
- ✅ Environment variables for secrets
- ✅ Helmet for HTTP security headers

---

## Deployment Architecture

### Development Environment

```
Developer Machine
├── Backend (localhost:3000)
│   └── npm run dev (nodemon)
└── Frontend (localhost:5173)
    └── npm run dev (vite)
```

### Production Environment

```
                    [User Browser]
                          ↓
                    [Cloudflare]
                     (CDN + DDoS)
                          ↓
                    [Load Balancer]
                          ↓
              ┌───────────┴───────────┐
              ↓                       ↓
      [Nginx Server 1]        [Nginx Server 2]
      - Static Files          - Static Files
      - Reverse Proxy         - Reverse Proxy
              ↓                       ↓
      ┌───────────────────────────────┐
      │   Node.js Application (PM2)   │
      │   - Backend API               │
      │   - Multiple instances        │
      │   - Auto-restart on crash     │
      └───────────────────────────────┘
                    ↓
      ┌───────────────────────────────┐
      │   PostgreSQL Database         │
      │   - Master-Slave Replication  │
      │   - Automated backups         │
      └───────────────────────────────┘
```

### PM2 Configuration

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'dana-travel-api',
    script: './src/server.js',
    instances: 4,  // CPU cores
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
```

### Nginx Configuration

```nginx
server {
    listen 80;
    server_name danatravel.vn;
    
    # Frontend (static files)
    location / {
        root /var/www/dana-travel/dist;
        try_files $uri $uri/ /index.html;
    }
    
    # Backend API (reverse proxy)
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

## Scalability Considerations

### Horizontal Scaling

**Current (Monolith):**
- Single Express app
- PM2 cluster mode (4 instances)
- Nginx load balancer

**Future (Microservices):**
```
itinerary-service (Port 3001)
chatbot-service   (Port 3002)
admin-service     (Port 3003)
```

### Database Scaling

**Current:** SQLite (dev), PostgreSQL (prod)

**Future Options:**
- **Read Replicas**: For analytics queries
- **Sharding**: By location (Da Nang, Hue, Hoi An)
- **Caching**: Redis for hot data

### Caching Strategy

```
Request → Check Cache → [HIT] Return cached
                     → [MISS] Query DB → Update Cache → Return
```

**Cache Layers:**
1. **Browser Cache**: Static assets (images, CSS, JS)
2. **CDN Cache**: Cloudflare edge caching
3. **Application Cache**: Redis for API responses
4. **Database Cache**: PostgreSQL query cache

---

## Monitoring & Observability

### Logging

```
Request → Logger Middleware → Console/File/Cloud
                            ↓
                    [Log Aggregation]
                    - Loggly / Datadog
                    - Search & Analytics
```

### Metrics

- **Application Metrics**: Response time, throughput
- **System Metrics**: CPU, Memory, Disk I/O
- **Business Metrics**: Itineraries created, chatbot interactions

### Health Checks

```javascript
// GET /api/health
{
  "status": "OK",
  "uptime": 123456,
  "database": "connected",
  "geminiAPI": "available"
}
```

---

## Disaster Recovery

### Backup Strategy

1. **Database Backups**
   - Daily automated backups
   - Retention: 30 days
   - Storage: AWS S3 / Google Cloud Storage

2. **Code Versioning**
   - Git repository
   - Tagged releases

3. **Configuration**
   - Environment variables backed up securely
   - Infrastructure as Code (future)

### Recovery Plan

1. Restore database from latest backup
2. Deploy from Git tag
3. Reconfigure environment variables
4. Smoke test critical paths
5. DNS cutover

---

## Performance Optimization

### Frontend
- Code splitting (React.lazy)
- Image optimization
- Lazy loading
- Minification & compression

### Backend
- Database indexing on frequent queries
- Connection pooling
- Response compression (gzip)
- Caching frequent queries

### Network
- CDN for static assets
- HTTP/2
- Asset bundling
- DNS prefetching

---

## Future Architecture Enhancements

1. **Microservices Migration**
   - Extract chatbot service
   - Extract itinerary service
   - API Gateway (Kong/Traefik)

2. **Event-Driven Architecture**
   - Message queue (RabbitMQ/Kafka)
   - Async processing for heavy tasks

3. **Containerization**
   - Docker for services
   - Kubernetes orchestration

4. **Serverless Functions**
   - AWS Lambda for chatbot
   - On-demand scaling

---

**Document Version**: 1.0  
**Last Updated**: 2025-12-03  
**Maintained By**: Dana Travel Team
