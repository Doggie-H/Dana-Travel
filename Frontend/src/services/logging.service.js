
/**
 * Service ghi nhận lỗi từ Frontend gửi về Backend.
 */

// Lấy API URL từ biến môi trường (Vite prefix = VITE_)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api";

let isLogging = false; // Flag để tránh loop vô hạn

export const logErrorToBackend = async (error, errorInfo = null) => {
  if (isLogging) return; // Đang log thì thôi, tránh đệ quy
  
  try {
    isLogging = true;
    
    const errorPayload = {
      message: error?.message || (typeof error === 'string' ? error : "Unknown Frontend Error"),
      stack: error?.stack || null,
      path: window.location.pathname, // URL hiện tại
      method: "FRONTEND_ERROR",
      source: "FRONTEND",
      body: JSON.stringify({
        errorInfo: errorInfo, // React Error Boundary info
        type: errorInfo?.type || "Standard Error",
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      }),
      user: "visitor", // Có thể lấy user thật từ localStorage nếu muốn
    };

    // Fire and forget (không await để không chặn UI)
    fetch(`${API_BASE_URL}/logs/error`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(errorPayload),
    }).catch(err => {
        // Fallback: không thể log ra server thì log ra console (nhưng cẩn thận loop)
        // console.warn("Failed to send error report:", err);
    });

  } catch (e) {
    // console.warn("Critical: Logging system suppressed an error", e);
  } finally {
    isLogging = false;
  }
};

/**
 * Tự động bắt tất cả các loại lỗi trên Frontend
 * Bao gồm: React Crash, Syntax Error, Promise Rejection, và console.error
 */
export const initGlobalErrorLogging = () => {
    // 1. Bắt lỗi Javascript Global (cú pháp, runtime ngoài React)
    window.addEventListener("error", (event) => {
        logErrorToBackend(event.error || new Error(event.message), { type: "Window Error (Global)" });
    });

    // 2. Bắt lỗi Async Promise (fetch fail, v.v.)
    window.addEventListener("unhandledrejection", (event) => {
        logErrorToBackend(event.reason || new Error("Unhandled Promise Rejection"), { type: "Unhandled Promise" });
    });

    // 3. Bắt luôn cả console.error (Cho những lỗi "nhẹ" mà lập trình viên log ra nhưng không crash app)
    const originalConsoleError = console.error;
    console.error = (...args) => {
        // Vẫn in ra console trình duyệt như bình thường
        originalConsoleError(...args);
        
        // Gửi về server (chuyển args thành chuỗi message)
        const message = args.map(arg => {
            if (arg instanceof Error) return arg.message;
            if (typeof arg === 'object') return JSON.stringify(arg);
            return String(arg);
        }).join(" ");

        logErrorToBackend(new Error(message), { type: "Console.error" });
    };

    // 4. Bắt luôn console.warn (Cảnh báo nhẹ: sai propType, biến không dùng...)
    const originalConsoleWarn = console.warn;
    console.warn = (...args) => {
        originalConsoleWarn(...args);
        
        const message = args.map(arg => {
            if (arg instanceof Error) return arg.message;
            if (typeof arg === 'object') return JSON.stringify(arg);
            return String(arg);
        }).join(" ");

        // Gửi warning về server (nhưng đánh dấu là WARNING để dễ lọc nếu cần)
        logErrorToBackend(new Error(message), { type: "Console.warn" });
    };
};
