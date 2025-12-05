/**
 * =====================================================
 * SCHEDULING CONSTANTS - Quy Tắc Lập Lịch
 * =====================================================
 * 
 * File: scheduling.constants.js
 * Mục đích: Định nghĩa các quy tắc cứng cho việc lập lịch trình
 * 
 * NỘI DUNG:
 * 1. LOCATION_RULES - Giờ hoạt động, thời gian tối thiểu cho từng loại địa điểm
 * 2. SCHEDULING_RULES - Quy tắc phân bổ hoạt động trong ngày
 * 3. Helper functions - Các hàm kiểm tra nhanh (canVisitAtTime, isBestTimeToVisit...)
 * 
 * Được sử dụng bởi: generate-day-schedule-strict.js, itinerary-validator.js
 */

// --- 1. GIỜ HOẠT ĐỘNG & THỜI GIAN TỐI THIỂU ---

export const LOCATION_RULES = {
  // Bãi biển
  beach: {
    operatingHours: { start: 6, end: 20 }, // 6h sáng - 8h tối
    bestTimes: ["morning", "afternoon", "golden-hour"], // Sáng, chiều, bình minh
    minVisitDuration: 90, // Tối thiểu 1.5h mới đáng chơi
    category: "beach",
    needsSpecialCondition: false,
  },

  // Bà Nà Hills
  "ba-na-hills": {
    operatingHours: { start: 7, end: 21 }, // 7h sáng - 9h tối
    bestTimes: ["morning", "afternoon"], // Sáng, chiều (để tránh tấp nập)
    minVisitDuration: 360, // Tối thiểu 6h để không hối tiếc
    maxDailyVisits: 1, // Chỉ có thể đi 1 lần/ngày
    category: "theme-park",
    priceThreshold: 750000, // Giá cao -> cần đủ thời gian
    needsSpecialCondition: true,
  },

  // Công viên, điểm tham quan
  // Công viên, điểm tham quan
  attraction: {
    operatingHours: { start: 7, end: 20 }, // 7h sáng - 8h tối
    bestTimes: ["morning", "afternoon"], // Sáng, chiều
    minVisitDuration: 60, // Tối thiểu 1h
    category: "attraction",
    needsSpecialCondition: false,
  },

  // Thiên nhiên, khám phá
  nature: {
    operatingHours: { start: 6, end: 18 }, // 6h sáng - 6h chiều (ban ngày)
    bestTimes: ["morning", "afternoon"],
    minVisitDuration: 120, // 2h khám phá
    category: "attraction",
    needsSpecialCondition: false,
  },

  // Công viên giải trí (Asia Park, Mikazuki...)
  "theme-park": {
    operatingHours: { start: 15, end: 22 }, // Thường mở chiều tối
    bestTimes: ["afternoon", "evening", "night"],
    minVisitDuration: 180, // 3h vui chơi
    category: "theme-park",
    needsSpecialCondition: false,
  },

  // Cầu Rồng, điểm check-in
  "night-attraction": {
    operatingHours: { start: 18, end: 24 }, // 6h tối - nửa đêm
    bestTimes: ["evening", "night"], // Tối, khuya (đẹp nhất lúc 9-10h tối khi vui chơi)
    minVisitDuration: 45, // 45 phút chụp hình
    category: "attraction",
    needsSpecialCondition: false,
  },

  // Quán ăn bình dân
  "restaurant-cheap": {
    operatingHours: { start: 6, end: 22 }, // 6h sáng - 10h tối
    bestTimes: ["breakfast", "lunch", "dinner"], // 3 bữa chính
    minVisitDuration: 20, // 20 phút ăn nhanh (theo yêu cầu user)
    category: "food",
    validMealTimes: {
      breakfast: { start: 6, end: 10 }, // 6h - 10h
      lunch: { start: 11, end: 14 }, // 11h - 2h chiều
      dinner: { start: 17, end: 22 }, // 5h - 10h tối
    },
    needsSpecialCondition: false,
  },

  // Nhà hàng trung bình
  "restaurant-moderate": {
    operatingHours: { start: 10, end: 23 }, // 10h sáng - 11h tối
    bestTimes: ["lunch", "dinner"],
    minVisitDuration: 45, // 45 phút ăn
    category: "food",
    validMealTimes: {
      lunch: { start: 11, end: 14 },
      dinner: { start: 18, end: 23 },
    },
    needsSpecialCondition: false,
  },

  // Quán bar, nhậu, karaoke
  "bar-nightlife": {
    operatingHours: { start: 18, end: 4 }, // 6h tối - 4h sáng
    bestTimes: ["evening", "night"], // Tối, khuya
    minVisitDuration: 120, // Tối thiểu 2h để "trải nghiệm" được
    category: "nightlife",
    validTimeSlot: { start: 18, end: 2 }, // 6h tối - 2h sáng
    needsSpecialCondition: true, // Chỉ vào tối
  },

  // Chợ, chợ đêm
  market: {
    operatingHours: { start: 6, end: 23 }, // 6h sáng - 11h tối
    bestTimes: ["morning", "afternoon", "evening"], // Sáng, chiều, tối
    minVisitDuration: 60, // 1h mua sắm
    category: "shopping",
    needsSpecialCondition: false,
  },

  // Bảo tàng, di tích
  "museum-culture": {
    operatingHours: { start: 8, end: 17 }, // 8h sáng - 5h chiều
    bestTimes: ["morning", "afternoon"], // Sáng, chiều (đóng tối)
    minVisitDuration: 60, // 1h tham quan
    category: "culture",
    needsSpecialCondition: false,
  },

  // Cafe, dessert
  "cafe-snack": {
    operatingHours: { start: 7, end: 22 }, // 7h sáng - 10h tối
    bestTimes: ["morning", "afternoon", "evening"],
    minVisitDuration: 30, // 30 phút uống cafe
    category: "food",
    needsSpecialCondition: false,
  },

  // Khách sạn, lưu trú
  accommodation: {
    operatingHours: { start: 0, end: 24 }, // 24/24
    bestTimes: ["night"],
    minVisitDuration: 480, // 8h ngủ
    category: "accommodation",
    needsSpecialCondition: false,
  },
};

