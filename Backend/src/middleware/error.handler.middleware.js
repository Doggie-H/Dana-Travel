/**
 * CENTRALIZED ERROR HANDLER
 * 
 * Middleware xử lý lỗi tập trung cho toàn bộ ứng dụng.
 * Thay vì xử lý lỗi rải rác ở từng Controller, tất cả lỗi sẽ được chuyển về đây (thông qua next(err)).
 * 
 * Vai trò:
 * 1. Ghi log lỗi để debug.
 * 2. Chuẩn hóa định dạng phản hồi lỗi trả về cho Client.
 * 3. Ẩn thông tin nhạy cảm (stack trace) ở môi trường Production.
 */

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
