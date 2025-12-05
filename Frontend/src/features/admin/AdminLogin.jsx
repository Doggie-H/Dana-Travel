/**
 * Form đăng nhập Admin.
 * Xử lý xác thực người dùng trước khi truy cập Dashboard.
 */

import { useState } from "react";

export default function AdminLogin({ onLogin, loading, error }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // Gọi hàm callback từ component cha để xử lý logic đăng nhập
    onLogin(username, password);
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center">
      <div className="w-full max-w-md">
        
        {/* Header */}
        <div className="text-center mb-10">
          <h4 className="font-display text-3xl text-gray-900 mb-2">
            Đăng Nhập Quản Trị
          </h4>
          <p className="text-gray-400 font-light text-sm">
            Vui lòng xác thực danh tính để truy cập hệ thống
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm text-center rounded-xl animate-shake">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username Input */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              Tên đăng nhập
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-gray-900 focus:ring-0 transition-all outline-none font-medium text-gray-900 placeholder-gray-300"
              placeholder="Nhập username..."
              autoFocus
            />
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              Mật khẩu
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-gray-900 focus:ring-0 transition-all outline-none font-medium text-gray-900 placeholder-gray-300"
              placeholder="••••••••"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-gray-200"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                {/* Loading Spinner SVG */}
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Đang xử lý...
              </span>
            ) : (
              "Đăng Nhập"
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-300">
            &copy; 2025 Danang Travel Concierge. Protected System.
          </p>
        </div>
      </div>
    </div>
  );
}
