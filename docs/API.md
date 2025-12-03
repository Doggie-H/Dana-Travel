# API Documentation - Dana Travel

## Base URL
```
Development: http://localhost:3000/api
Production: https://api.danatravel.vn/api
```

## Authentication

Most admin endpoints require JWT authentication via HttpOnly cookies.

### Login
```http
POST /api/admin/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": "uuid",
    "username": "admin",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

---

## Public Endpoints

### 1. Generate Itinerary

Generate a personalized travel itinerary based on user preferences.

```http
POST /api/itinerary/generate
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

**Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| arriveDateTime | string | Yes | ISO 8601 arrival date/time |
| leaveDateTime | string | Yes | ISO 8601 departure date/time |
| numPeople | number | Yes | Number of travelers (1-20) |
| budgetTotal | number | Yes | Total budget in VND |
| transport | string | Yes | "own", "taxi", "bus", "bike" |
| accommodation | string | Yes | "free", "hotel", "hostel", "resort" |
| preferences | array | No | ["beach", "food", "culture", "nature", "nightlife"] |

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
          "description": "Phở Hòa Pasteur",
          "category": "meal",
          "location": {
            "id": "loc-001",
            "name": "Phở Hòa Pasteur",
            "latitude": 16.0544,
            "longitude": 108.2022
          },
          "cost": 120000,
          "notes": "Quán phở nổi tiếng"
        },
        {
          "timeStart": "09:30",
          "timeEnd": "11:30",
          "title": "Tham quan Bãi biển Mỹ Khê",
          "category": "activity",
          "location": {
            "id": "loc-002",
            "name": "Bãi biển Mỹ Khê",
            "latitude": 16.0471,
            "longitude": 108.2425
          },
          "cost": 0,
          "notes": "Bãi biển đẹp nhất Đà Nẵng"
        }
      ]
    }
  ],
  "summary": {
    "totalCost": 4440000,
    "breakdown": {
      "accommodation": 1200000,
      "food": 1200000,
      "transport": 600000,
      "activities": 1440000
    },
    "remainingBudget": 560000,
    "message": "Bạn còn dư 560.000đ có thể dành cho mua sắm"
  }
}
```

**Error Responses:**
```json
// 400 Bad Request
{
  "error": "Invalid input",
  "details": "numPeople must be between 1 and 20"
}

// 500 Internal Server Error
{
  "error": "Failed to generate itinerary",
  "message": "Unable to find suitable locations for your budget"
}
```

---

### 2. Chat with AI

Interact with the AI chatbot for travel advice.

```http
POST /api/chat
Content-Type: application/json

{
  "message": "Gợi ý quán ăn hải sản ngon",
  "context": {
    "itinerary": { /* user's current itinerary */ },
    "userRequest": { /* original trip parameters */ }
  }
}
```

**Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| message | string | Yes | User's question/request |
| context | object | No | Current itinerary and preferences |

**Response:**
```json
{
  "reply": "Mình gợi ý mấy quán hải sản tươi ngon này:\n\n1. Bé Mặn - Hải sản tươi sống\n2. Quán Ốc Loan",
  "suggestions": [
    {
      "locationId": "loc-15",
      "name": "Bé Mặn",
      "type": "restaurant",
      "priceLevel": 2
    }
  ],
  "quickReplies": [
    "Thêm vào lịch trình",
    "Xem thêm gợi ý",
    "Quán nào gần nhất?"
  ]
}
```

---

### 3. Log Visit

Track visitor sessions (called automatically by frontend).

```http
POST /api/log-visit
Content-Type: application/json

