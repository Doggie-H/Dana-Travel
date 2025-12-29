/**
 * Layout chung cho trang Admin.
 * Bao gồm Header, Navigation Tabs và Content Area.
 */

import { useNavigate } from "react-router-dom";
import { getRoleLabel, getRoleBadgeColor } from "./utils/permission-util";

export default function AdminLayout({ 
  children, 
  user, 
  onLogout, 
  activeTab, 
  onTabChange,
  tabs = [] 
}) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white py-8 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        {/* --- HEADER SECTION --- */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10 gap-6 border-b border-gray-100 pb-8">
          
          {/* Admin Info */}
          <div>
            <h2 className="font-display text-3xl md:text-4xl text-gray-900 flex items-center gap-4">
              <span>Admin Panel</span>
              {user && (
                <div className="flex flex-col items-start gap-1">
                  {/* Role Badge: Hiển thị vai trò với màu sắc tương ứng */}
                  <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getRoleBadgeColor(user.role)}`}>
                    {getRoleLabel(user.role)}
                  </span>
                  <span className="text-xs text-gray-400 font-medium ml-1">
                    @{user.username}
                  </span>
                </div>
              )}
            </h2>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              className="px-6 py-2 border border-gray-200 text-gray-600 text-xs font-bold uppercase tracking-widest hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all rounded-lg"
              onClick={onLogout}
            >
              Đăng Xuất
            </button>
            <button
              className="px-6 py-2 bg-gray-900 text-white text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-all rounded-lg"
              onClick={() => navigate("/")}
            >
              Về Trang Chủ
            </button>
          </div>
        </div>

        {/* --- NAVIGATION TABS --- */}
        <div className="flex flex-wrap gap-2 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                activeTab === tab.id
                  ? "bg-gray-900 text-white shadow-lg shadow-gray-200 scale-105" // Active Style
                  : "bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-900" // Inactive Style
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* --- MAIN CONTENT AREA --- */}
        <div className="animate-fadeIn">
          {children}
        </div>
      </div>
    </div>
  );
}
