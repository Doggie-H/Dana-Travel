/**
 * APP CONSTANTS
 * 
 * File chứa toàn bộ các hằng số cấu hình cho ứng dụng.
 * Việc tập trung các giá trị này vào một nơi giúp dễ dàng điều chỉnh logic kinh doanh (Business Logic)
 * mà không cần can thiệp sâu vào code xử lý.
 * 
 * Bao gồm:
 * 1. Tỉ lệ phân bổ ngân sách (Budget Allocation).
 * 2. Ngưỡng cảnh báo ngân sách.
 * 3. Chi phí ước tính (Di chuyển, Lưu trú, Ăn uống).
 * 4. Khung giờ hoạt động và thời gian tham quan.
 */

// --- 1. CẤU HÌNH NGÂN SÁCH (BUDGET) ---

// Tỉ trọng phân bổ ngân sách cho từng hạng mục (Tổng = 100% hoặc xấp xỉ)
export const BUDGET_ALLOCATION = {
  // Lưu trú: Chiếm 20-60% tùy loại hình
  STAY: {
    free: { min: 0, max: 0 }, // Nhà riêng / nhà người quen -> Miễn phí
    hotel: { min: 0.35, max: 0.45 }, // Khách sạn tiêu chuẩn
    guesthouse: { min: 0.25, max: 0.35 }, // Nhà nghỉ tiết kiệm
    homestay: { min: 0.2, max: 0.3 }, // Homestay trải nghiệm
    resort: { min: 0.5, max: 0.6 }, // Nghỉ dưỡng cao cấp
  },

  // Ăn uống: 25-35% (Văn hóa ẩm thực là phần quan trọng)
  FOOD: { min: 0.25, max: 0.35 },

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

// Chi phí di chuyển (VND)
export const TRANSPORT_COSTS = {
  // Xe máy cá nhân (Phượt thủ)
  own: {
    perKm: 3000, // Tiền xăng hao mòn
    parking: 5000, // Phí gửi xe
    capacity: 2, // Số người tối đa
  },
  // Thuê xe máy
  "rental-bike": {
    perDay: 120000, // Giá thuê trung bình/ngày
    perKm: 3000, // Xăng
    parking: 5000,
    capacity: 2,
  },
  // Thuê ô tô tự lái
  "rental-car": {
    perDay: 800000, // Giá thuê trung bình (4 chỗ)
    perKm: 5000, // Xăng
    parking: 20000, // Phí đỗ xe cao hơn
    capacity: 4,
  },
  // GrabBike / XanhSM Bike (Xe ôm công nghệ)
  "grab-bike": {
    base: 12000, // Cước phí mở cửa (2km đầu)
    perKm: 4500, // Giá cước/km tiếp theo
    capacity: 1,
    speed: 30, // Tốc độ trung bình (km/h)
  },
  // GrabCar / XanhSM Car / Taxi (Taxi công nghệ)
  "grab-car": {
    base: 25000, // Cước phí mở cửa
    perKm: 12000, // Giá cước/km
    capacity: 4,
    speed: 40, // Tốc độ trung bình (km/h)
  },
  // Taxi Truyền thống (Phương án dự phòng)
  taxi: {
    base: 20000,
    perKm: 15000, // Thường đắt hơn công nghệ một chút
    capacity: 4,
    speed: 40,
  },
  // Xe buýt công cộng (Tiết kiệm nhất)
  public: {
    base: 7000, // Vé lượt đồng giá
    perKm: 0,
    capacity: 50,
    speed: 20, // Di chuyển chậm do dừng đỗ
  },
};

// Giá phòng trung bình/đêm (VND) - Tính cho phòng 2 người
export const ACCOMMODATION_COSTS = {
  free: 0,
  homestay: 400000, // Homestay đẹp, tiện nghi
  guesthouse: 300000, // Nhà nghỉ bình dân
  hotel: 800000, // Khách sạn 3-4 sao
  resort: 3500000, // Resort 5 sao ven biển
};

// Chi phí ăn uống ước tính theo mức độ chi tiêu
export const MEAL_DEFAULTS = {
  mealsPerDay: 3, // Sáng, Trưa, Tối
  priceRanges: {
    cheap: { min: 30000, max: 60000 }, // Bình dân (Cơm tấm, Bún bò vỉa hè)
    moderate: { min: 80000, max: 150000 }, // Trung bình (Nhà hàng tầm trung)
    expensive: { min: 200000, max: 400000 }, // Cao cấp (Nhà hàng sang trọng, Hải sản)
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
  restaurant: 90,  // Ăn uống: 1.5 tiếng
  hotel: 0,        // Check-in/out không tính vào thời gian hoạt động chính
  beach: 150,      // Tắm biển: 2.5 tiếng
  "theme-park": 240, // Công viên chủ đề (Bà Nà, Asia Park): 4 tiếng
};

export default {
  BUDGET_ALLOCATION,
  BUDGET_THRESHOLDS,
  TRANSPORT_COSTS,
  MEAL_DEFAULTS,
  TIME_SLOTS,
  ACTIVITY_DURATIONS,
};