{}
```

**Response:**
```json
{
  "message": "Visit logged"
}
```

---

## Admin Endpoints

All admin endpoints require authentication.

### 4. Get All Locations

Retrieve all locations in the database.

```http
GET /api/admin/locations
Cookie: admin_token=<jwt_token>
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| type | string | Filter by type (beach, restaurant, etc.) |
| search | string | Search by name |
| indoor | boolean | Filter by indoor/outdoor |
| priceLevel | number | Filter by price level (0-3) |

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Bãi biển Mỹ Khê",
    "description": "Bãi biển đẹp nhất Đà Nẵng",
    "latitude": 16.0471,
    "longitude": 108.2425,
    "type": "beach",
    "tags": ["beach", "nature", "photo"],
    "indoor": false,
    "priceLevel": 0,
    "cost": 0,
    "rating": 4.8,
    "openTime": "00:00",
    "closeTime": "23:59",
    "estimatedDuration": 120,
    "imageUrl": "/uploads/my-khe.jpg",
    "menu": null,
    "createdAt": "2025-12-01T00:00:00.000Z",
    "updatedAt": "2025-12-01T00:00:00.000Z"
  }
]
```

---

### 5. Create Location

Add a new location to the database.

```http
POST /api/admin/locations
Cookie: admin_token=<jwt_token>
Content-Type: application/json

{
  "name": "Bà Nà Hills",
  "description": "Khu du lịch trên núi với cáp treo dài nhất thế giới",
  "latitude": 15.9972,
  "longitude": 107.9989,
  "type": "attraction",
  "tags": ["nature", "theme-park", "cable-car"],
  "indoor": false,
  "priceLevel": 3,
  "cost": 900000,
  "rating": 4.7,
  "openTime": "07:00",
  "closeTime": "22:00",
  "estimatedDuration": 480,
  "imageUrl": "/uploads/bana-hills.jpg"
}
```

**Response:**
```json
{
  "id": "new-uuid",
  "name": "Bà Nà Hills",
  ...
}
```

---

### 6. Update Location

Update an existing location.

```http
PUT /api/admin/locations/:id
Cookie: admin_token=<jwt_token>
Content-Type: application/json

{
  "cost": 850000,
  "rating": 4.8
}
```

**Response:**
```json
{
  "id": "uuid",
  "name": "Bà Nà Hills",
  "cost": 850000,
  "rating": 4.8,
  ...
}
```

---

### 7. Delete Location

Remove a location from the database.

```http
DELETE /api/admin/locations/:id
Cookie: admin_token=<jwt_token>
```

**Response:**
```json
{
  "message": "Location deleted successfully"
}
```

---

### 8. Get Dashboard Statistics

Retrieve analytics data for admin dashboard.

```http
GET /api/admin/dashboard/stats
Cookie: admin_token=<jwt_token>
```

**Response:**
```json
{
  "traffic": {
    "labels": ["2025-12-01", "2025-12-02", "2025-12-03"],
    "visitors": [45, 67, 89],
    "totalVisitors": 201
  },
  "searchTrends": {
    "tags": ["Beach", "Food", "Culture", "Nature"],
    "counts": [120, 95, 78, 56]
  },
  "preferences": {
    "labels": ["Beach", "Food", "Culture", "Nature", "Nightlife"],
    "counts": [120, 95, 78, 56, 34]
  },
  "averageBudget": 3500000,
  "averageDuration": "2 ngày 1 đêm"
}
```

---

### 9. Get Knowledge Base

Retrieve all knowledge base entries.

```http
GET /api/admin/knowledge
Cookie: admin_token=<jwt_token>
```

**Response:**
```json
[
  {
    "id": "uuid",
    "question": "Đà Nẵng có bãi biển nào đẹp?",
    "answer": "Đà Nẵng có nhiều bãi biển đẹp như Mỹ Khê, Non Nước, Phạm Văn Đồng...",
    "category": "beach",
    "tags": ["beach", "tourism"],
    "createdAt": "2025-12-01T00:00:00.000Z"
  }
]
```

---

### 10. Add Knowledge Entry

Add a new Q&A to the knowledge base.

```http
POST /api/admin/knowledge
Cookie: admin_token=<jwt_token>
Content-Type: application/json

