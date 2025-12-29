/**
 * Entry point của ứng dụng React.
 * Khởi tạo ReactDOM root, cấu hình Router và render App component.
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

// Import Global Error Boundary
import GlobalErrorBoundary from "./components/common/GlobalErrorBoundary";
import { initGlobalErrorLogging } from "./services/logging-service";

// Khởi động hệ thống bắt lỗi toàn diện (Window + Promise + Console)
initGlobalErrorLogging();

// Khởi tạo React Root và render ứng dụng
ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <GlobalErrorBoundary>
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
    </GlobalErrorBoundary>
  </React.StrictMode>
);
