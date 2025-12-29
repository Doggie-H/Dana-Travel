/**
 * ITINERARY VALIDATOR & OPTIMIZER
 *
 * Kiểm soát logic lập lịch:
 * 1. Không lặp cùng category liên tiếp
 * 2. Kiểm tra giờ hoạt động
 * 3. Kiểm tra thời gian tối thiểu
 * 4. Validate ngân sách vs. chi phí thực tế
 * 5. Tối ưu clustering (minimize area changes)
 */

import {
  LOCATION_RULES,
  SCHEDULING_RULES,
  canVisitAtTime,
  isBestTimeToVisit,
  hasEnoughTimeToVisit,
  getLocationCategory,
} from "../config/scheduling.constants.js";

/**
 * Validate xem có thể chọn địa điểm này vào thời điểm này không
 *
 * @param {Object} location - Dữ liệu địa điểm
 * @param {number} currentTime - Giờ hiện tại (0-23)
 * @param {number} availableMinutes - Thời gian có sẵn (phút)
 * @param {string[]} visitedCategories - Các category đã đi trong ngày
 * @param {Map} lastVisitTime - Thời gian lần cuối đi mỗi category
 * @returns {Object} { valid, reason }
 */
export function validateLocationSelection(
  location,
  currentTime,
  availableMinutes,
  visitedCategories = [],
  lastVisitTime = new Map()
) {
  // 1. Kiểm tra giờ hoạt động
  if (!canVisitAtTime(location, currentTime)) {
    return {
      valid: false,
      reason: `Địa điểm đã đóng cửa lúc ${currentTime}h. Giờ hoạt động: ${location.operatingHours?.start || "?"
        }-${location.operatingHours?.end || "?"}`,
    };
  }

  // 2. Kiểm tra thời gian tối thiểu để trải nghiệm hợp lý
  const rule =
    LOCATION_RULES[location.visitType] || LOCATION_RULES["attraction"];
  if (!hasEnoughTimeToVisit(availableMinutes, location)) {
    return {
      valid: false,
      reason: `Thời gian không đủ. Cần tối thiểu ${rule.minVisitDuration} phút, chỉ có ${availableMinutes} phút`,
    };
  }

  // 3. Kiểm tra không lặp cùng category
  const category = getLocationCategory(location);
  if (visitedCategories.includes(category)) {
    const lastTime = lastVisitTime.get(category);
    const hoursSinceLastVisit = currentTime - lastTime;

    // Nếu đi cùng category trong vòng 12h, không được phép
    if (hoursSinceLastVisit < SCHEDULING_RULES.minTimeBetweenSameCategory) {
      return {
        valid: false,
        reason: `Vừa mới đi ${category} cách đây ${hoursSinceLastVisit}h. Phải đợi tối thiểu ${SCHEDULING_RULES.minTimeBetweenSameCategory}h`,
      };
    }
  }

  // 4. Kiểm tra best time (cảnh báo nhưng vẫn cho phép)
  const isBestTime = isBestTimeToVisit(location, currentTime);
  if (!isBestTime) {
    console.warn(
      `⚠️ Không phải thời gian tối ưu để đi ${location.name
      }. Thời gian tốt: ${rule.bestTimes?.join(", ")}`
    );
  }

  // 5. Kiểm tra special conditions (ví dụ: bar chỉ vào tối)
  if (rule.needsSpecialCondition && location.visitType === "bar-nightlife") {
    if (currentTime < 18) {
      return {
        valid: false,
        reason: `Quán bar chỉ mở từ 6h tối. Giờ hiện tại: ${currentTime}h`,
      };
    }
  }

  return {
    valid: true,
    isBestTime,
    warningPrice: location.ticket && location.ticket > 500000,
  };
}

/**
 * Filter danh sách locations có thể chọn được
 *
 * @param {Array} candidates - Danh sách địa điểm ứng cử
 * @param {number} currentTime - Giờ hiện tại
 * @param {number} availableMinutes - Thời gian có sẵn
 * @param {Array} visitedCategories - Categories đã đi
 * @param {Map} lastVisitTime - Lần cuối đi mỗi category
 * @param {Set} usedLocationIds - IDs đã dùng
 * @returns {Array} Danh sách địa điểm hợp lệ
 */
export function filterValidLocations(
  candidates,
  currentTime,
  availableMinutes,
  visitedCategories,
  lastVisitTime,
  usedLocationIds
) {
  return candidates.filter((location) => {
    // Không dùng lại cùng địa điểm
    if (usedLocationIds.has(location.id)) return false;

    // Validate điều kiện
    const validation = validateLocationSelection(
      location,
      currentTime,
      availableMinutes,
      visitedCategories,
      lastVisitTime
    );

    return validation.valid;
  });
}

/**
 * Kiểm tra ngân sách có hợp lý không trước khi lập lịch
 *
 * @param {number} budgetTotal - Tổng ngân sách
 * @param {number} numPeople - Số người
 * @param {number} numDays - Số ngày
 * @param {number} accommodationCost - Chi phí lưu trú đã tính
 * @param {boolean} hasOwnTransport - Có xe riêng không
 * @returns {Object} { valid, message, remainingBudget, dailyBudget }
 */
