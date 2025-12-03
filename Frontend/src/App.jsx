/**
 * APP COMPONENT - ROOT LAYOUT
 * 
 * Thành phần gốc (Root) của ứng dụng Frontend.
 * Đóng vai trò là Layout chính, bao bọc tất cả các trang con.
 * 
 * Chức năng chính:
 * 1. Layout Structure: Header (Trên) - Main (Giữa) - Footer (Dưới).
 * 2. Routing Outlet: Nơi hiển thị nội dung động của các trang con.
 * 3. Session Tracking: Ghi nhận lượt truy cập (Visit) khi người dùng vào trang.
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
      // Gọi API log-visit để server ghi nhận thống kê
      // Thêm timestamp để tránh browser cache request
      fetch(`/api/log-visit?t=${Date.now()}`, { method: "POST" })
        .then(res => res.json())
        .then(data => {
            // Đánh dấu đã visit trong session này
            sessionStorage.setItem("visited", "true");
        })
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
