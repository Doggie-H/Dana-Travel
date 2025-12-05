/**
 * =================================================================================================
 * FILE: main.jsx
 * MỤC ĐÍCH: Điểm khởi nguồn của Frontend (Entry Point).
 * NGƯỜI TẠO: Team DanaTravel (AI Support)
 * 
 * MÔ TẢ CHI TIẾT (BEGINNER GUIDE):
 * Đây là nơi React "bắt đầu sự sống".
 * 1. Tìm thẻ <div id="root"> trong file index.html.
 * 2. Bơm toàn bộ ứng dụng (App) vào trong thẻ đó.
 * 3. Cài đặt các công cụ hỗ trợ:
 *    - BrowserRouter: Để quản lý việc chuyển trang không cần reload.
 *    - StriotMode: Giúp phát hiện lỗi ngầm trong code.
 * =================================================================================================
 */

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Import các trang và component chính
import App from "./App";
import Home from "./pages/HomePage";
import Results from "./pages/ItineraryResultsPage";
import Chat from "./pages/ChatPage";
import Admin from "./pages/AdminDashboardPage";

// Import Global Styles
import "./styles/main.css";

// Tìm element gốc trong index.html
const rootElement = document.getElementById("root");

// Khởi tạo React Root và render ứng dụng
ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Route Gốc: Sử dụng App làm Layout chung */}
        <Route path="/" element={<App />}>
          
          {/* Trang chủ (Index Route) */}
          <Route index element={<Home />} />
          
          {/* Trang kết quả lịch trình */}
          <Route path="results" element={<Results />} />
          
          {/* Trang Chatbot AI */}
          <Route path="chat" element={<Chat />} />
          
          {/* Trang quản trị Admin */}
          <Route path="admin" element={<Admin />} />
          
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
