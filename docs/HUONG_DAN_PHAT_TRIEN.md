# Hướng Dẫn Phát Triển (Developer Guide)

## 1. Cấu Trúc Dự Án

Dự án được chia thành 2 phần chính độc lập:
*   `Backend/`: Server API (Node.js/Express)
*   `Frontend/`: Client UI (React/Vite)

### Backend Structure
```
Backend/
├── prisma/             # ORM Config
│   ├── data/           # Seed Data (Locations, FAQs) - SOURCE OF TRUTH
│   ├── schema.prisma   # Database Schema Definition
│   └── seed.js         # Seed Script
├── scripts/            # Utility Scripts
├── src/
│   ├── config/         # System Constants (Rules, Costs) - Nơi chỉnh sửa tham số
│   ├── controllers/    # Xử lý request/response
│   ├── middleware/     # Auth, Logger, Error Handling
│   ├── routes/         # API Route definitions
│   ├── services/       # Business Logic (Core)
│   ├── utils/          # Helper functions & Algorithms
│   └── app.js          # App setup
└── .env                # Environment Variables (Ignored via git)
```

### Frontend Structure
```
Frontend/
├── src/
│   ├── api/            # Axios Client config
│   ├── assets/         # Images, Icons
│   ├── components/     # Shared Components (Button, Modal, Card...)
│   ├── features/       # Feature-based Modules (Account, Admin, Chatbot...)
│   │   ├── admin/      # Admin modules
│   │   ├── chatbot/    # Chatbot logic & UI
│   │   ├── itinerary/  # Itinerary display logic
│   │   └── trip-planning/ # Form planning capabilities
│   ├── layouts/        # Page Layouts
│   ├── pages/          # React Router Pages
│   └── utils/          # Formatting helpers
└── ...
```

## 2. Quy Chuẩn Coding (Coding Standards)

*   **Ngôn ngữ**: Javascript (ES6+).
*   **Documentation**:
    *   Mọi function quan trọng phải có JSDoc/Comment giải thích Input/Output và Logic.
    *   Comment bằng tiếng Việt để nhất quán với team.
*   **Naming**: CamelCase cho biến/hàm, PascalCase cho Class/Component.
*   **Git Flow**: Không commit file `.env`, `node_modules`, `dist`.

## 3. Quy trình Thêm Địa Điểm Mới

Để đảm bảo nhất quán dữ liệu, KHÔNG sửa trực tiếp vào DB nếu không cần thiết. Hãy sửa trong Seed Data:

1.  Mở `Backend/prisma/data/create_locations_*.js` (tương ứng loại địa điểm).
2.  Thêm object địa điểm mới theo mẫu:
    ```javascript
    {
      name: "Tên địa điểm",
      address: "Địa chỉ cụ thể (Số nhà, Đường, Phường, Quận)",
      lat: 16.xxxxx,
      lng: 108.xxxxx,
      type: "attraction", // hoặc beach, restaurant...
      visitType: "...",   // Xem config/scheduling.constants.js để biết loại hợp lệ
      // ... các field khác
    }
    ```
3.  Chạy lệnh Seed:
    ```bash
    cd Backend
    npx prisma db seed
    ```

## 4. Chỉnh Sửa Logic Lập Lịch

Logic lập lịch nằm cốt lõi ở `Backend/src/utils/generate-day-schedule-strict.js`.
*   **PHASES 1-5**: File được chia thành các phase (Sáng, Trưa, Chiều, Tối).
*   **Constraints**: Các luật lệ (thời gian, verify) nằm trong `Backend/src/config/scheduling.constants.js`.

---

Nếu gặp vấn đề, vui lòng kiểm tra Logs trong thư mục `Backend/logs/` (nếu có cấu hình) hoặc console output.
