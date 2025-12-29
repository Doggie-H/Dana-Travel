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
export function calculateTransport(distanceKm, mode, numPeople, transportCosts) {
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
    const config = transportCosts["own"];
    cost = distanceKm * config.perKm;
    suggestion = "Xe máy cá nhân • Tự túc";
    duration = (distanceKm / config.speed) * 60 + 5;
  }
  else if (mode.includes("bike")) {
    // --- BIKE: So sánh Grab vs XanhSM ---
    const grab = calculateRideCost(distanceKm, transportCosts["grab-bike"]);
    const xanh = calculateRideCost(distanceKm, transportCosts["xanh-bike"]);

    // Chọn cái rẻ hơn
    if (grab.cost < xanh.cost) {
      cost = grab.cost;
      suggestion = `${transportCosts["grab-bike"].label} • Lựa chọn tốt nhất`;
      duration = grab.duration;
    } else {
      cost = xanh.cost;
      suggestion = `${transportCosts["xanh-bike"].label} • Lựa chọn tốt nhất`;
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

    const grab = calculateRideCost(distanceKm, transportCosts[grabKey]);
    const xanh = calculateRideCost(distanceKm, transportCosts[xanhKey]);

    if (grab.cost < xanh.cost) {
      cost = grab.cost;
      suggestion = `${transportCosts[grabKey].label} • Lựa chọn tốt nhất`;
      duration = grab.duration;
    } else {
      cost = xanh.cost;
      suggestion = `${transportCosts[xanhKey].label} • Lựa chọn tốt nhất`;
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

export default {
  calculateDistance,
  calculateTransport,
  resolveAccommodation,
  calculateAccommodationCost,
  getBudgetStatus,
  formatDate,
  createErrorDay
};

// --- NEW HELPERS (Moved from Service for Readability) ---

/**
 * 3. Giải quyết vấn đề nơi ở
 * Tìm khách sạn phù hợp trong DB hoặc trả về nhà riêng/nhà người quen
 */
export function resolveAccommodation(type, hotels, dailyBudget, numPeople) {
  // Case A: Nhà riêng / Nhà người quen / Ở nhờ
  if (['home', 'friend', 'relative', 'free'].includes(type) || !type) {
    if (['home', 'friend', 'relative', 'free'].includes(type)) { // Explicit check
      return {
        id: 'user-home',
        name: 'Nhà riêng / Nhà người quen',
        type: 'home',
        address: 'Địa chỉ của bạn tại Đà Nẵng',
        area: 'Trung tâm',
        lat: 16.0544,
        lng: 108.2022,
        ticket: 0,
        priceLevel: 'free'
      };
    }
    // If type is empty/null but logic fell through, handled by default below (or treat as hotel/any)
  }

  // Case B: Chọn khách sạn từ Database
  // Logic: Chọn dựa trên ngân sách/người
  const perPersonBudget = dailyBudget / numPeople;
  let targetType = "guesthouse"; // Mặc định tiết kiệm

  if (perPersonBudget > 1200000) targetType = "hotel"; // Sang trọng
  else if (perPersonBudget > 800000 && numPeople > 4) targetType = "homestay"; // Nhóm đông + Khá
  else if (perPersonBudget > 800000) targetType = "hotel"; // Ít người + Khá

  // Override nếu user request cụ thể (nhưng vẫn check tiền)
  if (type && type !== 'any') {
    if (type === 'hotel' && perPersonBudget < 500000) targetType = 'guesthouse'; // Muốn ở khách sạn mà ít tiền -> Nhà nghỉ
    else targetType = type;
  }

  // Filter candidates
  let candidates = hotels.filter(h => {
    if (targetType === 'guesthouse') return h.type === 'guesthouse' || h.priceLevel === 'cheap';
    if (targetType === 'homestay') return h.type === 'homestay';
    return h.type === 'hotel';
  });

  if (candidates.length === 0) candidates = hotels; // Fallback lấy hết nếu lọc ra rỗng

  // Sort tìm cái giá hợp lý nhất (Gần với 25% ngân sách ngày)
  const estimatedStayBudget = dailyBudget * 0.25;
  candidates.sort((a, b) => Math.abs((a.ticket || 0) - estimatedStayBudget) - Math.abs((b.ticket || 0) - estimatedStayBudget));

  const selected = candidates[0];

  // Fallback data nếu DB lỗi hết
  return selected || {
    id: 'fallback-hotel',
    name: 'Khách sạn trung tâm',
    type: 'hotel',
    address: 'Trung tâm Đà Nẵng',
    ticket: 500000,
    lat: 16.0544, lng: 108.2022
  };
}

/**
 * 4. Tính toán chi phí lưu trú
 */
export function calculateAccommodationCost(hotel, type, numDays, numPeople) {
  if (['home', 'friend', 'relative', 'free'].includes(type)) return 0;
  if (hotel.priceLevel === 'free') return 0;

  const basePrice = hotel.ticket || (hotel.priceLevel === "expensive" ? 1500000 : 500000);
  // Giả định 2 người/phòng
  const numRooms = Math.ceil(numPeople / 2);
  // Tính theo đêm (N ngày = N-1 đêm)
  const numNights = Math.max(1, numDays - 1);

  return basePrice * numRooms * numNights;
}

/**
 * 5. Đánh giá tình trạng ngân sách
 */
export function getBudgetStatus(total, budget) {
  if (total > budget * 1.1) return "Vượt ngân sách";
  if (total < budget * 0.8) return "Tiết kiệm";
  return "Phù hợp";
}

/**
 * 6. Format Date Helper (VN)
 */
export function formatDate(date) {
  // Return ISO string (YYYY-MM-DD) for Frontend to format
  return date.toISOString().split('T')[0];
}

/**
 * 7. Tạo ngày lỗi (Fallback Day)
 */
import { formatDecimalTime } from "./format.util.js"; // Import internal helper

export function createErrorDay(dayNum, date, start, end) {
  return {
    day: dayNum,
    date: formatDate(date),
    items: [{
      type: "note",
      title: "Sự cố kỹ thuật",
      description: "Hệ thống gặp sự cố khi tạo lịch cho ngày này. Chúng tôi xin lỗi vì sự bất tiện.",
      timeStart: formatDecimalTime(start),
      timeEnd: formatDecimalTime(end),
      cost: { ticket: 0, food: 0, other: 0 }
    }]
  };
}
