// file: backend/services/budgetService.js

/**
 * Budget Service - tính toán phân bổ & ước tính chi phí
 *
 * Vai trò: business logic thuần cho budget allocation
 * Input: UserRequest (budgetTotal, numPeople, accommodation, numDays...)
 * Output: budget breakdown object {stay, food, transport, activities, buffer}
 *
 * Thuật toán:
 * - Dựa vào BUDGET_ALLOCATION constants để phân bổ theo %
 * - Tính chi phí cho từng category dựa vào số người & số ngày
 * @param {number} params.budgetTotal - tổng ngân sách
 * @param {number} params.numPeople - số người
 * @param {number} params.numDays - số ngày
 * @param {string} params.accommodation - loại chỗ ở
 * @param {string} params.transport - phương tiện
 * @returns {Object} - {stay, food, transport, activities, buffer, total}
 */

import {
  BUDGET_ALLOCATION,
  BUDGET_THRESHOLDS,
  ACCOMMODATION_COSTS,
  MEAL_DEFAULTS,
  TRANSPORT_COSTS,
} from "../config/app.constants.js";
import { roundToStep } from "../utils/format.utils.js";

export function calculateBudgetBreakdown({
  budgetTotal,
  numPeople,
  numDays,
  accommodation,
  transport,
}) {
  // Lấy tỉ trọng accommodation
  const stayAlloc =
    BUDGET_ALLOCATION.STAY[accommodation] || BUDGET_ALLOCATION.STAY["hotel"];

  // Random trong khoảng min-max để tạo variance tự nhiên
  const stayPercent = (stayAlloc.min + stayAlloc.max) / 2;
  const foodPercent =
    (BUDGET_ALLOCATION.FOOD.min + BUDGET_ALLOCATION.FOOD.max) / 2;
  const transportPercent =
    (BUDGET_ALLOCATION.TRANSPORT.min + BUDGET_ALLOCATION.TRANSPORT.max) / 2;
  const activitiesPercent =
    (BUDGET_ALLOCATION.ACTIVITIES.min + BUDGET_ALLOCATION.ACTIVITIES.max) / 2;
  const bufferPercent =
    (BUDGET_ALLOCATION.BUFFER.min + BUDGET_ALLOCATION.BUFFER.max) / 2;

  // Normalize để tổng = 100%
  const totalPercent =
    stayPercent +
    foodPercent +
    transportPercent +
    activitiesPercent +
    bufferPercent;
  const normalize = 1 / totalPercent;

  const breakdown = {
    stay: roundToStep(budgetTotal * stayPercent * normalize),
    food: roundToStep(budgetTotal * foodPercent * normalize),
    transport: roundToStep(budgetTotal * transportPercent * normalize),
    activities: roundToStep(budgetTotal * activitiesPercent * normalize),
    buffer: roundToStep(budgetTotal * bufferPercent * normalize),
  };

  breakdown.total = Object.values(breakdown).reduce((sum, val) => sum + val, 0);

  return breakdown;
}

/**
 * Ước tính chi phí accommodation
 * @param {string} accommodation - loại chỗ ở
 * @param {number} numPeople - số người
 * @param {number} numDays - số ngày (số đêm = numDays - 1)
 * @returns {number} - tổng chi phí lưu trú
 */
export function estimateAccommodationCost(accommodation, numPeople, numDays) {
  const numNights = Math.max(numDays - 1, 0);
  
  if (accommodation === "free" || numNights === 0) return 0;

  const pricePerNight = ACCOMMODATION_COSTS[accommodation] || ACCOMMODATION_COSTS["hotel"];
  
  // Tính số phòng cần thiết (giả sử 2 người/phòng)
  const roomsNeeded = Math.ceil(numPeople / 2);

  return pricePerNight * roomsNeeded * numNights;
}

/**
 * Ước tính chi phí ăn uống
 * @param {number} numPeople
 * @param {number} numDays
 * @param {string} foodPreference - 'cheap' | 'moderate' | 'expensive'
 * @returns {number}
 */
export function estimateFoodCost(
  numPeople,
  numDays,
  foodPreference = "moderate"
) {
  const priceRange =
    MEAL_DEFAULTS.priceRanges[foodPreference] ||
    MEAL_DEFAULTS.priceRanges.moderate;

  // Random trong khoảng để tạo variance
  const avgMealCost = (priceRange.min + priceRange.max) / 2;
  const totalMeals = numPeople * numDays * MEAL_DEFAULTS.mealsPerDay;

  return roundToStep(totalMeals * avgMealCost);
}

