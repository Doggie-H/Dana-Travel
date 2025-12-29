
/**
 * LOGGING CONTROLLER
 * 
 * Kiểm soát việc ghi nhận log lỗi từ Client/Server vào Database.
 * Giúp developer theo dõi sức khỏe hệ thống.
 */

import { randomUUID } from "crypto";
import prisma from "../utils/prisma.js";

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
      console.error("\n [FRONTEND ERROR DETECTED]");
      console.error(`   Message: ${message}`);
      console.error(`   Path: ${path || "unknown"}`);
      console.error(`   User: ${user || "anonymous"}`);
      if (stack) console.error(`   Stack: ${stack.split('\n')[0]}... (Check DB for full stack)`);
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
