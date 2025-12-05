/**
 * =================================================================================================
 * FILE: ErrorBoundary.jsx
 * MỤC ĐÍCH: Bắt lỗi và ngăn chặn sập trang (Crash).
 * NGƯỜI TẠO: Team DanaTravel (AI Support)
 * 
 * MÔ TẢ CHI TIẾT (BEGINNER GUIDE):
 * Đây là "Cầu chì" của hệ thống điện.
 * 1. Sự cố: Nếu một bóng đèn (Component con) bị cháy (Lỗi Code), cầu chì sẽ ngắt điện khu vực đó.
 * 2. Bảo vệ: Thay vì cả căn nhà tối om (Trắng trang), nó chỉ hiện thông báo "Có lỗi xảy ra" ở khu vực đó thôi.
 * 3. Báo cáo: Ghi lại lỗi để thợ điện (Developer) biết đường mà sửa.
 * =================================================================================================
 */

import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    // State lưu trạng thái lỗi
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  /**
   * Lifecycle: Được gọi khi có lỗi xảy ra trong component con.
   * Dùng để cập nhật state và hiển thị Fallback UI.
   */
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  /**
   * Lifecycle: Được gọi sau khi lỗi đã được bắt.
   * Dùng để log lỗi (ví dụ: gửi về server logging service).
   */
  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    // Nếu có lỗi, hiển thị giao diện thông báo lỗi
    if (this.state.hasError) {
      return (
        <div className="p-8 bg-red-50 text-red-900 min-h-screen flex flex-col items-center justify-center">
          <h1 className="text-2xl font-bold mb-4">Đã xảy ra lỗi không mong muốn!</h1>
          
          {/* Chi tiết lỗi (Chỉ nên hiện trong môi trường Dev hoặc cho Admin) */}
          <div className="bg-white p-6 rounded shadow-lg max-w-2xl w-full overflow-auto border border-red-100">
            <p className="font-mono text-sm font-bold text-red-600 mb-2">
              {this.state.error && this.state.error.toString()}
            </p>
            <pre className="font-mono text-xs text-gray-600 whitespace-pre-wrap">
              {this.state.errorInfo && this.state.errorInfo.componentStack}
            </pre>
          </div>

          {/* Nút tải lại trang để khôi phục */}
          <button 
            onClick={() => window.location.reload()}
            className="mt-6 px-6 py-2 bg-red-600 text-white font-medium rounded hover:bg-red-700 transition-colors shadow-sm"
          >
            Tải lại trang
          </button>
        </div>
      );
    }

    // Nếu không có lỗi, render component con bình thường
    return this.props.children; 
  }
}

export default ErrorBoundary;
