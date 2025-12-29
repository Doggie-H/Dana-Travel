/**
 * Service tính toán và phân bổ ngân sách du lịch.
 * Xử lý logic phân bổ chi phí cho lưu trú, ăn uống, di chuyển và hoạt động.
 */

import {
  BUDGET_ALLOCATION,
  BUDGET_THRESHOLDS,
  ACCOMMODATION_COSTS,
  MEAL_DEFAULTS,
  TRANSPORT_COSTS,
} from "../config/app.constants.js";
import { roundToStep } from "../utils/format.utils.js";

/**
 * Tính toán phân bổ ngân sách dự kiến.
 * Dựa trên các hằng số cấu hình (BUDGET_ALLOCATION) để chia ngân sách thành các phần hợp lý.
 * 
 * @param {Object} params - Tham số đầu vào.
 * @param {number} params.budgetTotal - Tổng ngân sách.
 * @param {number} params.numPeople - Số người.
 * @param {number} params.numDays - Số ngày.
 * @param {string} params.accommodation - Loại chỗ ở.
 * @param {string} params.transport - Phương tiện di chuyển.
 * @returns {Object} - Đối tượng chứa chi phí phân bổ cho từng hạng mục (stay, food, transport...).
 */
export function calculateBudgetBreakdown({
  budgetTotal,
  numPeople,
  numDays,
  accommodation,
  transport,
}) {
  // 1. Xác định tỉ trọng cho lưu trú (Accommodation)
  // Tùy thuộc vào loại hình (hotel, homestay, resort...) mà tỉ trọng sẽ khác nhau.
  const stayAlloc =
    BUDGET_ALLOCATION.STAY[accommodation] || BUDGET_ALLOCATION.STAY["hotel"];

  // 2. Lấy giá trị trung bình của các tỉ trọng (min-max)
  // Việc này giúp tạo ra một con số ước lượng cân bằng.
  const stayPercent = (stayAlloc.min + stayAlloc.max) / 2;
  const foodPercent =
    (BUDGET_ALLOCATION.FOOD.min + BUDGET_ALLOCATION.FOOD.max) / 2;
  const transportPercent =
    (BUDGET_ALLOCATION.TRANSPORT.min + BUDGET_ALLOCATION.TRANSPORT.max) / 2;
  const activitiesPercent =
    (BUDGET_ALLOCATION.ACTIVITIES.min + BUDGET_ALLOCATION.ACTIVITIES.max) / 2;
  const bufferPercent =
    (BUDGET_ALLOCATION.BUFFER.min + BUDGET_ALLOCATION.BUFFER.max) / 2;

  // 3. Chuẩn hóa tỉ lệ (Normalize) để tổng luôn bằng 100%
  const totalPercent =
    stayPercent +
    foodPercent +
    transportPercent +
    activitiesPercent +
    bufferPercent;
  const normalize = 1 / totalPercent;

  // 4. Tính toán số tiền cụ thể cho từng hạng mục
  const breakdown = {
    stay: roundToStep(budgetTotal * stayPercent * normalize),
    food: roundToStep(budgetTotal * foodPercent * normalize),
    transport: roundToStep(budgetTotal * transportPercent * normalize),
    activities: roundToStep(budgetTotal * activitiesPercent * normalize),
    buffer: roundToStep(budgetTotal * bufferPercent * normalize),
  };

  // Tính tổng lại để đảm bảo khớp
  breakdown.total = Object.values(breakdown).reduce((sum, val) => sum + val, 0);

  return breakdown;
}

/**
 * Ước tính chi phí lưu trú (Accommodation Cost).
 * 
 * @param {string} accommodation - Loại chỗ ở (hotel, homestay...).
 * @param {number} numPeople - Số người.
 * @param {number} numDays - Số ngày đi.
 * @returns {number} - Tổng chi phí lưu trú ước tính.
 */
