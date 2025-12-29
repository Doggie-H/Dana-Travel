/**
 * Khởi tạo và quản lý kết nối Prisma Client (Database).
 * Đảm bảo Singleton pattern để tránh quá tải kết nối.
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
