/**
 * =================================================================================================
 * FILE: prisma.js
 * MỤC ĐÍCH: Khởi tạo và quản lý kết nối Database.
 * NGƯỜI TẠO: Team DanaTravel (AI Support)
 * 
 * MÔ TẢ CHI TIẾT (BEGINNER GUIDE):
 * Đây là "Cây cầu" nối giữa Code (Javascript) và Dữ liệu (Database).
 * 1. Singleton: Đảm bảo chỉ có DUY NHẤT một cây cầu được xây. Nếu xây nhiều quá (kết nối nhiều),
 *    database sẽ bị sập vì quá tải.
 * 2. Sử dụng: Bất kỳ file nào muốn lấy dữ liệu đều phải import file này.
 * =================================================================================================
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
