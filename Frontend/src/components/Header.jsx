/**
 * Component Header (Navigation Bar).
 * Hiển thị logo và menu điều hướng chính của ứng dụng.
 */

import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

export default function Header() {
  // Hook lấy thông tin URL hiện tại để highlight menu active
  const location = useLocation();


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
