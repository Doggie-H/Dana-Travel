
import React from "react";
import { logErrorToBackend } from "../../services/logging-service";

/**
 * Global Error Boundary
 * Bắt lỗi Render của React Component con.
 */
class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Cập nhật state để hiển thị fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Ghi log lỗi ngay lập tức
    console.error("❌ GlobalErrorBoundary caught an error:", error, errorInfo);
    logErrorToBackend(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI khi ứng dụng bị crash
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-900 p-6">
          <div className="max-w-md w-full bg-white shadow-xl rounded-2xl p-8 text-center border border-red-100">
            <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            </div>
            <h1 className="text-2xl font-bold mb-2">Đã xảy ra lỗi!</h1>
            <p className="text-gray-500 mb-6">
              Hệ thống đã ghi nhận lỗi này và chúng tôi sẽ khắc phục sớm nhất có thể.
            </p>
            <div className="bg-gray-100 p-4 rounded-lg text-left text-xs font-mono overflow-auto max-h-40 mb-6 text-gray-600">
              {this.state.error?.toString()}
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-colors"
            >
              Tải lại trang
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default GlobalErrorBoundary;
