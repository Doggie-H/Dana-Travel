// file: backend/middleware/errorHandler.js

/**
 * Centralized Error Handler Middleware
 *
 * Vai trò: catch tất cả errors từ routes/controllers, format response nhất quán
 * Không nuốt lỗi im lặng, log đầy đủ để debug
 */

/**
 * Error handler middleware
 * Must have 4 params để Express nhận diện
 */
export function errorHandler(err, req, res, next) {
  // Log error cho debugging
  console.error("❌ Error:", {
    message: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    path: req.path,
    method: req.method,
  });

  // Xác định status code
  const statusCode = err.statusCode || err.status || 500;

  // Format error response
  const errorResponse = {
    success: false,
    error: {
      message: err.message || "Internal Server Error",
      code: err.code || "INTERNAL_ERROR",
    },
  };

  // Thêm stack trace trong development
  if (process.env.NODE_ENV === "development") {
    errorResponse.error.stack = err.stack;
  }

  // Send response
  res.status(statusCode).json(errorResponse);
}

/**
 * 404 Not Found handler
 */
export function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: {
      message: `Route ${req.method} ${req.path} not found`,
      code: "NOT_FOUND",
    },
  });
}

export default {
  errorHandler,
  notFoundHandler,
};
