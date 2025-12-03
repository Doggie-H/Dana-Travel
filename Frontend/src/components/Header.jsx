import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

export default function Header() {
  const [menuItems, setMenuItems] = useState([]);
  const location = useLocation();

  useEffect(() => {
    fetch("http://localhost:3001/api/menus")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setMenuItems(data.filter((item) => item.isActive));
        }
      })
      .catch((err) => console.error("Failed to fetch menus:", err));
  }, []);

  return (
    <nav className="sticky top-0 z-50 bg-white/98 backdrop-blur-md border-b border-gray-50 transition-all duration-500">
      <div className="w-full px-4 md:px-6">
        <div className="max-w-screen-2xl mx-auto flex justify-between items-center py-4">
          
          {/* Logo */}
          <Link to="/" className="group">
            <span className="font-display font-bold text-[22px] tracking-[-0.02em] text-gray-900 transition-opacity duration-300 group-hover:opacity-60">
              DANANG.
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8 lg:gap-10">
            {menuItems.length > 0 ? (
              menuItems.map((item) => (
                <Link
                  key={item.id}
                  to={item.link}
                  className={`relative text-[10px] font-bold tracking-[0.15em] uppercase transition-colors duration-300 ${
                    location.pathname === item.link
                      ? 'text-gray-900'
                      : 'text-gray-400 hover:text-gray-900'
                  }`}
                >
                  {item.name}
                  {location.pathname === item.link && (
                    <span className="absolute -bottom-[22px] left-0 right-0 h-[1px] bg-gray-900"></span>
                  )}
                </Link>
              ))
            ) : (
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
                  Trợ Lý
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

          {/* Mobile Menu Toggle */}
          <button className="md:hidden text-xs font-bold tracking-widest uppercase text-gray-900">
            Menu
          </button>
        </div>
      </div>
    </nav>
  );
}
