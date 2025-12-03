// file: frontend/src/App.jsx

/**
 * App Component - Thành phần gốc (Root) của ứng dụng Frontend
 * 
 * Vai trò:
 * 1. Layout chính: Giữ cho Header và Footer luôn hiển thị ở mọi trang.
 * 2. Routing: Sử dụng <Outlet /> để hiển thị nội dung của trang con (Home, Itinerary, etc.) dựa trên URL.
 * 
 * Cấu trúc:
 * - Header: Thanh điều hướng (Logo, Menu).
 * - Main: Khu vực nội dung thay đổi (flex-1 để tự động chiếm khoảng trống còn lại).
 * - Footer: Chân trang (Thông tin liên hệ, bản quyền).
 */

import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";

export default function App() {
  // Session Tracking: Log visit only once per browser session (Tab/Window)
  useEffect(() => {
    const hasVisited = sessionStorage.getItem("visited");
    
    if (!hasVisited) {
      console.log("New session detected. Logging visit...");
      // Add timestamp to prevent caching
      fetch(`/api/log-visit?t=${Date.now()}`, { method: "POST" })
        .then(res => res.json())
        .then(data => {
            console.log("Log visit success:", data);
            sessionStorage.setItem("visited", "true");
        })
        .catch(err => console.error("Log visit failed", err));
    } else {
        console.log("Session already active. No log sent.");
    }
  }, []);

  return (
    // Container chính: flex-col để xếp dọc, min-h-screen để luôn cao ít nhất bằng màn hình
    <div className="flex flex-col min-h-screen bg-gray-50">
      
      {/* Thanh điều hướng trên cùng */}
      <Header />

      {/* Khu vực nội dung chính - Thay đổi theo từng trang */}
      <main className="flex-1">
        {/* <Outlet /> là nơi React Router sẽ render component của trang hiện tại (VD: HomePage, ItineraryPage) */}
        <Outlet />
      </main>

      {/* Chân trang dưới cùng */}
      <Footer />
    </div>
  );
}
