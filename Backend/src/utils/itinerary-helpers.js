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
  let cost = 0;
  let suggestion = "";
  let selectedConfig = null;
  let duration = 0;

  // 1. Nếu quá gần (< 0.5km) -> Đi bộ
  if (distanceKm < 0.5) {
    return { 
      cost: mode === "own" ? 0 : 20000, // Vẫn tốn phí mở cửa nếu gọi xe
      duration: (distanceKm / 5) * 60, // Tốc độ đi bộ 5km/h
      suggestion: "Tản bộ • Khoảng cách gần" 
    };
  }

  // 2. Logic so sánh giá
  if (mode === "own") {
    // Xe cá nhân
    const config = TRANSPORT_COSTS["own"];
    cost = distanceKm * config.perKm;
    suggestion = "Xe máy cá nhân • Tự túc";
    duration = (distanceKm / config.speed) * 60 + 5;
  } 
  else if (mode.includes("bike")) {
    // --- BIKE: So sánh Grab vs XanhSM ---
    const grab = calculateRideCost(distanceKm, TRANSPORT_COSTS["grab-bike"]);
    const xanh = calculateRideCost(distanceKm, TRANSPORT_COSTS["xanh-bike"]);

    // Chọn cái rẻ hơn
    if (grab.cost < xanh.cost) {
       cost = grab.cost;
       suggestion = `${TRANSPORT_COSTS["grab-bike"].label} • Lựa chọn tốt nhất`;
       duration = grab.duration;
    } else {
       cost = xanh.cost;
       suggestion = `${TRANSPORT_COSTS["xanh-bike"].label} • Lựa chọn tốt nhất`;
       duration = xanh.duration;
    }
    // Nhân số lượng xe nếu đi đông (dù bike thường đi 1, nhưng logic support nhóm phượt)
    cost = cost * numPeople; 
  } 
  else {
    // --- CAR: So sánh dựa trên số người ---
    const isLargeGroup = numPeople > 4;
    const typeSuffix = isLargeGroup ? "-7" : "-4";
    
    const grabKey = `grab-car${typeSuffix}`;
    const xanhKey = `xanh-car${typeSuffix}`;

    const grab = calculateRideCost(distanceKm, TRANSPORT_COSTS[grabKey]);
    const xanh = calculateRideCost(distanceKm, TRANSPORT_COSTS[xanhKey]);

    if (grab.cost < xanh.cost) {
        cost = grab.cost;
        suggestion = `${TRANSPORT_COSTS[grabKey].label} • Lựa chọn tốt nhất`;
        duration = grab.duration;
    } else {
        cost = xanh.cost;
        suggestion = `${TRANSPORT_COSTS[xanhKey].label} • Lựa chọn tốt nhất`;
        duration = xanh.duration;
    }
  }

  return { cost: Math.round(cost), duration, suggestion };
}

// Helper tính giá chuyến đi cụ thể
function calculateRideCost(distanceKm, config) {
  let cost = 0;
  // Giả định 'base' là giá mở cửa cho 2km đầu (trừ Xanh Car 4 là 1km)
  // Logic đơn giản hóa: 
  const firstKmPrice = config.base;
  const remainingKm = Math.max(0, distanceKm - 2); 
  
  cost = firstKmPrice + remainingKm * config.perKm;
  
  const duration = (distanceKm / config.speed) * 60 + 5; // +5p chờ
  return { cost, duration };
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
