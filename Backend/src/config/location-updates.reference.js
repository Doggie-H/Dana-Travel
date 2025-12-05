/**
 * MAPPING LOCATIONS DATA - Gán visitType và validate giá thực tế Đà Nẵng
 *
 * Script này dùng để reference khi cập nhật locations.js
 * Mỗi địa điểm cần thêm: visitType, operatingHours, validPrice
 */

export const LOCATION_UPDATES = {
  // === BEACHES ===
  loc_006: {
    visitType: "beach",
    operatingHours: { start: 6, end: 20 },
    validPrice: { min: 0, max: 0 }, // Miễn phí
    category: "beach",
  },
  loc_017: {
    visitType: "beach",
    operatingHours: { start: 6, end: 20 },
    validPrice: { min: 0, max: 0 },
    category: "beach",
  },
  loc_018: {
    visitType: "beach",
    operatingHours: { start: 6, end: 20 },
    validPrice: { min: 0, max: 0 },
    category: "beach",
  },

  // === THEME PARKS & ATTRACTIONS ===
  loc_001: {
    // Bà Nà Hills
    visitType: "ba-na-hills",
    operatingHours: { start: 7, end: 21 },
    validPrice: { min: 700000, max: 800000 },
    category: "theme-park",
    requiredMinTime: 360, // 6h
  },
  loc_004: {
    // Asia Park
    visitType: "theme-park",
    operatingHours: { start: 9, end: 23 },
    validPrice: { min: 150000, max: 200000 },
    category: "theme-park",
    requiredMinTime: 240, // 4h
  },

  // === CULTURE & MUSEUMS ===
  loc_005: {
    // Bảo tàng Chăm
    visitType: "museum-culture",
    operatingHours: { start: 8, end: 17 },
    validPrice: { min: 35000, max: 50000 },
    category: "culture",
  },
  loc_007: {
    // Ngũ Hành Sơn
    visitType: "attraction",
    operatingHours: { start: 7, end: 18 },
    validPrice: { min: 15000, max: 30000 },
    category: "attraction",
  },

  // === NIGHT ATTRACTIONS ===
  loc_002: {
    // Cầu Rồng
    visitType: "night-attraction",
    operatingHours: { start: 18, end: 24 },
    validPrice: { min: 0, max: 0 },
    category: "attraction",
    bestFor: "evening",
  },
  loc_025: {
    // Cầu Tình Yêu
    visitType: "night-attraction",
    operatingHours: { start: 18, end: 24 },
    validPrice: { min: 0, max: 0 },
    category: "attraction",
    bestFor: "evening",
  },

  // === RESTAURANTS - CHEAP (20-50k) ===
  loc_008: {
    // Quán Bún Chả Cá 109
    visitType: "restaurant-cheap",
    operatingHours: { start: 6, end: 22 },
    validPrice: { min: 20000, max: 50000 },
    category: "food",
    mealTypes: ["breakfast", "lunch", "dinner"],
  },
  loc_009: {
    // Mỳ Quảng Bà Mua
    visitType: "restaurant-cheap",
    operatingHours: { start: 6, end: 22 },
    validPrice: { min: 30000, max: 50000 },
    category: "food",
    mealTypes: ["breakfast", "lunch", "dinner"],
  },

  // === RESTAURANTS - MODERATE (60-150k) ===
  loc_010: {
    // Madame Lân
    visitType: "restaurant-moderate",
    operatingHours: { start: 11, end: 23 },
    validPrice: { min: 200000, max: 300000 },
    category: "food",
    mealTypes: ["lunch", "dinner"],
  },

  // === BARS & NIGHTLIFE (100k+) ===
  loc_041: {
    // Sky36 Bar
    visitType: "bar-nightlife",
    operatingHours: { start: 18, end: 4 },
    validPrice: { min: 100000, max: 500000 },
    category: "nightlife",
    bestFor: "night",
  },

  // === MARKETS ===
  loc_031: {
    // Chợ Hàn
    visitType: "market",
    operatingHours: { start: 6, end: 23 },
    validPrice: { min: 0, max: 100000 },
    category: "shopping",
  },
  loc_042: {
    // Chợ Đêm
    visitType: "market",
    operatingHours: { start: 18, end: 24 },
    validPrice: { min: 0, max: 200000 },
    category: "shopping",
    bestFor: "evening",
  },

  // === ACCOMMODATION ===
  loc_014: {
    // Grand Mercure
    visitType: "accommodation",
    operatingHours: { start: 0, end: 24 },
    validPrice: { min: 600000, max: 1000000 },
    category: "accommodation",
  },
  loc_015: {
    // Brilliant Hotel
    visitType: "accommodation",
    operatingHours: { start: 0, end: 24 },
    validPrice: { min: 600000, max: 900000 },
    category: "accommodation",
  },

  // === CAFES & SNACKS ===
  loc_089: {
    // Wonderlust Cafe
    visitType: "cafe-snack",
    operatingHours: { start: 7, end: 22 },
    validPrice: { min: 50000, max: 150000 },
    category: "food",
  },
};

/**
 * Template comment để thêm vào locations.js
 *
 * Thêm vào mỗi location object:
 *
 * visitType: "beach" | "theme-park" | "attraction" | "museum-culture" |
 *            "night-attraction" | "restaurant-cheap" | "restaurant-moderate" |
 *            "bar-nightlife" | "market" | "cafe-snack" | "accommodation"
 *
 * operatingHours: {
 *   start: 6,  // Mở cửa lúc 6h sáng
 *   end: 20    // Đóng cửa lúc 8h tối
 * }
 *
 * validPrice: {
 *   min: 20000,  // Giá tối thiểu
 *   max: 50000   // Giá tối đa
 * }
 */

/**
 * GIÁ THỰC TẾ ĐÀ NẴNG - Reference
 *
 * Quán ăn bình dân (1 người):
 * - Bánh mì: 15-25k
 * - Phở/Bún bò: 30-45k
 * - Mì quảng: 40-50k
 * - Cơm bình dân: 30-40k
 * - Bánh xèo: 50-60k
 *
 * Nhà hàng trung bình (1 người):
 * - Cơm niêu: 80-120k
 * - Pizza: 150-200k
 * - Hải sản: 150-200k
 *
 * Quán bar/nhậu (1 người):
 * - Bia + đồ ăn: 150-300k
 * - Karaoke: 300-500k+
 *
 * Khách sạn (1 phòng/đêm):
 * - Homestay: 200-400k
 * - Hotel 3-4*: 600-1000k
 * - Resort 5*: 2-5 triệu
 *
 * Vé tham quan:
 * - Miễn phí: Bãi biển, cầu, chùa
 * - Giá rẻ (<50k): Ngũ Hành Sơn, bảo tàng
 * - Giá vừa (50-200k): Asia Park, Upside Down
 * - Giá cao (>500k): Bà Nà Hills (750k)
 */
