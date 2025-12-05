/**
 * Service điều phối việc tạo lịch trình du lịch.
 * Xử lý logic kiểm tra ngân sách, chọn nơi ở, và lập lịch trình chi tiết từng ngày.
 */

import { getAllLocations } from "./location.service.js";
import {
  BUDGET_ALLOCATION,
  TRANSPORT_COSTS,
  ACCOMMODATION_COSTS,
  TIME_SLOTS,
  ACTIVITY_DURATIONS,
  MIN_BUDGET_PER_PERSON_PER_DAY,
} from "../config/app.constants.js";
import {
  LOCATION_RULES,
  SCHEDULING_RULES,
  canVisitAtTime,
  isBestTimeToVisit,
  hasEnoughTimeToVisit,
  getLocationCategory,
} from "../config/scheduling.constants.js";
import {
  formatCurrency,
  formatDate,
  getDaysBetween,
  roundToStep,
} from "../utils/format.utils.js";
import { pickRandom, shuffle } from "../utils/array.utils.js";
import {
  validateLocationSelection,
  filterValidLocations,
  validateBudgetFeasibility,
  calculateTotalActivityTime,
  optimizeLocationSequence,
  canEndDayAtTime,
} from "../utils/itinerary-validator.js";
import {
  calculateDistance,
  calculateTransport,
  formatTime,
} from "../utils/itinerary-helpers.js";
import { generateDayScheduleStrict } from "../utils/generate-day-schedule-strict.js";

/**
 * Tạo lịch trình du lịch dựa trên yêu cầu của người dùng.
 * @param {Object} userRequest
 * @returns {Promise<Object>} Lịch trình chi tiết
 */
export const generateItinerary = async (userRequest) => {
  // Validate & Prepare Data
  const {
    budgetTotal,
    numPeople,
    arriveDateTime,
    leaveDateTime,
    transport, // 'grab-bike', 'taxi', 'rental-bike'...
    accommodation, // 'homestay', 'hotel'...
    preferences = [],
  } = userRequest;

  const startDate = new Date(arriveDateTime);
  const endDate = new Date(leaveDateTime);
  const numDays = getDaysBetween(startDate, endDate) + 1;

  // Validate Budget với strict logic
  const hasOwnTransport = transport === "own" || transport === "rent";
  const budgetCheck = validateBudgetFeasibility(
    budgetTotal,
    numPeople,
    numDays,
    0, // accommodationCost (sẽ tính sau khi chọn hotel)
    hasOwnTransport
  );
  if (!budgetCheck.valid) {
    console.log(" Budget validation failed:", budgetCheck.message);
    throw { statusCode: 400, message: budgetCheck.message };
  }

  // Lấy toàn bộ địa điểm từ DB
  const allLocations = await getAllLocations();

  // Phân loại địa điểm
  const locationsByType = {
    attraction: allLocations.filter((l) =>
      [
        "attraction",
        "culture",
        "history",
        "nature",
        "theme-park",
        "beach",
        "mountain",
      ].includes(l.type)
    ),
    food: allLocations.filter((l) =>
      ["restaurant", "cafe", "street-food"].includes(l.type)
    ),
    hotel: allLocations.filter((l) =>
      ["hotel", "homestay", "resort", "guesthouse"].includes(l.type)
    ),
  };

  // Chọn Khách sạn (Base Location)
  // Ưu tiên khách sạn phù hợp với loại hình và ngân sách
  const selectedHotel = selectAccommodation(
    locationsByType.hotel,
    accommodation,
    budgetTotal / numDays,
    numPeople
  );
  if (!selectedHotel) {
    throw {
      statusCode: 400,
      message: `Không tìm thấy chỗ ở phù hợp cho loại hình ${accommodation}`,
    };
    console.log("❌ No accommodation found for:", accommodation);
    throw error;
  }

  // Xây dựng khung lịch trình
  const itinerary = {
    id: `trip-${Date.now()}`,
    name: `Lịch trình Đà Nẵng ${numDays}N${numDays - 1}Đ`,
    totalCost: 0,
    days: [],
  };

  // Tính chi phí cố định (Khách sạn)
  const accommodationCost = calculateAccommodationCost(
    selectedHotel,
    accommodation,
    numDays,
    numPeople
  );
  itinerary.totalCost += accommodationCost;

  // Ngân sách còn lại cho Ăn uống + Vé + Di chuyển
  let remainingBudget = budgetTotal - accommodationCost;
  const dailyBudget = remainingBudget / numDays;

  // Lập lịch từng ngày
  let usedLocationIds = new Set([selectedHotel.id]); // Tránh trùng lặp
  let currentArea = selectedHotel.area || "Hải Châu"; // Bắt đầu từ khu vực khách sạn

  for (let i = 0; i < numDays; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);

    // Xác định giờ bắt đầu/kết thúc của ngày
    // Ngày đầu: Bắt đầu từ giờ đến
    // Ngày cuối: Kết thúc lúc giờ về
    // Các ngày giữa: 6h - 23h (Tận dụng tối đa thời gian)
    let startTime = 6;
    let endTime = 23;

    if (i === 0) startTime = startDate.getHours();
    if (i === numDays - 1) endTime = endDate.getHours();

    // Tạo danh sách hoạt động trong ngày (sử dụng strict logic)
    const dayItems = await generateDayScheduleStrict({
      date: currentDate,
      startTime,
      endTime,
      allLocations: allLocations,
      usedLocationIds,
      transport,
      numPeople,
      dailyBudget,
      hotel: selectedHotel,
      hotelType: selectedHotel.type,
      isFirstDay: i === 0,
      isLastDay: i === numDays - 1,
      preferences, // THÊM: Truyền preferences để filter địa điểm theo sở thích
      accommodationCost, // THÊM: Tổng chi phí khách sạn để hiển thị lúc check-in
    });

    // Cập nhật chi phí và location đã dùng
    dayItems.items.forEach((item) => {
      if (item.location) usedLocationIds.add(item.location.id);
      
      // Không cộng chi phí khách sạn vào totalCost ở đây vì đã tính gộp ở trên (accommodationCost)
      // Các item khách sạn chỉ mang tính hiển thị
      if (item.type !== 'accommodation' && item.type !== 'check-in') {
        itinerary.totalCost += item.cost?.ticket || 0;
        itinerary.totalCost += item.cost?.food || 0;
        itinerary.totalCost += item.transport?.cost || 0;
      }
    });

    // Cập nhật khu vực hiện tại (để ngày hôm sau tiếp tục hợp lý)
    // Lấy khu vực của điểm cuối cùng trong ngày (trừ về khách sạn)
    const lastActivity = dayItems.items
      .filter(
        (it) => it.type !== "transport" && it.location?.id !== selectedHotel.id
      )
      .pop();
    if (lastActivity && lastActivity.location?.area) {
      currentArea = lastActivity.location.area;
    }

    itinerary.days.push({
      day: i + 1,
      date: formatDate(currentDate),
      items: dayItems.items,
    });
  }

  // Finalize & Format
  const finalItinerary = {
    ...itinerary,
    totalCost: roundToStep(itinerary.totalCost, 1000),
    budgetStatus: getBudgetStatus(itinerary.totalCost, budgetTotal),
  };

  // --- TRACKING: LƯU XU HƯỚNG TÌM KIẾM ---
  try {
    // Chỉ lưu khi tạo lịch trình thành công
    await import("../utils/prisma.js").then(m => m.default.searchTrend.create({
      data: {
        tags: JSON.stringify(preferences),
        duration: `${numDays} ngày`,
        budget: parseFloat(budgetTotal),
        people: parseInt(numPeople)
      }
    }));
  } catch (e) {
    console.error("Lỗi tracking xu hướng:", e);
    // Không throw lỗi để tránh ảnh hưởng trải nghiệm user
  }

  return finalItinerary;
};

