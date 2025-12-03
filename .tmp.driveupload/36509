// file: frontend/src/services/api.js

/**
 * API Service - axios client cho backend
 *
 * Vai trò: centralized HTTP client, handle errors, base config
 * Không chứa business logic, chỉ HTTP calls
 */

import axios from "axios";

// Base URL (proxy qua Vite trong dev)
const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Response interceptor - handle errors
apiClient.interceptors.response.use(
  (response) => response.data, // Return data directly
  (error) => {
    // Format error message
    const message =
      error.response?.data?.error?.message ||
      error.message ||
      "Đã xảy ra lỗi khi kết nối server";

    console.error("API Error:", {
      url: error.config?.url,
      status: error.response?.status,
      message,
    });

    // Throw formatted error
    throw new Error(message);
  }
);

/**
 * Generate itinerary
 * @param {Object} userRequest
 * @returns {Promise<Object>} - itinerary
 */
export async function generateItinerary(userRequest) {
  const response = await apiClient.post("/itinerary/generate", userRequest);
  return response.data;
}

/**
 * Send chat message
 * @param {string} message
 * @param {Object} context - {itinerary?, userRequest?}
 * @returns {Promise<Object>} - chat response
 */
export async function sendChatMessage(message, context = {}) {
  const response = await apiClient.post("/chat", { message, context });
  return response.data;
}

/**
 * Search locations
 * @param {string} query - search keyword
 * @param {string} type - location type filter
 * @returns {Promise<Array>} - locations
 */
export async function searchLocations(query = "", type = "") {
  const params = new URLSearchParams();
  if (query) params.append("q", query);
  if (type) params.append("type", type);

  const response = await apiClient.get(`/location/search?${params.toString()}`);
  return response.data;
}

/**
 * Health check
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
