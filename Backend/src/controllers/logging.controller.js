
import { randomUUID } from "crypto";
import prisma from "../config/prisma.client.js";

/**
 * Ghi nhận lỗi từ hệ thống (Frontend hoặc Backend service khác)
 * POST /api/logs/error
 */
export const logError = async (req, res) => {
  try {
    const { message, stack, path, method, body, user, source } = req.body;

    // Validate cơ bản
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Hiển thị lỗi ra Terminal của Server để dễ dàng theo dõi ngay lập tức
    if (source === "FRONTEND") {
      console.error("\x1b[31m%s\x1b[0m", "\n🚨 [FRONTEND ERROR] 🚨");

      // 1. Phân tích Stack Trace (Smart Parse)
      // Frontend stack thường có dạng: at ComponentName (http://localhost:xxx/src/App.jsx:20:10)
      let debugInfo = {};
      const match = stack?.match(/at\s+(?:.+)\s+\((.+)\:(\d+)\:(\d+)\)/) || stack?.match(/at\s+(.+)\:(\d+)\:(\d+)/);

      if (match) {
        const fullPath = match[1];
        const fileName = fullPath.split('/').pop().split('?')[0]; // Lấy tên file cuois cùng
        const line = match[2];

        console.error("\x1b[33m%s\x1b[0m", `📍 Location: ${fileName}:${line}`);
        console.error("\x1b[36m%s\x1b[0m", `💡 Advice: Kiểm tra dòng ${line} trong ${fileName}.`);

        // Gợi ý thông minh (Smart Hints)
        if (message.includes("is not defined")) {
          console.error("\x1b[32m%s\x1b[0m", `👉 Hint: Biến chưa được khai báo? Check import.`);
        } else if (message.includes("reading 'map'")) {
          console.error("\x1b[32m%s\x1b[0m", `👉 Hint: Dữ liệu không phải mảng (Array)? Hãy log ra xem.`);
        } else if (message.includes("Minified React error")) {
          console.error("\x1b[32m%s\x1b[0m", `👉 Hint: Lỗi React sâu. Hãy kiểm tra lại logic Render.`);
        }
      } else {
        console.error(`📍 Path: ${path || "unknown"}`);
      }

      console.error(`❌ Message: ${message}`);
      console.error(`👤 User: ${user || "anonymous"}`);
      console.error("--------------------------------------------------\n");
    }

    const newLog = await prisma.errorLog.create({
      data: {
        id: `L_${randomUUID()}`,
        message,
        stack,
        path: path || "unknown", // Path nơi xảy ra lỗi
        method: method || "UNKNOWN",
        body: body ? JSON.stringify(body).substring(0, 1000) : null,
        user: user || "anonymous",
        source: source || "UNKNOWN_SOURCE", // FRONTEND | BACKEND
      },
    });

    return res.status(201).json({ success: true, logId: newLog.id });
  } catch (err) {
    console.error("FAILED TO LOG ERROR TO DB:", err);
    // Không ném lỗi tiếp để tránh loop vô hạn nếu logging fail
    return res.status(500).json({ error: "Logging failed" });
  }
};