/**
 * Ước tính chi phí di chuyển
 * @param {string} transport - 'own' | 'rent' | 'ride-hailing'
 * @param {number} numDays
 * @param {number} estimatedKm - ước tính km/ngày (default: 50km)
 * @returns {number}
 */
export function estimateTransportCost(transport, numDays, numPeople, estimatedKm = 50) {
  // Map 'rent' to 'rental-bike' as default rental option
  const transportKey = transport === "rent" ? "rental-bike" : transport;
  const costs = TRANSPORT_COSTS[transportKey] || TRANSPORT_COSTS["taxi"];
  const capacity = costs.capacity || 2;
  
  // Số lượng xe cần thiết
  const vehiclesNeeded = Math.ceil(numPeople / capacity);

  if (transportKey.includes("rental")) {
    // Thuê xe: Tính theo ngày + xăng
    const rentalCost = (costs.perDay * numDays) * vehiclesNeeded;
    const fuelCost = (estimatedKm * numDays * costs.perKm) * vehiclesNeeded;
    const parkingCost = (costs.parking * numDays) * vehiclesNeeded;
    return roundToStep(rentalCost + fuelCost + parkingCost);
  }

  if (transport === "own") {
    // Xe cá nhân: Chỉ tính xăng + gửi xe
    const fuelCost = (estimatedKm * numDays * costs.perKm) * vehiclesNeeded;
    const parkingCost = (costs.parking * numDays) * vehiclesNeeded;
    return roundToStep(fuelCost + parkingCost);
  }

  if (transport === "public") {
    // Xe buýt: Tính theo lượt (ước tính 6 lượt/ngày)
    const tripsPerDay = 6;
    const totalTrips = tripsPerDay * numDays;
    const totalCost = costs.base * totalTrips * numPeople; // Vé tính theo người
    return roundToStep(totalCost);
  }

  // Taxi / Grab: Tính theo km + phí mở cửa
  // Ước tính 4 chuyến/ngày
  const tripsPerDay = 4;
  const totalTrips = tripsPerDay * numDays;
  const kmPerTrip = estimatedKm / tripsPerDay;
  
  const costPerTrip = costs.base + (kmPerTrip * costs.perKm);
  const totalCost = costPerTrip * totalTrips * vehiclesNeeded;

  return roundToStep(totalCost);
}

/**
 * Generate tips dựa trên budget variance
 * @param {number} variance - % chênh lệch (âm = dư, dương = thiếu)
 * @param {Object} breakdown - budget breakdown
 * @returns {string[]} - array tips
 */
export function generateBudgetTips(variance, breakdown) {
  const tips = [];

  if (variance > BUDGET_THRESHOLDS.OVER_BUDGET) {
    tips.push(
      "💰 Ngân sách ước tính VỀT mức dự kiến. Cân nhắc giảm chi phí lưu trú hoặc ăn uống."
    );
    tips.push("Chọn homestay/guesthouse thay vì hotel để tiết kiệm.");
  } else if (variance < BUDGET_THRESHOLDS.UNDER_BUDGET) {
    tips.push(
      "✨ Ngân sách dư nhiều! Bạn có thể nâng cấp accommodation hoặc thêm hoạt động."
    );
    tips.push("Cân nhắc trải nghiệm nhà hàng cao cấp hoặc tour thêm.");
  } else {
    tips.push("✅ Ngân sách hợp lý, phân bổ cân đối.");
  }

  // Tips chung
  tips.push("🍜 Thử món ăn địa phương để tiết kiệm và trải nghiệm văn hóa.");
  tips.push("🏖️ Nhiều bãi biển & điểm tham quan miễn phí ở Đà Nẵng.");

  return tips;
}

/**
 * Validate & summarize budget
 * @param {Object} itinerary - lịch trình đã tạo
 * @param {number} budgetTotal - ngân sách ban đầu
 * @param {number} numPeople
 * @returns {Object} - summary object
 */
export function summarizeBudget(itinerary, budgetTotal, numPeople) {
  // Tính tổng chi phí thực từ itinerary
  let totalCost = 0;

  itinerary.days.forEach((day) => {
    day.items.forEach((item) => {
      totalCost += item.cost?.ticket || 0;
      totalCost += item.cost?.food || 0;
      totalCost += item.cost?.other || 0;
      totalCost += item.transport?.cost || 0;
    });
  });

  const variance = totalCost / budgetTotal;
  const perPerson = Math.round(totalCost / numPeople);
  const tips = generateBudgetTips(variance, {});

  return {
    estimatedTotal: totalCost,
    budgetTotal,
    perPerson,
    variance,
    variancePercent: Math.round((variance - 1) * 100),
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