// --- 2. PHÂN LOẠI LOCATION VÀO CATEGORIES ---

export const LOCATION_CATEGORY_MAPPING = {
  // Attractions
  beach: "beach",
  attraction: "attraction",
  culture: "attraction",
  history: "attraction",
  nature: "attraction",
  museum: "culture",
  pagoda: "culture",
  temple: "culture",

  // Theme Parks
  "theme-park": "theme-park",
  "ba-na-hills": "theme-park",
  "asia-park": "theme-park",

  // Food & Dining
  restaurant: "food",
  cafe: "food",
  "street-food": "food",
  bar: "nightlife",
  nightclub: "nightlife",
  market: "shopping",

  // Shopping
  shopping: "shopping",
  boutique: "shopping",

  // Accommodation
  hotel: "accommodation",
  homestay: "accommodation",
  resort: "accommodation",
  guesthouse: "accommodation",
};

// --- 3. QUYẾT TẮC LẬP LỊCH ---

export const SCHEDULING_RULES = {
  // Không lặp cùng loại địa điểm liên tiếp
  // VD: Sáng đã đi biển, chiều không được đi biển nữa (ngày hôm sau được)
  maxConsecutiveSameCategory: 0, // 0 = không có lặp

  // Khoảng cách giữa 2 hoạt động cùng category (tính bằng giờ)
  minTimeBetweenSameCategory: 2, // 2h sau có thể đi tiếp cùng category

  // Di chuyển giữa các area
  maxAreaChangesPerDay: 4, // Tối đa 4 lần thay đổi area/ngày (1 sáng, 1 trưa, 1 chiều, 1 tối)

  // Thời gian nghỉ ngơi bắt buộc
  minRestTime: 60, // Tối thiểu 1h nghỉ sau hoạt động nặng (4h+)
  mandatoryRestAfterHours: 240, // Sau 4h tham quan thì cần nghỉ

  // Thời gian về lưu trú
  earlyRestTime: 23.5, // Có thể về muộn tới 23h30
  latestActivityEnd: 20, // Hoạt động cuối cùng phải kết thúc trước 8h tối (để về lưu trú)

  // Tổng thời gian hoạt động/ngày
  maxActivityHours: 14, // Tối đa 14h hoạt động (từ 8h sáng - 10h tối)
  minActivityHours: 4, // Tối thiểu 4h hoạt động (để có trải nghiệm)
};

// --- 4. LOGIC KIỂM TRA GIỜ HOẠT ĐỘNG ---

