/**
 * Root Component của ứng dụng.
 * Định nghĩa layout chung bao gồm Header, Footer và Outlet cho các trang con.
 */

import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";

export default function App() {
  // --- SESSION TRACKING ---
  // Ghi nhận lượt truy cập mỗi khi có session mới (F5 hoặc mở tab mới)
  useEffect(() => {
    const hasVisited = sessionStorage.getItem("visited");
    
    if (!hasVisited) {
      // Gọi API init-session để server ghi nhận thống kê
      // Đánh dấu ngay lập tức để tránh gọi 2 lần (do React StrictMode)
      sessionStorage.setItem("visited", "true");

      // Thêm timestamp để tránh browser cache request
      fetch(`http://localhost:3001/api/init-session?t=${Date.now()}`, { method: "POST" })
        .catch(err => console.error("Lỗi khi ghi nhận lượt truy cập:", err));
    }
  }, []);

  return (
    // Container chính: Flex column để Footer luôn nằm dưới cùng
    // min-h-screen: Đảm bảo chiều cao tối thiểu bằng màn hình
    <div className="flex flex-col min-h-screen bg-gray-50 font-sans text-gray-900">
      
      {/* HEADER: Thanh điều hướng cố định */}
      <Header />

      {/* MAIN: Khu vực nội dung chính */}
      {/* flex-1: Tự động giãn nở để chiếm hết khoảng trống còn lại */}
      <main className="flex-1 w-full">
        {/* Outlet: Nơi React Router render component của trang hiện tại */}
        <Outlet />
      </main>

      {/* FOOTER: Chân trang */}
      <Footer />
    </div>
  );
}
