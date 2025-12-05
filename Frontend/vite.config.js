/**
 * =================================================================================================
 * FILE: vite.config.js
 * MỤC ĐÍCH: Cấu hình công cụ build Vite.
 * NGƯỜI TẠO: Team DanaTravel (AI Support)
 * 
 * MÔ TẢ CHI TIẾT (BEGINNER GUIDE):
 * Đây là "Bảng điều khiển máy móc" cho việc chạy thử và đóng gói code.
 * 1. Server: Quy định Frontend chạy ở cổng 5173.
 * 2. Proxy: Nếu Frontend gọi /api, hãy chuyển nó sang Backend (cổng 3001) để không bị lỗi CORS.
 * 3. Plugins: Cài thêm đồ chơi (React plugin) để Vite hiểu code React.
 * =================================================================================================
 */
// file: frontend/vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
});
