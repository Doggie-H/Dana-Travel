/**
 * MAIN ENTRY POINT
 * 
 * Điểm khởi đầu của ứng dụng React.
 * Nơi mount ứng dụng vào DOM và cấu hình các Provider cấp cao nhất.
 * 
 * Cấu hình:
 * 1. React.StrictMode: Bật chế độ kiểm tra nghiêm ngặt (chỉ chạy ở dev).
 * 2. BrowserRouter: Kích hoạt React Router cho toàn bộ ứng dụng.
 * 3. Routes Definition: Định nghĩa cấu trúc đường dẫn (URL) và Component tương ứng.
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
