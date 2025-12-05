/**
 * =====================================================
 * ITINERARY HELPERS - Hàm Hỗ Trợ Lập Lịch Trình
 * =====================================================
 * 
 * File này chứa các hàm tiện ích dùng cho việc tính toán:
 * - Khoảng cách giữa 2 địa điểm (theo công thức Haversine)
 * - Chi phí và thời gian di chuyển
 * - Format thời gian từ số thập phân sang chuỗi HH:MM
 * 
 * Được sử dụng bởi: generate-day-schedule-strict.js, itinerary.service.js
 */

import { TRANSPORT_COSTS } from "../config/app.constants.js";

/**
 * Tính khoảng cách giữa 2 điểm trên bản đồ (đơn vị: km)
 * Sử dụng công thức Haversine - tính khoảng cách đường chim bay
 * 
 * @param {number} lat1 - Vĩ độ điểm xuất phát
 * @param {number} lon1 - Kinh độ điểm xuất phát
 * @param {number} lat2 - Vĩ độ điểm đến
 * @param {number} lon2 - Kinh độ điểm đến
 * @returns {number} Khoảng cách (km)
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
  
  const R = 6371; // Bán kính Trái Đất (km)
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return R * c;
}

/** Chuyển độ sang radian (hỗ trợ calculateDistance) */
function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

/**
 * Tính chi phí và thời gian di chuyển
 * 
 * @param {number} distanceKm - Quãng đường (km)
 * @param {string} mode - Loại phương tiện ("grab-car", "grab-bike", "own")
 * @param {number} numPeople - Số người đi
 * @returns {Object} { cost, duration, suggestion }
 *   - cost: Chi phí (VND)
 *   - duration: Thời gian di chuyển (phút)
 *   - suggestion: Gợi ý phương tiện phù hợp
 */
export function calculateTransport(distanceKm, mode, numPeople) {
  const config = TRANSPORT_COSTS[mode] || TRANSPORT_COSTS["grab-car"];
  let cost = 0;
  let suggestion = "";

  // Nếu quá gần (< 0.5km) thì gợi ý đi bộ, nhưng vẫn tính phí nếu chọn Grab
  if (distanceKm < 0.5) {
    suggestion = "Đi bộ cho khỏe (Gần)";
    if (mode === "own") cost = 0; // Xe riêng đi gần coi như không tốn xăng đáng kể
    else if (mode.includes("grab") || mode.includes("taxi")) cost = config.base; // Grab vẫn tốn phí mở cửa
  } 
  // Xe máy (GrabBike/XanhSM)
  else if (mode === "grab-bike") {
    suggestion = distanceKm < 5 
        ? "GrabBike/XanhSM Bike (Tiết kiệm & Nhanh gọn)" 
        : "GrabBike/XanhSM Bike (Nên so sánh giá Grab & XanhSM)";
    cost = (config.base + (distanceKm - 2) * config.perKm) * numPeople;
    if (cost < config.base) cost = config.base; // Tối thiểu bằng giá mở cửa
  } 
  // Ô tô hoặc xe máy cá nhân
  else {
    suggestion = mode === "own"
        ? "Xe máy cá nhân (Chủ động)"
        : "Taxi/GrabCar (Thoải mái)";

    if (mode === "own") {
      cost = distanceKm * config.perKm; // Chỉ tính tiền xăng
    } else {
      cost = config.base + distanceKm * config.perKm; // Tổng cước
    }
  }

  // Thời gian = Quãng đường / Tốc độ + 5 phút chờ
  const speed = config.speed || 30;
  const duration = (distanceKm / speed) * 60 + 5;

  return { cost: Math.max(0, Math.round(cost)), duration, suggestion };
}

/**
 * Chuyển thời gian dạng số thập phân sang chuỗi HH:MM
 * Ví dụ: 8.5 => "08:30", 14.75 => "14:45"
 * 
 * @param {number} decimalTime - Thời gian dạng số (ví dụ: 8.5 = 8h30)
 * @returns {string} Chuỗi thời gian "HH:MM"
 */
export function formatTime(decimalTime) {
  const hours = Math.floor(decimalTime) % 24;
  const minutes = Math.round((decimalTime - Math.floor(decimalTime)) * 60);
  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}`;
}

// Export mặc định cho import dạng object
export default {
  calculateDistance,
  calculateTransport,
  formatTime,
};