// --- HELPER FUNCTIONS ---

function selectAccommodation(hotels, type, dailyBudget, numPeople) {
  // 1. Phân loại ngân sách theo quy tắc mới
  // dailyBudget là tổng ngân sách/ngày (cho cả nhóm)
  const perPersonBudget = dailyBudget / numPeople;
  
  // Ước tính ngân sách cho lưu trú (lấy trung bình)
  const estimatedStayBudget = dailyBudget * 0.25; 

  let targetType = "guesthouse"; // Mặc định tiết kiệm
  
  // Logic chọn loại hình dựa trên ngân sách và số người
  if (perPersonBudget > 1200000) {
     targetType = "hotel";
  } else if (perPersonBudget > 800000) {
     // Homestay chỉ dành cho nhóm > 4 người
     if (numPeople > 4) {
       targetType = "homestay";
     } else {
       targetType = "hotel"; // Ít người thì ở khách sạn cho tiện
     }
  } else {
     targetType = "guesthouse";
  }

  // Nếu user đã chọn loại cụ thể, tôn trọng user NHƯNG phải check ngân sách
  if (type && type !== 'any') {
    if (type === 'hotel' && perPersonBudget < 500000) targetType = 'guesthouse';
    else targetType = type;
  }

  // 2. Lọc candidates
  let candidates = hotels.filter(h => {
    // Map type của DB (homestay/hotel/guesthouse)
    if (targetType === 'guesthouse') return h.type === 'guesthouse' || h.priceLevel === 'cheap';
    if (targetType === 'homestay') return h.type === 'homestay';
    if (targetType === 'hotel') return h.type === 'hotel'; 
    return true;
  });

  // Fallback
  if (candidates.length === 0) {
    candidates = hotels;
  }

  // 3. Chọn cái phù hợp nhất về giá
  // Sắp xếp theo độ lệch giá so với estimatedStayBudget
  candidates.sort((a, b) => {
    const priceA = a.ticket || 0; // ticket field stores room price in seed
    const priceB = b.ticket || 0;
    return Math.abs(priceA - estimatedStayBudget) - Math.abs(priceB - estimatedStayBudget);
  });

  return candidates[0];
}

function calculateAccommodationCost(hotel, type, numDays, numPeople) {
  if (type === "free") return 0;

  // Giá phòng ước tính (nếu DB không có giá)
  const basePrice =
    hotel.ticket ||
    (hotel.priceLevel === "expensive"
      ? 1500000
      : hotel.priceLevel === "moderate"
      ? 600000
      : 300000);

  // Giả sử 2 người/phòng
  const numRooms = Math.ceil(numPeople / 2);
  return basePrice * numRooms * (numDays - 1); // Tính theo đêm
}







function getBudgetStatus(total, budget) {
  if (total > budget * 1.1) return "Vượt ngân sách";
  if (total < budget * 0.8) return "Tiết kiệm";
  return "Phù hợp";
}