{
  "question": "Chợ Hàn mở cửa lúc mấy giờ?",
  "answer": "Chợ Hàn mở cửa từ 6h sáng đến 8h tối hàng ngày",
  "category": "shopping",
  "tags": ["shopping", "market"]
}
```

---

### 11. Get Chat Logs

View chat history.

```http
GET /api/admin/chat-logs
Cookie: admin_token=<jwt_token>
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| limit | number | Max records to return (default: 100) |
| offset | number | Pagination offset |
| startDate | string | Filter from date |
| endDate | string | Filter to date |

**Response:**
```json
[
  {
    "id": "uuid",
    "message": "Gợi ý quán ăn ngon",
    "response": "Mình gợi ý...",
    "userId": null,
    "sessionId": "session-123",
    "timestamp": "2025-12-03T10:30:00.000Z"
  }
]
```

---

### 12. Get All Admins

List all admin accounts.

```http
GET /api/admin/admins
Cookie: admin_token=<jwt_token>
```

**Response:**
```json
[
  {
    "id": "uuid",
    "username": "admin",
    "email": "admin@example.com",
    "role": "admin",
    "active": true,
    "lastLogin": "2025-12-03T08:00:00.000Z",
    "createdAt": "2025-12-01T00:00:00.000Z"
  }
]
```

---

### 13. Create Admin

Create a new admin account.

```http
POST /api/admin/admins
Cookie: admin_token=<jwt_token>
Content-Type: application/json

{
  "username": "newadmin",
  "password": "securepassword123",
  "email": "newadmin@example.com",
  "role": "moderator"
}
```

**Roles:**
- `admin`: Full access
- `moderator`: Limited access (can't manage admins)
- `viewer`: Read-only access

---

### 14. Logout

Invalidate current session.

```http
POST /api/admin/logout
Cookie: admin_token=<jwt_token>
```

**Response:**
```json
{
  "message": "Logged out successfully"
}
```

---

## Error Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Not logged in |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Duplicate entry |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error |

---

## Rate Limiting

- **Limit**: 100 requests per 15 minutes per IP
- **Headers**:
  - `X-RateLimit-Limit`: Total allowed
  - `X-RateLimit-Remaining`: Requests left
  - `X-RateLimit-Reset`: Time when limit resets

---

## CORS Policy

**Allowed Origins (Development):**
- `http://localhost:5173`
- `http://localhost:3000`

**Allowed Methods:**
- GET, POST, PUT, DELETE, OPTIONS

**Credentials:**
- Cookies are allowed

---

## Webhooks (Future)

Planned webhook support for:
- New itinerary created
- Chat interaction
- Admin action

---

## SDK Examples

### JavaScript (Fetch)

```javascript
// Generate Itinerary
const response = await fetch('http://localhost:3000/api/itinerary/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    arriveDateTime: '2025-12-20T08:00:00',
    leaveDateTime: '2025-12-23T18:00:00',
    numPeople: 4,
    budgetTotal: 5000000,
    transport: 'taxi',
    accommodation: 'hotel',
    preferences: ['beach', 'food']
  })
});

const data = await response.json();
console.log(data);
```

### cURL

```bash
# Generate Itinerary
curl -X POST http://localhost:3000/api/itinerary/generate \
  -H "Content-Type: application/json" \
  -d '{
    "arriveDateTime": "2025-12-20T08:00:00",
    "leaveDateTime": "2025-12-23T18:00:00",
    "numPeople": 4,
    "budgetTotal": 5000000,
    "transport": "taxi",
    "accommodation": "hotel",
    "preferences": ["beach", "food"]
  }'

# Admin Login
curl -X POST http://localhost:3000/api/admin/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"username": "admin", "password": "admin123"}'

# Get Locations (with auth)
curl -X GET http://localhost:3000/api/admin/locations \
  -b cookies.txt
```

---

## Postman Collection

Import this URL into Postman for a ready-to-use API collection:

```
https://danatravel.vn/api/postman-collection.json
```

---

**Last Updated**: 2025-12-03  
**API Version**: 1.0.0
