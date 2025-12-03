// file: backend/server.js

/**
 * Server Entry Point - Điểm khởi chạy Backend (Node.js + Express)
 * 
 * Vai trò:
 * 1. Khởi tạo Web Server.
 * 2. Cấu hình Middleware (Xử lý trung gian: CORS, JSON parsing, Logging).
 * 3. Định tuyến (Routing): Điều hướng request từ Frontend đến đúng nơi xử lý.
 * 4. Xử lý lỗi (Error Handling): Bắt và trả về lỗi chuẩn hóa.
 */

import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Import các file định tuyến (Routes)
import itineraryRoutes from "./routes/itinerary.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import locationRoutes from "./routes/location.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import productRoutes from "./routes/product.routes.js";
import menuRoutes from "./routes/menu.routes.js";
import { errorHandler, notFoundHandler } from "./middleware/error.handler.middleware.js";

// Load biến môi trường từ file .env (VD: PORT, API_KEY)
// dotenv.config(); // Loaded at top

const app = express();
// Cổng mặc định là 3001 nếu không có cấu hình
const PORT = Number(process.env.PORT) || 3001;

// --- 1. CẤU HÌNH MIDDLEWARE (Các lớp xử lý trung gian) ---

// CORS: Cho phép Frontend (localhost:5173...) gọi API của Backend
const allowedOrigins = new Set([
  process.env.CLIENT_URL,
  "http://localhost:5173", // Vite default
  "http://localhost:5174",
  "http://localhost:5175",
]);

app.use(
  cors({
    origin: (origin, callback) => {
      // Cho phép request không có origin (VD: Postman, Mobile App) hoặc nằm trong whitelist
      if (!origin || allowedOrigins.has(origin) || /^http:\/\/localhost:\d+$/.test(origin) || /^http:\/\/127\.0\.0\.1:\d+$/.test(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true, // Cho phép gửi cookie/auth header
  })
);

// Body Parser: Giúp Backend đọc được dữ liệu JSON gửi lên từ Frontend
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static Files: Phục vụ file ảnh upload công khai
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/uploads", express.static(path.resolve(__dirname, "../uploads")));

// Logger: Ghi log request để debug (chỉ chạy ở dev)
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

import { requestLogger } from "./middleware/logger.middleware.js";
app.use(requestLogger);

// --- 2. ĐỊNH TUYẾN (ROUTES) ---

// Health Check: Kiểm tra server có sống không
app.get("/api/ping", (req, res) => {
  res.json({ ok: true, message: "Server is running!", time: new Date() });
});

import prisma from "./utils/prisma.js";
app.post("/api/log-visit", async (req, res) => {
  try {
    const ip = req.ip || req.connection.remoteAddress;
    let username = null;
    let role = "guest";

    // Attempt to identify admin from cookie
    const cookieHeader = req.headers["cookie"] || "";
    const cookies = Object.fromEntries(
      cookieHeader.split(";").map(c => {
        const [k, v] = c.trim().split("=");
        return [k, decodeURIComponent(v)];
      })
    );

    if (cookies.admin_token) {
      try {
        const token = cookies.admin_token;
        const decoded = Buffer.from(token, "base64").toString("utf8");
        if (decoded.includes(":")) {
          const [adminId, timestamp] = decoded.split(":");
          // Simple expiry check (8 hours)
          if (adminId && Date.now() - parseInt(timestamp) < 8 * 60 * 60 * 1000) {
            const admin = await prisma.admin.findUnique({
              where: { id: adminId },
              select: { username: true, role: true }
            });
            if (admin) {
              username = admin.username;
              role = admin.role;
            }
          }
        }
      } catch (e) {
        console.error("Token parse error:", e);
      }
    }

    await prisma.accessLog.create({
      data: {
        ip: ip,
        userAgent: req.get("User-Agent"),
        endpoint: "/",
        method: "VISIT", // Special method for session start
        username: username,
        role: role,
      },
    });
    res.json({ success: true });
  } catch (e) {
    console.error("Log visit error", e);
    res.status(500).json({ error: e.message });
  }
});

// Gắn các nhóm API vào đường dẫn cụ thể
app.use("/api/itinerary", itineraryRoutes); // Xử lý tạo lịch trình
app.use("/api/chat", chatRoutes);           // Xử lý Chatbot AI
app.use("/api/location", locationRoutes);   // Xử lý địa điểm du lịch
console.log("Mounting admin routes...");
app.use("/api/admin", adminRoutes);         // Xử lý quản trị (cần đăng nhập)
app.use("/api/categories", categoryRoutes); // Xử lý danh mục
app.use("/api/products", productRoutes);    // Xử lý sản phẩm
app.use("/api/menus", menuRoutes);          // Xử lý menu

// --- 3. XỬ LÝ LỖI (ERROR HANDLING) ---

// Nếu không tìm thấy route nào khớp (404)
app.use(notFoundHandler);

// Xử lý lỗi chung (500) - Tránh crash server
app.use(errorHandler);

// --- 4. KHỞI ĐỘNG SERVER ---
const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`\n🚀 Server đang chạy tại: http://localhost:${PORT}`);
  console.log(`📋 API sẵn sàng: /api/itinerary, /api/chat, ...\n`);
});

// Xử lý lỗi khởi động (VD: trùng cổng)
server.on("error", (err) => console.error("Lỗi khởi động Server:", err));
// Trigger restart
