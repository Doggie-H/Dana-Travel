/**
 * NOTIFICATION COMPONENT
 * 
 * Component hiển thị thông báo (Alert/Toast).
 * Hỗ trợ các loại thông báo: Success, Error, Warning, Info.
 * 
 * Props:
 * - type: Loại thông báo ('success' | 'error' | 'warning' | 'info').
 * - message: Nội dung thông báo.
 * - onClose: Hàm callback khi người dùng đóng thông báo.
 */

export default function Notification({ type = "info", message, onClose }) {
  // Nếu không có tin nhắn thì không hiển thị gì cả
  if (!message) return null;

  // Cấu hình style (màu sắc) cho từng loại thông báo
  const styles = {
    success: "bg-green-50 border-green-200 text-green-800",
    error: "bg-red-50 border-red-200 text-red-800",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
    info: "bg-blue-50 border-blue-200 text-blue-800",
  };

  // SVG Icons tương ứng cho từng loại
  const iconPaths = {
    success: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z", // Check circle
    error: "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z", // Exclamation circle
    warning: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z", // Triangle warning
    info: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z", // Info circle
  };

  return (
    <div
      className={`relative px-6 py-4 border rounded-lg ${styles[type] || styles.info} flex items-start gap-3 shadow-sm transition-all duration-300`}
      role="alert"
    >
      {/* Icon */}
      <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={iconPaths[type] || iconPaths.info} />
      </svg>

      {/* Message Content */}
      <p className="flex-1 text-sm font-medium leading-relaxed">{message}</p>

      {/* Close Button (Optional) */}
      {onClose && (
        <button
          type="button"
          className="flex-shrink-0 text-current opacity-50 hover:opacity-100 transition-opacity focus:outline-none"
          onClick={onClose}
          aria-label="Close"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