/**
 * Kiểm tra xem có thể đi địa điểm này vào giờ này không
 * @param {Object} location - Dữ liệu địa điểm
 * @param {number} currentTime - Giờ hiện tại (0-23)
 * @returns {boolean}
 */
export function canVisitAtTime(location, currentTime) {
  // Lấy quy tắc cho loại địa điểm này
  const rule =
    LOCATION_RULES[location.visitType] || LOCATION_RULES["attraction"];

  // Ưu tiên sử dụng giờ hoạt động riêng của địa điểm nếu có
  let startHour = rule.operatingHours.start;
  let endHour = rule.operatingHours.end;

  if (location.openTime && location.closeTime) {
    try {
      const parseHour = (timeStr) => parseInt(timeStr.split(':')[0]);
      startHour = parseHour(location.openTime);
      endHour = parseHour(location.closeTime);
    } catch (e) {
      // Fallback to rule if parsing fails
    }
  }

  // Kiểm tra nằm trong giờ hoạt động không
  // Xử lý trường hợp giờ hoạt động qua nửa đêm (ví dụ: 18h-4h)
  let inOperatingHours;
  if (startHour < endHour) {
    // Giờ hoạt động bình thường (ví dụ: 6h-20h)
    inOperatingHours =
      currentTime >= startHour &&
      currentTime < endHour;
  } else {
    // Giờ hoạt động qua nửa đêm (ví dụ: 18h-4h, start=18, end=4)
    inOperatingHours =
      currentTime >= startHour ||
      currentTime < endHour;
  }

  if (!inOperatingHours) return false;

  // Nếu có validMealTimes (cho nhà hàng), kiểm tra bữa ăn
  if (rule.validMealTimes) {
    const validMeal = Object.values(rule.validMealTimes).some(
      (time) => currentTime >= time.start && currentTime < time.end
    );
    if (!validMeal) return false;
  }

  // Nếu là nightlife, chỉ từ 6h tối trở đi
  if (rule.needsSpecialCondition && location.visitType === "bar-nightlife") {
    if (currentTime < 18) return false; // Không thể vào trước 6h tối
  }

  return true;
}

/**
 * Kiểm tra thời gian này có phải best time không
 * @param {Object} location
 * @param {number} currentTime
 * @returns {boolean}
 */
export function isBestTimeToVisit(location, currentTime) {
  const rule =
    LOCATION_RULES[location.visitType] || LOCATION_RULES["attraction"];
  const hour = Math.floor(currentTime);

  // Mapping giờ -> best time
  const hourToPeriod = {
    6: "morning",
    7: "morning",
    8: "morning",
    9: "morning",
    10: "morning",
    11: "morning",
    12: "lunch",
    13: "lunch",
    14: "afternoon",
    15: "afternoon",
    16: "afternoon",
    17: "afternoon",
    18: "golden-hour",
    19: "evening",
    20: "evening",
    21: "night",
    22: "night",
    23: "night",
  };

  const period = hourToPeriod[hour] || "afternoon";
  return rule.bestTimes && rule.bestTimes.includes(period);
}

/**
 * Kiểm tra có thể đi đủ lâu không để trải nghiệm hợp lý
 * @param {number} availableTime - Thời gian có sẵn (phút)
 * @param {Object} location
 * @returns {boolean}
 */
export function hasEnoughTimeToVisit(availableTime, location) {
  const rule =
    LOCATION_RULES[location.visitType] || LOCATION_RULES["attraction"];
  return availableTime >= rule.minVisitDuration;
}

/**
 * Lấy category của một địa điểm
 * @param {Object} location
 * @returns {string}
 */
export function getLocationCategory(location) {
  // Nếu đã định nghĩa visitType, dùng nó để tìm category
  if (location.visitType) {
    const rule = LOCATION_RULES[location.visitType];
    if (rule) return rule.category;
  }

  // Nếu không, dùng tags + type để suy ra
  const allTags = [...(location.tags || []), location.type];
  for (const tag of allTags) {
    if (LOCATION_CATEGORY_MAPPING[tag]) {
      return LOCATION_CATEGORY_MAPPING[tag];
    }
  }

  return "other";
}

export default {
  LOCATION_RULES,
  LOCATION_CATEGORY_MAPPING,
  SCHEDULING_RULES,
  canVisitAtTime,
  isBestTimeToVisit,
  hasEnoughTimeToVisit,
  getLocationCategory,
};
