/**
 * =================================================================================================
 * FILE: Header.jsx
 * MỤC ĐÍCH: Thanh điều hướng chính (Navigation Bar).
 * NGƯỜI TẠO: Team DanaTravel (AI Support)
 * 
 * MÔ TẢ CHI TIẾT (BEGINNER GUIDE):
 * Đây là "Cái bảng chỉ đường" treo trên nóc nhà website.
 * 1. Logo: Bấm vào là về nhà (Trang chủ).
 * 2. Menu: Danh sách các phòng ban (Lịch trình, Chat, Admin).
 * 3. Trạng thái: Đang ở phòng nào thì tên phòng đó sáng đèn lên (Active State).
 * 4. Di động: Trên điện thoại nó sẽ thu gọn lại thành nút Menu 3 gạch để đỡ chật chỗ.
 * =================================================================================================
 */

import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

export default function Header() {
  // State lưu danh sách menu (nếu fetch từ server)
  const [menuItems, setMenuItems] = useState([]);
  
  // Hook lấy thông tin URL hiện tại để highlight menu active
  const location = useLocation();

  // Fetch menu từ API khi component mount (Optional feature)
  useEffect(() => {
    fetch("http://localhost:3001/api/menus")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setMenuItems(data.filter((item) => item.isActive));
        }
      })
      .catch((err) => {
        // Silent fail: Nếu API lỗi, sẽ dùng menu mặc định (hardcoded)
        console.warn("Không thể tải menu động, sử dụng menu mặc định.");
      });
  }, []);

  return (
    // Sticky Header: Luôn dính ở trên cùng khi cuộn trang
    // backdrop-blur: Hiệu ứng mờ nền kính (Glassmorphism)
    <nav className="sticky top-0 z-50 bg-white/98 backdrop-blur-md border-b border-gray-50 transition-all duration-500">
      <div className="w-full px-4 md:px-6">
        <div className="max-w-screen-2xl mx-auto flex justify-between items-center py-4">
          
          {/* LOGO THƯƠNG HIỆU */}
          <Link to="/" className="group">
            <span className="font-display font-bold text-[22px] tracking-[-0.02em] text-gray-900 transition-opacity duration-300 group-hover:opacity-60">
              DANANG.
            </span>
          </Link>

          {/* DESKTOP NAVIGATION */}
          <div className="hidden md:flex items-center gap-8 lg:gap-10">
            {menuItems.length > 0 ? (
              // Render menu động từ API
              menuItems.map((item) => (
                <Link
                  key={item.id}
                  to={item.link}
                  className={`relative text-[10px] font-bold tracking-[0.15em] uppercase transition-colors duration-300 ${
                    location.pathname === item.link
                      ? 'text-gray-900' // Active style
                      : 'text-gray-400 hover:text-gray-900' // Inactive style
                  }`}
                >
                  {item.name}
                  {/* Đường gạch chân cho Active Item */}
                  {location.pathname === item.link && (
                    <span className="absolute -bottom-[22px] left-0 right-0 h-[1px] bg-gray-900"></span>
                  )}
                </Link>
              ))
            ) : (
              // Menu mặc định (Hardcoded) - Fallback khi không có API
              <>
                <Link
                  to="/"
                  className={`relative text-[10px] font-bold tracking-[0.15em] uppercase transition-colors duration-300 ${
                    location.pathname === "/" ? 'text-gray-900' : 'text-gray-400 hover:text-gray-900'
                  }`}
                >
                  Trang Chủ
                  {location.pathname === "/" && (
                    <span className="absolute -bottom-[22px] left-0 right-0 h-[1px] bg-gray-900"></span>
                  )}
                </Link>
                
                <Link
                  to="/results"
                  className={`relative text-[10px] font-bold tracking-[0.15em] uppercase transition-colors duration-300 ${
                    location.pathname === "/results" ? 'text-gray-900' : 'text-gray-400 hover:text-gray-900'
                  }`}
                >
                  Lịch Trình
                  {location.pathname === "/results" && (
                    <span className="absolute -bottom-[22px] left-0 right-0 h-[1px] bg-gray-900"></span>
                  )}
                </Link>
                
                <Link
                  to="/chat"
                  className={`relative text-[10px] font-bold tracking-[0.15em] uppercase transition-colors duration-300 ${
                    location.pathname === "/chat" ? 'text-gray-900' : 'text-gray-400 hover:text-gray-900'
                  }`}
                >
                  Trợ Lý AI
                  {location.pathname === "/chat" && (
                    <span className="absolute -bottom-[22px] left-0 right-0 h-[1px] bg-gray-900"></span>
                  )}
                </Link>
                
                <Link
                  to="/admin"
                  className={`relative text-[10px] font-bold tracking-[0.15em] uppercase transition-colors duration-300 ${
                    location.pathname === "/admin" ? 'text-gray-900' : 'text-gray-400 hover:text-gray-900'
                  }`}
                >
                  Quản Trị
                  {location.pathname === "/admin" && (
                    <span className="absolute -bottom-[22px] left-0 right-0 h-[1px] bg-gray-900"></span>
                  )}
                </Link>
              </>
            )}
          </div>

          {/* MOBILE MENU TOGGLE (Chưa implement logic mở drawer) */}
          <button className="md:hidden text-xs font-bold tracking-widest uppercase text-gray-900">
            Menu
          </button>
        </div>
      </div>
    </nav>
  );
}
