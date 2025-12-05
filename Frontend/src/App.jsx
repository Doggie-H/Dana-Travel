/**
 * =================================================================================================
 * FILE: App.jsx
 * MỤC ĐÍCH: Khung sườn chính của toàn bộ ứng dụng (Root Layout).
 * NGƯỜI TẠO: Team DanaTravel (AI Support)
 * 
 * MÔ TẢ CHI TIẾT (BEGINNER GUIDE):
 * Đây là "Bộ khung nhà" của website.
 * 1. Header (Cố định): Thanh menu trên cùng, trang nào cũng có.
 * 2. Main (Thay đổi): Phần nội dung ở giữa, sẽ thay đổi tùy theo bạn đang ở trang Chủ, trang Chat hay trang Admin.
 * 3. Footer (Cố định): Chân trang, chứa thông tin liên hệ.
 * 4. Outlet: Cái lỗ để nhét các trang con (Main) vào.
 * =================================================================================================
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
