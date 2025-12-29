/**
 * Root Component của ứng dụng.
 * Định nghĩa layout chung bao gồm Header, Footer và Outlet cho các trang con.
 */

import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import Header from "./components/Header";


export default function App() {
  // --- SESSION TRACKING ---
  // Ghi nhận lượt truy cập mỗi khi có session mới (F5 hoặc mở tab mới)
  // Ghi nhận lượt truy cập mỗi khi có session mới (F5 hoặc mở tab mới)
  useEffect(() => {
    // REAL MODE: Chỉ ghi nhận tracking 1 lần mỗi phiên (Session)
    // Dùng sessionStorage để check. Set ngay lập tức để tránh React Strict Mode gọi 2 lần.
    if (!sessionStorage.getItem("visited")) {
      sessionStorage.setItem("visited", "true"); // Lock ngay
      fetch(`/api/init-session?t=${Date.now()}`, { method: "POST" })
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

    </div>
  );
}
