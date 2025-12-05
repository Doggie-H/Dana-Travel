/**
 * Các hằng số cấu hình cho ứng dụng.
 * Bao gồm: Ngân sách, Chi phí ước tính, Thời gian, và các tham số mặc định khác.
 */

// --- 1. CẤU HÌNH NGÂN SÁCH (BUDGET) ---

// Tỉ trọng phân bổ ngân sách cho từng hạng mục (Tổng = 100% hoặc xấp xỉ)
export const BUDGET_ALLOCATION = {
  // Lưu trú: Chiếm 10-35% tùy loại hình
  STAY: {
    free: { min: 0, max: 0 }, // Nhà riêng / nhà người quen -> Miễn phí
    guesthouse: { min: 0.1, max: 0.2 }, // Nhà nghỉ (10-20%)
    homestay: { min: 0.2, max: 0.25 }, // Homestay (20-25%)
    hotel: { min: 0.3, max: 0.35 }, // Khách sạn (30-35%)
  },

  // Ăn uống: 30-40% (Tăng lên do giảm lưu trú)
  FOOD: { min: 0.3, max: 0.4 },

  // Di chuyển: 10-20%
  TRANSPORT: { min: 0.1, max: 0.2 },

  // Vé tham quan & Hoạt động vui chơi: 10-25%
  ACTIVITIES: { min: 0.1, max: 0.25 },

  // Quỹ dự phòng (Buffer): 5-10% cho các chi phí phát sinh
  BUFFER: { min: 0.05, max: 0.1 },
};

// Ngưỡng cảnh báo ngân sách (So sánh giữa Dự kiến và Thực tế)
export const BUDGET_THRESHOLDS = {
  OVER_BUDGET: 1.1, // Vượt quá 110% -> Cảnh báo thiếu tiền
  UNDER_BUDGET: 0.85, // Dưới 85% -> Cảnh báo dư nhiều (có thể nâng cấp dịch vụ)
};

// --- 2. CHI PHÍ ƯỚC TÍNH (COST ESTIMATION) ---

// Mức ngân sách tối thiểu để hệ thống chấp nhận (VND/người/ngày)
export const MIN_BUDGET_PER_PERSON_PER_DAY = 300000;

// Chi phí di chuyển (VND)
// Chi phí di chuyển (VND)
export const TRANSPORT_COSTS = {
  // --- BIKE (1 khách) ---
  "grab-bike": {
    base: 12500, // 2km đầu
    perKm: 4300,
    capacity: 1,
    speed: 30,
    label: "GrabBike"
  },
  "xanh-bike": {
    base: 13500, // 2km đầu
    perKm: 4500, // Xanh SM thường cao hơn xíu nhưng dịch vụ tốt
    capacity: 1,
    speed: 30,
    label: "XanhSM Bike"
  },

  // --- CAR 4 SEATS (1-4 khách) ---
  "grab-car-4": {
    base: 29000, // 2km đầu
    perKm: 10000,
    capacity: 4,
    speed: 40,
    label: "GrabCar 4 chỗ"
  },
  "xanh-car-4": {
    base: 20000, // 1km đầu (Rẻ mở cửa hơn)
    perKm: 12500, // KM sau cao hơn
    capacity: 4,
    speed: 40,
    label: "XanhSM Taxi 4 chỗ"
  },

  // --- CAR 7 SEATS (5-7 khách) ---
  "grab-car-7": {
    base: 34000, // 2km đầu
    perKm: 13000,
    capacity: 7,
    speed: 35,
    label: "GrabCar 7 chỗ"
  },
  "xanh-car-7": {
    base: 50000, // 1km đầu (Luxury branding)
    perKm: 20000, // Xanh Luxury đắt hơn
    capacity: 7,
    speed: 35,
    label: "XanhSM Luxury 7 chỗ"
  },

  // --- OWN VEHICLE ---
  own: {
    perKm: 2000, // Xăng
    parking: 5000, 
    capacity: 2,
    speed: 35,
    label: "Xe máy cá nhân"
  },
};

// Giá phòng trung bình/đêm (VND) - Tính cho phòng 2 người
export const ACCOMMODATION_COSTS = {
  free: 0,
  guesthouse: 250000, // Nhà nghỉ bình dân
  homestay: 450000, // Homestay đẹp
  hotel: 800000, // Khách sạn 3-4 sao
};

// Chi phí ăn uống ước tính theo mức độ chi tiêu
// Điều chỉnh: Giảm giá cho phù hợp với thực tế Đà Nẵng
export const MEAL_DEFAULTS = {
  mealsPerDay: 3, // Sáng, Trưa, Tối
  priceRanges: {
    cheap: { min: 25000, max: 50000 }, // Bình dân (Cơm tấm, Bún bò vỉa hè, Bánh mì)
    moderate: { min: 60000, max: 120000 }, // Trung bình (Nhà hàng tầm trung, Quán cơm niêu)
    expensive: { min: 150000, max: 300000 }, // Cao cấp (Nhà hàng sang trọng, Hải sản)
  },
};

// --- 3. THỜI GIAN & LỊCH TRÌNH (SCHEDULING) ---

// Các khung giờ trong ngày
export const TIME_SLOTS = {
  morning: { start: "08:00", end: "11:30", label: "Sáng" },
  noon: { start: "11:30", end: "14:00", label: "Trưa" }, // Bao gồm ăn trưa và nghỉ ngơi
  afternoon: { start: "14:00", end: "18:00", label: "Chiều" },
  evening: { start: "18:00", end: "21:00", label: "Tối" }, // Ăn tối và vui chơi đêm
};

// Thời gian tham quan trung bình tại mỗi loại địa điểm (phút)
export const ACTIVITY_DURATIONS = {
  attraction: 120, // Điểm tham quan: 2 tiếng
  restaurant: 90, // Ăn uống: 1.5 tiếng
  hotel: 0, // Check-in/out không tính vào thời gian hoạt động chính
  beach: 150, // Tắm biển: 2.5 tiếng
  "theme-park": 240, // Công viên chủ đề (Bà Nà, Asia Park): 4 tiếng
};

export default {
  BUDGET_ALLOCATION,
  BUDGET_THRESHOLDS,
  TRANSPORT_COSTS,
  MEAL_DEFAULTS,
  TIME_SLOTS,
  ACTIVITY_DURATIONS,
  MIN_BUDGET_PER_PERSON_PER_DAY,
};
