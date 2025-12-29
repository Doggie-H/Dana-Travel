/**
 * PRISMA CLIENT SINGLETON
 * 
 * Khởi tạo và export một instance duy nhất của PrismaClient.
 * Đảm bảo việc kết nối database được quản lý tập trung và tránh lỗi "Too many connections"
 * trong môi trường development (do hot-reloading).
 */

import { PrismaClient } from "@prisma/client";
import fs from "fs";

let prisma;

try {
  // Khởi tạo instance
  // log: ['query', 'info', 'warn', 'error'] có thể thêm vào để debug SQL
  prisma = new PrismaClient();
} catch (e) {
  const msg = "Prisma Init Error: " + e.toString() + "\n" + (e.stack || "");
  console.error(msg);
  // Ghi log lỗi ra file để debug nếu server crash ngay lập tức
  try { fs.writeFileSync('prisma-init-error.log', msg); } catch (_) { }
  process.exit(1);
}

export default prisma;