export function estimateAccommodationCost(accommodation, numPeople, numDays) {
  // Số đêm = Số ngày - 1 (nhưng không được âm)
  const numNights = Math.max(numDays - 1, 0);
  
  // Nếu ở miễn phí hoặc đi trong ngày (0 đêm) -> Chi phí = 0
  if (accommodation === "free" || numNights === 0) return 0;

  // Lấy đơn giá phòng theo loại hình
  const pricePerNight = ACCOMMODATION_COSTS[accommodation] || ACCOMMODATION_COSTS["hotel"];
  
  // Tính số phòng cần thiết (Giả định 2 người/phòng)
  const roomsNeeded = Math.ceil(numPeople / 2);

  return pricePerNight * roomsNeeded * numNights;
}

/**
 * Ước tính chi phí ăn uống (Food Cost).
 * 
 * @param {number} numPeople - Số người.
 * @param {number} numDays - Số ngày.
 * @param {string} foodPreference - Mức độ ăn uống ('cheap', 'moderate', 'expensive').
 * @returns {number} - Tổng chi phí ăn uống ước tính.
 */
export function estimateFoodCost(
  numPeople,
  numDays,
  foodPreference = "moderate"
) {
  // Lấy khoảng giá theo sở thích
  const priceRange =
    MEAL_DEFAULTS.priceRanges[foodPreference] ||
    MEAL_DEFAULTS.priceRanges.moderate;

  // Tính giá trung bình mỗi bữa
  const avgMealCost = (priceRange.min + priceRange.max) / 2;
  
  // Tổng số bữa ăn = Số người * Số ngày * Số bữa/ngày
  const totalMeals = numPeople * numDays * MEAL_DEFAULTS.mealsPerDay;

  return roundToStep(totalMeals * avgMealCost);
}

/**
 * Ước tính chi phí di chuyển (Transport Cost).
 * 
 * @param {string} transport - Loại phương tiện ('own', 'rent', 'taxi'...).
 * @param {number} numDays - Số ngày.
 * @param {number} numPeople - Số người.
 * @param {number} estimatedKm - Số km ước tính di chuyển mỗi ngày (mặc định 50km).
 * @returns {number} - Tổng chi phí di chuyển ước tính.
 */
export function estimateTransportCost(transport, numDays, numPeople, estimatedKm = 50) {
  // Chuẩn hóa key cho thuê xe
  const transportKey = transport === "rent" ? "rental-bike" : transport;
  const costs = TRANSPORT_COSTS[transportKey] || TRANSPORT_COSTS["taxi"];
  const capacity = costs.capacity || 2;
  
  // Tính số lượng xe cần thiết
  const vehiclesNeeded = Math.ceil(numPeople / capacity);

  // Trường hợp 1: Thuê xe (Xe máy/Ô tô tự lái)
  if (transportKey.includes("rental")) {
    // Chi phí = (Tiền thuê * Số ngày) + (Tiền xăng) + (Gửi xe)
    const rentalCost = (costs.perDay * numDays) * vehiclesNeeded;
    const fuelCost = (estimatedKm * numDays * costs.perKm) * vehiclesNeeded;
    const parkingCost = (costs.parking * numDays) * vehiclesNeeded;
    return roundToStep(rentalCost + fuelCost + parkingCost);
  }

  // Trường hợp 2: Xe cá nhân (Own Vehicle)
  if (transport === "own") {
    // Chi phí = (Tiền xăng) + (Gửi xe)
    const fuelCost = (estimatedKm * numDays * costs.perKm) * vehiclesNeeded;
    const parkingCost = (costs.parking * numDays) * vehiclesNeeded;
    return roundToStep(fuelCost + parkingCost);
  }

  // Trường hợp 3: Phương tiện công cộng (Bus)
  if (transport === "public") {
    // Chi phí = Giá vé * Số lượt * Số người
    const tripsPerDay = 6; // Ước tính 6 chuyến/ngày
    const totalTrips = tripsPerDay * numDays;
    const totalCost = costs.base * totalTrips * numPeople; 
    return roundToStep(totalCost);
  }

  // Trường hợp 4: Taxi / Grab (Mặc định)
  // Chi phí = (Giá mở cửa + Giá theo km) * Số chuyến * Số xe
  const tripsPerDay = 4; // Ước tính 4 chuyến/ngày
  const totalTrips = tripsPerDay * numDays;
  const kmPerTrip = estimatedKm / tripsPerDay;
  
  const costPerTrip = costs.base + (kmPerTrip * costs.perKm);
  const totalCost = costPerTrip * totalTrips * vehiclesNeeded;

  return roundToStep(totalCost);
}

