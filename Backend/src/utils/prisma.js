/**
 * PRISMA CLIENT INSTANCE
 * 
 * File này khởi tạo và export một instance duy nhất của PrismaClient.
 * Việc sử dụng Singleton pattern giúp tránh tạo quá nhiều kết nối đến Database,
 * đặc biệt quan trọng trong môi trường Serverless hoặc khi reload server.
 */

import { createRequire } from "module";
const require = createRequire(import.meta.url);

let PrismaClient;
try {
  // Import PrismaClient từ package @prisma/client
  const pkg = require("@prisma/client");
  PrismaClient = pkg.PrismaClient;
} catch (e) {
  // console.error("Lỗi: Không thể tải PrismaClient. Hãy chắc chắn bạn đã chạy 'npx prisma generate'.", e);
}

// Khởi tạo instance
const prisma = new PrismaClient();

export default prisma;
