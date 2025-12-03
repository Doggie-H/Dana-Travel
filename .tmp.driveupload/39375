// file: backend/config/constants.js

/**
 * Cấu hình tỉ trọng ngân sách và giá mặc định
 *
 * Vai trò: tập trung các hằng số để dễ điều chỉnh logic budget allocation
 * Không hard-code trong business logic
 */

// Tỉ trọng phân bổ ngân sách (tổng = 100%)
export const BUDGET_ALLOCATION = {
  // Accommodation: 35-45% (0% nếu ở nhà người quen/nhà riêng)
  STAY: {
    free: { min: 0, max: 0 }, // Nhà riêng / nhà người quen - miễn phí
    hotel: { min: 0.35, max: 0.45 },
    guesthouse: { min: 0.25, max: 0.35 },
    homestay: { min: 0.2, max: 0.3 },
    resort: { min: 0.5, max: 0.6 },
  },

  // Food: 25-35%
  FOOD: { min: 0.25, max: 0.35 },

  // Transport: 10-20%
  TRANSPORT: { min: 0.1, max: 0.2 },

  // Activities (tickets, entrance fees): 10-25%
  ACTIVITIES: { min: 0.1, max: 0.25 },

  // Buffer (dự phòng): 5-10%
  BUFFER: { min: 0.05, max: 0.1 },
};

// Cảnh báo ngân sách
export const BUDGET_THRESHOLDS = {
  OVER_BUDGET: 1.1, // >110% = thiếu
  UNDER_BUDGET: 0.85, // <85% = dư nhiều
};

// Giá di chuyển ước tính (VND)
export const TRANSPORT_COSTS = {
  // Xe máy cá nhân (nếu đi phượt)
  own: {
    perKm: 3000, // Xăng xe
    parking: 5000,
    capacity: 2,
  },
  // Thuê xe máy
  "rental-bike": {
    perDay: 120000, // Giá thuê trung bình
    perKm: 3000, // Xăng
    parking: 5000,
    capacity: 2,
  },
  // Thuê ô tô tự lái
  "rental-car": {
    perDay: 800000, // Giá thuê trung bình (4 chỗ)
    perKm: 5000, // Xăng
    parking: 20000,
    capacity: 4,
  },
  // GrabBike / XanhSM Bike
  "grab-bike": {
    base: 12000, // Cước phí mở cửa (2km đầu)
    perKm: 4500, // Giá cước/km (Trung bình)
    capacity: 1,
    speed: 30, // km/h
  },
  // GrabCar / XanhSM Car / Taxi
  "grab-car": {
    base: 25000, // Cước phí mở cửa (2km đầu)
    perKm: 12000, // Giá cước/km (Trung bình)
    capacity: 4,
    speed: 40, // km/h
  },
  // Taxi Truyền thống (Fallback)
  taxi: {
    base: 20000,
    perKm: 15000, // Đắt hơn xíu
    capacity: 4,
    speed: 40,
  },
  // Xe buýt công cộng
  public: {
    base: 7000, // Vé lượt
    perKm: 0, // Đồng giá
    capacity: 50,
    speed: 20, // Chậm hơn
  },
};

// Giá phòng trung bình/đêm (VND) - Tính cho phòng 2 người
export const ACCOMMODATION_COSTS = {
  free: 0,
  homestay: 400000, // Homestay đẹp, tiện nghi
  guesthouse: 300000, // Nhà nghỉ bình dân
  hotel: 800000, // Khách sạn 3-4 sao
  resort: 3500000, // Resort 5 sao
};

// Số bữa ăn/ngày và giá ước tính theo priceLevel
export const MEAL_DEFAULTS = {
  mealsPerDay: 3,
  priceRanges: {
    cheap: { min: 30000, max: 60000 }, // bình dân
    moderate: { min: 80000, max: 150000 }, // trung bình
    expensive: { min: 200000, max: 400000 }, // cao cấp
  },
};

// Time slots trong ngày (4 khung giờ)
export const TIME_SLOTS = {
  morning: { start: "08:00", end: "11:30", label: "Sáng" },
  noon: { start: "11:30", end: "14:00", label: "Trưa" },
  afternoon: { start: "14:00", end: "18:00", label: "Chiều" },
  evening: { start: "18:00", end: "21:00", label: "Tối" },
};

// Thời gian ở mỗi loại địa điểm (phút)
export const ACTIVITY_DURATIONS = {
  attraction: 120, // 2 tiếng
  restaurant: 90,  // 1.5 tiếng
  hotel: 0, 
  beach: 150,      // 2.5 tiếng
  "theme-park": 240, // 4 tiếng
};

export default {
  BUDGET_ALLOCATION,
  BUDGET_THRESHOLDS,
  TRANSPORT_COSTS,
  MEAL_DEFAULTS,
  TIME_SLOTS,
  ACTIVITY_DURATIONS,
};
