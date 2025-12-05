/**
 * =================================================================================================
 * FILE: error.handler.middleware.js
 * MỤC ĐÍCH: Xử lý lỗi tập trung (Centralized Error Handling).
 * NGƯỜI TẠO: Team DanaTravel (AI Support)
 * 
 * MÔ TẢ CHI TIẾT (BEGINNER GUIDE):
 * Middleware này là "Bệnh viện" của hệ thống.
 * 1. Tiếp nhận: Mọi lỗi xảy ra ở bất kỳ đâu (Controller, Service) đều được chuyển về đây.
 * 2. Chẩn đoán: Ghi lại lỗi (Log) để bác sĩ (Developer) biết mà sửa.
 * 3. Phản hồi: Thông báo cho người dùng biết "Có lỗi xảy ra" một cách lịch sự, thay vì hiện màn hình chết chóc.
 * =================================================================================================
 */

import fs from "fs";
import path from "path";

/**
 * Middleware xử lý lỗi chính.
 * Phải có đủ 4 tham số (err, req, res, next) để Express nhận diện đây là Error Handler.
 */
export function errorHandler(err, req, res, next) {
  // 1. Ghi log lỗi ra console (hoặc file log)
  console.error("❌ Lỗi hệ thống:", {
    message: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    path: req.path,
    method: req.method,
  });

  try {
    const logMessage = `[${new Date().toISOString()}] ${req.method} ${req.path}\nMessage: ${err.message}\nStack: ${err.stack}\n\n`;
    fs.appendFileSync(path.resolve("error.log"), logMessage);
  } catch (e) {
    console.error("Failed to write to error.log", e);
  }

  // 2. Xác định mã lỗi HTTP (Status Code)
  // Mặc định là 500 (Internal Server Error) nếu không có mã cụ thể
  const statusCode = err.statusCode || err.status || 500;

  // 3. Chuẩn hóa phản hồi lỗi
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

  // 4. Trả về phản hồi cho Client
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