/**
 * Tạo các lời khuyên (Tips) dựa trên tình trạng ngân sách.
 * 
 * @param {number} variance - Tỷ lệ chênh lệch ngân sách ( > 1 là vượt ngân sách).
 * @param {Object} breakdown - Chi tiết phân bổ (chưa dùng trong logic hiện tại nhưng giữ để mở rộng).
 * @returns {string[]} - Danh sách các lời khuyên.
 */
export function generateBudgetTips(variance, breakdown) {
  const tips = [];

  // Kiểm tra nếu vượt ngân sách (Over Budget)
  if (variance > BUDGET_THRESHOLDS.OVER_BUDGET) {
    tips.push(
      "Ngân sách ước tính VƯỢT mức dự kiến. Cân nhắc giảm chi phí lưu trú hoặc ăn uống."
    );
    tips.push("Chọn homestay/guesthouse thay vì hotel để tiết kiệm.");
  } 
  // Kiểm tra nếu dư ngân sách (Under Budget)
  else if (variance < BUDGET_THRESHOLDS.UNDER_BUDGET) {
    tips.push(
      "Ngân sách dư nhiều! Bạn có thể nâng cấp accommodation hoặc thêm hoạt động."
    );
    tips.push("Cân nhắc trải nghiệm nhà hàng cao cấp hoặc tour thêm.");
  } 
  // Ngân sách hợp lý
  else {
    tips.push("Ngân sách hợp lý, phân bổ cân đối.");
  }

  // Thêm các tips chung hữu ích
  tips.push("Thử món ăn địa phương để tiết kiệm và trải nghiệm văn hóa.");
  tips.push("Nhiều bãi biển & điểm tham quan miễn phí ở Đà Nẵng.");

  return tips;
}

/**
 * Tổng hợp và xác nhận ngân sách cuối cùng từ lịch trình chi tiết.
 * Hàm này chạy sau khi lịch trình đã được tạo xong để tính toán con số thực tế.
 * 
 * @param {Object} itinerary - Lịch trình đã tạo (chứa danh sách ngày và hoạt động).
 * @param {number} budgetTotal - Ngân sách ban đầu của người dùng.
 * @param {number} numPeople - Số người.
 * @returns {Object} - Đối tượng tổng hợp (Tổng chi phí, chênh lệch, tips...).
 */
export function summarizeBudget(itinerary, budgetTotal, numPeople) {
  // Tính tổng chi phí thực tế bằng cách cộng dồn từng item trong lịch trình
  let totalCost = 0;

  itinerary.days.forEach((day) => {
    day.items.forEach((item) => {
      totalCost += item.cost?.ticket || 0;
      totalCost += item.cost?.food || 0;
      totalCost += item.cost?.other || 0;
      totalCost += item.transport?.cost || 0;
    });
  });

  // Tính toán các chỉ số tài chính
  const variance = totalCost / budgetTotal; // Tỷ lệ chênh lệch
  const perPerson = Math.round(totalCost / numPeople); // Chi phí bình quân đầu người
  const tips = generateBudgetTips(variance, {}); // Tạo lời khuyên

  return {
    estimatedTotal: totalCost,
    budgetTotal,
    perPerson,
    variance,
    variancePercent: Math.round((variance - 1) * 100), // % chênh lệch (VD: +10%, -5%)
    tips,
  };
}

export default {
  calculateBudgetBreakdown,
  estimateAccommodationCost,
  estimateFoodCost,
  estimateTransportCost,
  generateBudgetTips,
  summarizeBudget,
};
