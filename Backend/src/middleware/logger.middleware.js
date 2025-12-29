/**
 * Middleware ghi log truy cập (Access Log).
 * Ghi lại thông tin request, response và người dùng vào database.
 */

import { randomUUID } from "crypto"; // Fix: Import randomUUID
import prisma from "../config/prisma.client.js";

export const requestLogger = async (req, res, next) => {
  // 1. Bỏ qua các request không cần thiết (Static files, Health check)
  if (req.url.startsWith("/uploads") || req.url.startsWith("/api/admin/health")) {
    return next();
  }

  // 2. Bỏ qua các endpoint polling (gọi liên tục từ Frontend) để tránh rác DB
  const noisyEndpoints = [
    "/api/admin/stats",      // Polling thống kê
    "/api/admin/access-logs", // Polling logs
    "/api/admin/chat-logs",   // Polling chat logs
  ];
  if (noisyEndpoints.some(p => req.originalUrl.startsWith(p))) {
    return next();
  }

  // Lắng nghe sự kiện 'finish' của response để ghi log sau khi request đã được xử lý xong
  res.on("finish", async () => {
    try {
      const method = req.method;

      // 3. Logic lọc thông minh
      // - Luôn ghi log các request thay đổi dữ liệu (POST, PUT, DELETE, PATCH)
      // - BỎ QUA request GET thông thường (đã được xử lý bởi client-side tracking /api/log-visit nếu cần)
      if (method === "GET") {
        return;
      }

      // --- Nhận diện người dùng (Identity Resolution) ---
      let username = null;
      let role = "guest";

      // Lấy token từ Header hoặc Cookie
      let token = (req.headers["authorization"] || "").replace(/^Bearer\s+/i, "");
      if (!token) {
        const cookieHeader = req.headers["cookie"] || "";
        const cookies = Object.fromEntries(
          cookieHeader.split(";").map(c => {
            const [k, v] = c.trim().split("=");
            return [k, decodeURIComponent(v)];
          })
        );
        if (cookies.admin_token) token = cookies.admin_token;
      }

      // Giải mã token để lấy thông tin Admin
      if (token) {
        try {
          const decoded = Buffer.from(token, "base64").toString("utf8");
          if (decoded.includes(":")) {
            const [adminId, timestamp] = decoded.split(":");
            // Kiểm tra token còn hạn (8 tiếng)
            if (adminId && Date.now() - parseInt(timestamp) < 8 * 60 * 60 * 1000) {
              const admin = await prisma.account.findUnique({
                where: { id: adminId },
                select: { username: true, role: true }
              });
              if (admin) {
                username = admin.username;
                role = admin.role;
              }
            }
          } else if (token === process.env.ADMIN_TOKEN) {
            role = "admin";
            username = "system_admin";
          }
        } catch (e) { }
      }

      // 4. Ghi log vào Database
      await prisma.accessLog.create({
        data: {
          id: `TC_${randomUUID()}`, // Fix: Add required ID
          ip: req.ip || req.connection.remoteAddress,
          userAgent: req.get("User-Agent"),
          endpoint: req.originalUrl,
          method: method,
          username: username,
          role: role,
        },
      });
    } catch (error) {
      console.error("Lỗi khi ghi log request:", error);
    }
  });

  next();
};
