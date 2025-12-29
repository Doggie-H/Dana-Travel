/**
 * Khởi tạo và quản lý kết nối Prisma Client (Database).
 * Đảm bảo Singleton pattern để tránh quá tải kết nối.
 */




import { PrismaClient } from "@prisma/client";

// Fallback connection string if .env is missing
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "file:./dev.db";
}

// Khởi tạo instance
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

export default prisma;
