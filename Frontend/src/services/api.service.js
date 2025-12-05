/**
 * Service quản lý các cuộc gọi API tới Backend.
 * Cấu hình Axios instance và các hàm helper cho từng endpoint.
 */

import axios from "axios";

// Base URL (Lấy từ biến môi trường hoặc mặc định là /api)
// Trong môi trường Dev, Vite sẽ proxy /api sang backend server.
const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

// Khởi tạo Axios Instance với cấu hình mặc định
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // Timeout sau 30 giây
  headers: {
    "Content-Type": "application/json",
  },
});

// --- RESPONSE INTERCEPTOR (XỬ LÝ PHẢN HỒI) ---
apiClient.interceptors.response.use(
  (response) => response.data, // Trả về dữ liệu trực tiếp (bỏ qua wrapper của axios)
  (error) => {
    // Format thông báo lỗi để hiển thị cho người dùng
    const message =
      error.response?.data?.error?.message ||
      error.message ||
      "Đã xảy ra lỗi khi kết nối server";

    // Ghi log lỗi để debug
    console.error("Lỗi API:", {
      url: error.config?.url,
      status: error.response?.status,
      message,
    });

    // Ném lỗi ra để component xử lý (hiển thị thông báo)
    throw new Error(message);
  }
);

/**
 * Gọi API tạo lịch trình.
 * POST /api/itinerary/generate
 * 
 * @param {Object} userRequest - Dữ liệu form (budget, dates, preferences...).
 * @returns {Promise<Object>} - Đối tượng lịch trình đã tạo.
 */
export async function generateItinerary(userRequest) {
  const response = await apiClient.post("/itinerary/generate", userRequest);
  return response.data;
}

/**
 * Gọi API gửi tin nhắn Chatbot.
 * POST /api/chat
 * 
 * @param {string} message - Nội dung tin nhắn.
 * @param {Object} context - Ngữ cảnh (lịch trình hiện tại, request gốc).
 * @returns {Promise<Object>} - Phản hồi từ Bot.
 */
export async function sendChatMessage(message, context = {}) {
  const response = await apiClient.post("/chat", { message, context });
  return response.data;
}

/**
 * Gọi API tìm kiếm địa điểm.
 * GET /api/location/search
 * 
 * @param {string} query - Từ khóa tìm kiếm.
 * @param {string} type - Loại địa điểm (tùy chọn).
 * @returns {Promise<Array>} - Danh sách địa điểm tìm thấy.
 */
export async function searchLocations(query = "", type = "") {
  const params = new URLSearchParams();
  if (query) params.append("q", query);
  if (type) params.append("type", type);

  const response = await apiClient.get(`/location/search?${params.toString()}`);
  return response.data;
}

/**
 * Kiểm tra trạng thái Server (Health Check).
 * GET /api/ping
 * 
 * @returns {Promise<Object>}
 */
export async function ping() {
  const response = await apiClient.get("/ping");
  return response.data;
}

export default {
  generateItinerary,
  sendChatMessage,
  searchLocations,
  ping,
};
