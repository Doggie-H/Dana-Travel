/**
 * Middleware xử lý lỗi tập trung.
 * Bắt tất cả lỗi từ controller/service và trả về response chuẩn hóa.
 */

import fs from "fs";
import path from "path";

/**
 * Middleware xử lý lỗi chính.
 * Phải có đủ 4 tham số (err, req, res, next) để Express nhận diện đây là Error Handler.
 */
import prisma from "../utils/prisma.js";

/**
 * Middleware xử lý lỗi chính.
 * Phải có đủ 4 tham số (err, req, res, next) để Express nhận diện đây là Error Handler.
 */
export async function errorHandler(err, req, res, next) {
  // 1. Ghi log lỗi ra console (cho dev xem)
  console.error("Lỗi hệ thống:", {
    message: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    path: req.path,
    method: req.method,
  });

  // 2. Ghi log vào file (Backup)
  try {
    const logMessage = `[${new Date().toISOString()}] ${req.method} ${req.path}\nMessage: ${err.message}\nStack: ${err.stack}\n\n`;
    fs.appendFileSync(path.resolve("error.log"), logMessage);
  } catch (e) {
    console.error("Failed to write to error.log", e);
  }

  // 3. Ghi log vào Database (ErrorLog)
  try {
    let user = null;
    // Cố gắng lấy user từ request (nếu đã qua auth middleware)
    if (req.user) {
      user = req.user.username || req.user.id;
    } 
    // Hoặc parse sơ bộ từ token/cookie nếu chưa qua auth
    else {
       // Logic đơn giản để lấy user từ cookie/token nếu có (copy logic nhẹ từ logger)
       const cookieHeader = req.headers["cookie"] || "";
       if (cookieHeader.includes("admin_token")) {
         user = "admin (cookies)";
       }
    }

    await prisma.errorLog.create({
      data: {
        message: err.message || "Unknown Error",
        stack: err.stack,
        path: req.originalUrl || req.path,
        method: req.method,
        body: JSON.stringify(req.body).substring(0, 1000), // Lưu body nhưng cắt ngắn để tránh quá dài
        user: user,
      }
    });
  } catch (dbError) {
    console.error("Failed to save error to DB:", dbError);
  }

  // 4. Xác định mã lỗi HTTP (Status Code)
  // Mặc định là 500 (Internal Server Error) nếu không có mã cụ thể
  const statusCode = err.statusCode || err.status || 500;

  // 5. Chuẩn hóa phản hồi lỗi
  const errorResponse = {
    success: false,
    error: {
      message: err.message || "Lỗi máy chủ nội bộ (Internal Server Error)",
      code: err.code || "INTERNAL_ERROR",
    },
  };

  // Chỉ hiển thị Stack Trace ở môi trường Development để debug
  if (process.env.NODE_ENV === "development") {
    errorResponse.error.stack = err.stack;
  }

  // 6. Trả về phản hồi cho Client
  res.status(statusCode).json(errorResponse);
}

/**
 * Handler cho trường hợp 404 Not Found.
 * Được đặt ở cuối cùng của chuỗi middleware để bắt các request không khớp route nào.
 */
export function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: {
      message: `Không tìm thấy đường dẫn: ${req.method} ${req.path}`,
      code: "NOT_FOUND",
    },
  });
}

export default {
  errorHandler,
  notFoundHandler,
};
