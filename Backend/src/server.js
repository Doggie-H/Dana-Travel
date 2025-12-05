/**
 * Entry point của Backend Server.
 * Khởi tạo Express app, cấu hình middleware, routes và error handling.
 */

import "dotenv/config"; // Nạp biến môi trường từ file .env
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import morgan from "morgan";
import { randomUUID } from "crypto"; // Fix: Import randomUUID

// Import các Routes (Bộ định tuyến)
import itineraryRoutes from "./routes/itinerary.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import locationRoutes from "./routes/location.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import loggingRoutes from "./routes/logging.routes.js";

// Import Middleware xử lý lỗi
import { notFoundHandler, errorHandler } from "./middleware/error.handler.middleware.js";
import { requestLogger } from "./middleware/logger.middleware.js";
import prisma from "./utils/prisma.js";

// Khởi tạo ứng dụng Express
const app = express();

// Cổng mặc định là 3001 nếu không có cấu hình
const PORT = Number(process.env.PORT) || 3001;

// --- 1. CẤU HÌNH MIDDLEWARE (Các lớp xử lý trung gian) ---

// CORS: Cho phép Frontend (localhost:5173...) gọi API của Backend
// Đây là cơ chế bảo mật của trình duyệt.
const allowedOrigins = new Set([
  process.env.CLIENT_URL,
  "http://localhost:5173", // Vite default dev port
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
// Các file trong thư mục uploads sẽ có thể truy cập qua đường dẫn /uploads/...
app.use("/uploads", express.static(path.resolve(__dirname, "../uploads")));

// Logger: Ghi log request để debug (chỉ chạy ở môi trường dev)
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// Custom Logger: Ghi log chi tiết hơn vào file hoặc console
app.use(requestLogger);

// --- 2. ĐỊNH TUYẾN (ROUTES) ---

// Health Check: API đơn giản để kiểm tra server có sống không
app.get("/api/ping", (req, res) => {
  res.json({ ok: true, message: "Server is running!", time: new Date() });
});

// Log Visit: API để ghi nhận lượt truy cập (dùng cho thống kê)
app.post("/api/init-session", async (req, res) => {
  try {
    const ip = req.ip || req.connection.remoteAddress;
    let username = null;
    let role = "guest";

    // Cố gắng nhận diện Admin qua cookie (nếu có)
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
          // Kiểm tra token hết hạn (8 tiếng)
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
        // console.error("Token parse error:", e);
      }
    }

    // Ghi vào bảng AccessLog
    await prisma.accessLog.create({
      data: {
        id: `TC_${randomUUID()}`, // Fix: Add required ID
        ip: ip,
        userAgent: req.get("User-Agent"),
        endpoint: "/",
        method: "VISIT", // Method đặc biệt đánh dấu session mới
        username: username,
        role: role,
      },
    });
    res.json({ success: true });
  } catch (e) {
    // console.error("Log visit error", e);
    res.status(500).json({ error: e.message });
  }
});

// Gắn các nhóm API vào đường dẫn cụ thể
app.use("/api/itinerary", itineraryRoutes); // Xử lý tạo lịch trình
app.use("/api/chat", chatRoutes);           // Xử lý Chatbot AI
app.use("/api/location", locationRoutes);   // Xử lý địa điểm du lịch
app.use("/api/admin", adminRoutes);         // Xử lý quản trị (cần đăng nhập)
app.use("/api/logs", loggingRoutes);        // Endpoint ghi log lỗi

// --- 3. XỬ LÝ LỖI (ERROR HANDLING) ---

// Nếu không tìm thấy route nào khớp (404)
app.use(notFoundHandler);

// Xử lý lỗi chung (500) - Tránh crash server khi có exception
app.use(errorHandler);

// --- 4. KHỞI ĐỘNG SERVER ---
const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`\nServer đang chạy tại: http://localhost:${PORT}`);
  console.log(`API sẵn sàng: /api/itinerary, /api/chat, ...\n`);
});

// Xử lý lỗi khởi động (VD: trùng cổng)
server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`❌ Cổng ${PORT} đang được sử dụng. Vui lòng tắt server cũ hoặc đổi cổng.`);
  } else {
    console.error("❌ Lỗi khởi động server:", err);
  }
  process.exit(1);
});

// Thêm lưới an toàn cho cả server (Crash Handlers)
// Bắt các lỗi không được xử lý để tránh crash đột ngột mà không log
process.on("uncaughtException", async (err) => {
  console.error("CRITICAL: UNCAUGHT EXCEPTION", err);
  try {
    await prisma.errorLog.create({
      data: {
        message: err.message,
        stack: err.stack,
        source: "BACKEND_CRASH",
      },
    });
  } catch (logErr) {
    console.error("FATAL: Could not log crash to DB", logErr);
  }
  process.exit(1);
});

process.on("unhandledRejection", async (reason) => {
  console.error("CRITICAL: UNHANDLED REJECTION", reason);
  try {
    await prisma.errorLog.create({
      data: {
        message: reason instanceof Error ? reason.message : JSON.stringify(reason),
        stack: reason instanceof Error ? reason.stack : null,
        source: "BACKEND_REJECTION",
      },
    });
  } catch (logErr) {
    console.error("FATAL: Could not log rejection to DB", logErr);
  }
});
server.on("error", (err) => console.error("Lỗi khởi động Server:", err));
