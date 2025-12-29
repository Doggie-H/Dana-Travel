/**
 * =================================================================================================
 * API SERVICE - GIAO TIẾP BACKEND
 * =================================================================================================
 * 
 * Quản lý Axios Instance và định nghĩa các hàm gọi API chung cho toàn ứng dụng.
 */

import axios from "axios";

// Config
const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

// Response Interceptor: Extract Data & Handle Visual Errors
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.error?.message || error.message || "Lỗi kết nối Server";
    console.error("API Error:", { url: error.config?.url, status: error.response?.status, message });
    throw new Error(message);
  }
);


/**
 * =================================================================================================
 * ENDPOINTS
 * =================================================================================================
 */

// 1. ITINERARY
export async function generateItinerary(userRequest) {
  const response = await apiClient.post("/itinerary/generate", userRequest);
  return response.data;
}

// 2. CHATBOT
export async function sendChatMessage(message, context = {}) {
  const response = await apiClient.post("/chat", { message, context });
  return response.data;
}

// 3. LOCATION SEARCH
export async function searchLocations(query = "", type = "") {
  const params = new URLSearchParams();
  if (query) params.append("q", query);
  if (type) params.append("type", type);

  const response = await apiClient.get(`/location/search?${params.toString()}`);
  return response.data;
}

// 4. SYSTEM HEALTH
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