export function validateBudgetFeasibility(
  budgetTotal,
  numPeople,
  numDays,
  accommodationCost,
  hasOwnTransport = false
) {
  const remainingBudget = budgetTotal - accommodationCost;
  const dailyBudget = remainingBudget / numDays;
  const perPersonDaily = dailyBudget / numPeople;

  // Minimum để ăn + vé + xăng (Đã giảm để hỗ trợ ngân sách tiết kiệm/sinh viên)
  // - Ăn: 3 bữa/ngày × 30k = 90k/person (Cơm bình dân)
  // - Vé: 30k/person/ngày (Ưu tiên điểm miễn phí)
  // - Xăng: 30k/ngày
  const minRequiredPerPersonDaily = hasOwnTransport
    ? 90000 + 30000 // 120k (Ăn + Vé)
    : 90000 + 30000 + 30000; // 150k (Ăn + Vé + Di chuyển)

  if (perPersonDaily < minRequiredPerPersonDaily) {
    return {
      valid: false,
      message: `Ngân sách ${perPersonDaily.toLocaleString()}đ/person/day không đủ. Tối thiểu cần ${minRequiredPerPersonDaily.toLocaleString()}đ`,
      remainingBudget,
      dailyBudget,
      perPersonDaily,
    };
  }

  // Warning nếu quá ít
  if (perPersonDaily < 300000) {
    console.warn(`⚠️ Ngân sách hạn chế ${perPersonDaily}đ/person/day`);
  }

  return {
    valid: true,
    remainingBudget,
    dailyBudget,
    perPersonDaily,
  };
}

/**
 * Tính toán thời gian cần thiết cho một activity
 * Bao gồm: thời gian tham quan + thời gian di chuyển + thời gian ăn uống nếu có
 *
 * @param {Object} location - Địa điểm
 * @param {number} distanceFromPrevious - Khoảng cách từ địa điểm trước (km)
 * @param {string} transportMode - Phương tiện di chuyển
 * @param {boolean} includeFood - Có ăn uống không
 * @returns {number} Tổng thời gian (phút)
 */
export function calculateTotalActivityTime(
  location,
  distanceFromPrevious = 0,
  transportMode = "own",
  includeFood = false
) {
  const rule =
    LOCATION_RULES[location.visitType] || LOCATION_RULES["attraction"];

  // Thời gian tham quan
  let totalTime = location.suggestedDuration || rule.minVisitDuration;

  // Thời gian di chuyển
  // Giả định: 35 km/h trên đường bộ Đà Nẵng
  const travelTime = (distanceFromPrevious / 35) * 60 + 5; // +5 phút chờ, đỗ xe
  totalTime += travelTime;

  // Thời gian ăn uống (nếu bao gồm)
  if (includeFood && location.type === "restaurant") {
    totalTime += 60; // 1 tiếng ăn
  }

  return Math.round(totalTime);
}

/**
 * Tối ưu lịch trình: sắp xếp locations để tối thiểu thay đổi area
 *
 * @param {Array} selectedLocations - Danh sách locations đã chọn
 * @returns {Array} Danh sách locations sắp xếp theo area clustering
 */
export function optimizeLocationSequence(selectedLocations) {
  if (selectedLocations.length <= 1) return selectedLocations;

  const optimized = [];
  const remaining = [...selectedLocations];

  // Bắt đầu từ location đầu tiên
  optimized.push(remaining.shift());

  // Greedy clustering: chọn location gần nhất theo area
  while (remaining.length > 0) {
    const lastArea = optimized[optimized.length - 1].area;

    // Tìm location ở cùng area
    let sameAreaIndex = remaining.findIndex((l) => l.area === lastArea);

    // Nếu không có, lấy location đầu tiên
    if (sameAreaIndex === -1) {
      sameAreaIndex = 0;
    }

    optimized.push(remaining.splice(sameAreaIndex, 1)[0]);
  }

  return optimized;
}

/**
 * Kiểm tra xem có thể kết thúc ngày tại thời điểm này không
 * Phải đủ thời gian để về lưu trú trước 10h tối
 *
 * @param {number} currentTime - Giờ hiện tại
 * @param {number} distanceToAccommodation - Khoảng cách đến lưu trú (km)
 * @returns {boolean}
 */
export function canEndDayAtTime(currentTime, distanceToAccommodation = 5) {
  const travelTimeHome = (distanceToAccommodation / 35) * 60 + 5;
  const arrivalTime = currentTime + travelTimeHome / 60;

  return arrivalTime <= SCHEDULING_RULES.earlyRestTime;
}

export default {
  validateLocationSelection,
  filterValidLocations,
  validateBudgetFeasibility,
  calculateTotalActivityTime,
  optimizeLocationSequence,
  canEndDayAtTime,
};
