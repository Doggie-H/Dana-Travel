/**
 * =================================================================================================
 * SCHEDULE GENERATOR - THUẬT TOÁN TẠO LỊCH TRÌNH
 * =================================================================================================
 *
 * File này chịu trách nhiệm tạo ra lịch trình chi tiết cho một ngày (Day Schedule).
 *
 * NGUYÊN TẮC THIẾT KẾ:
 * 1. Readability First: Code phải "thẳng" (flat), hạn chế lồng nhau.
 * 2. Separation of Concerns: Tách logic tính toán ra khỏi luồng chính.
 * 3. Robustness: Luôn có phương án dự phòng (Fallback).
 */

import {
  calculateTotalActivityTime,
  filterValidLocations,
  canEndDayAtTime,
} from "./itinerary.validator.js";
import {
  LOCATION_RULES,
  SCHEDULING_RULES,
} from "../config/scheduling.constants.js";
import {
  calculateTransport,
  calculateDistance,
} from "./itinerary.helper.js";
import { formatDecimalTime } from "./format.util.js";

// --- CONSTANTS ---
const PREFERENCE_MAPPING = {
  'beach': ['biển', 'beach', 'bien'],
  'culture': ['văn hóa', 'culture', 'van-hoa', 'history', 'museum'],
  'food': ['ẩm thực', 'food', 'am-thuc', 'restaurant', 'street-food'],
  'nature': ['thiên nhiên', 'nature', 'thien-nhien', 'mountain', 'forest'],
  'nightlife': ['vui chơi đêm', 'nightlife', 'bar', 'club', 'pub'],
  'shopping': ['mua sắm', 'shopping', 'market', 'cho'],
  'adventure': ['mạo hiểm', 'adventure', 'sport', 'game', 'vui chơi giải trí', 'theme-park', 'fun'],
  'relax': ['thư giãn', 'relax', 'spa', 'massage']
};

/**
 * =================================================================================================
 * 1. MAIN FUNCTION: GENERATE DAY SCHEDULE
 * =================================================================================================
 */
export function generateDayScheduleStrict({
  date,
  startTime,
  endTime,
  allLocations,
  usedLocationIds,
  transport,
  numPeople,
  dailyBudget,
  hotel,
  hotelType,
  isFirstDay,
  isLastDay,
  preferences = [],
  accommodationCost = 0,
  transportCosts = {}
}) {
  // --- 1. SETUP STATE ---
  const items = [];
  let currentTime = startTime;
  let currentLoc = hotel;
  let remainingBudget = dailyBudget;

  const dailyVisitedCategories = [];
  const dailyLastVisitTime = new Map();

  // Context object truyền xuống helper
  const context = {
    currentTime,
    currentLoc,
    remainingBudget,
    numPeople,
    transport,
    preferences,
    allLocations,
    usedLocationIds,
    dailyVisitedCategories,
    dailyLastVisitTime,
    transportCosts
  };

  // Helper local updater
  const commitActivity = (activityResult) => {
    if (!activityResult) return false;
    currentTime = activityResult.endTime;
    currentLoc = activityResult.location;
    remainingBudget -= activityResult.cost;
    usedLocationIds.add(activityResult.location.id);

    // Sync Context
    context.currentTime = currentTime;
    context.currentLoc = currentLoc;
    context.remainingBudget = remainingBudget;
    return true;
  };

  // Wrapper bridging tryAddActivity -> addActivityToSchedule
  const createActivityItem = (items, location, title, customDuration, ctx) => {
    return addActivityToSchedule(
      items,
      location,
      ctx.currentLoc,
      ctx.currentTime,
      ctx.numPeople,
      title,
      ctx.transport,
      ctx.dailyVisitedCategories,
      ctx.dailyLastVisitTime,
      ctx.transportCosts,
      customDuration
    );
  };

  const tryAddActivity = (location, title, customDuration = null) => {
    const result = createActivityItem(items, location, title, customDuration, context);
    return commitActivity(result);
  };

  console.log(`\n=== LẬP LỊCH: ${new Date(date).toLocaleDateString("vi-VN")} ===`);
  const effectiveEndTime = isLastDay ? Math.max(startTime + 2, endTime - 1.5) : endTime;

  // ===============================================================================================
  // PHASE 1: BUỔI SÁNG (START -> 11:30)
  // ===============================================================================================
  console.log(`\n[PHASE 1] Sáng (Start: ${currentTime})`);

  // 1.1 Check-in / Gửi đồ (Chỉ ngày đầu)
  if (isFirstDay && currentTime <= 14) {
    handleCheckIn(items, hotel, currentTime, transport, accommodationCost);
    currentTime += 0.5;
    context.currentTime = currentTime; // Manual update
  }

  // 1.2 Ăn sáng (Nếu còn sớm < 9h30)
  if (currentTime < 9.5) {
    const breakfastLoc = findBestLocation(allLocations, ['restaurant-cheap', 'street-food'], 30, context);
    if (breakfastLoc) tryAddActivity(breakfastLoc, "Ăn sáng", 45);
  }

  // 1.3 Tham quan Sáng
  if (currentTime < Math.min(11.5, effectiveEndTime - 0.5)) {
    fillTimeSession(
      items,
      Math.min(11.5, effectiveEndTime),
      "Tham quan sáng",
      ['attraction', 'culture', 'nature', 'market', 'theme-park', 'ba-na-hills'],
      context,
      3, 5
    );
  }

  // ===============================================================================================
  // PHASE 2: BUỔI TRƯA (11:30 -> 14:00)
  // ===============================================================================================
  console.log(`\n[PHASE 2] Trưa (Start: ${currentTime})`);

  // 2.1 Ăn trưa
  if (currentTime < Math.min(13.5, effectiveEndTime - 0.5)) {
    const lunchLoc = findBestLocation(allLocations, ['restaurant', 'restaurant-cheap', 'restaurant-moderate'], 60, context);
    if (lunchLoc) tryAddActivity(lunchLoc, "Ăn trưa", 60);
  }

  // 2.2 Nghỉ trưa (Siesta)
  if (currentTime < 14 && (!isLastDay || endTime > 16) && currentTime + 2.5 < effectiveEndTime) {
    addSiesta(items, hotel, context);
  }

  // ===============================================================================================
  // PHASE 3: BUỔI CHIỀU (14:00 -> 18:00)
  // ===============================================================================================
  console.log(`\n[PHASE 3] Chiều (Start: ${currentTime})`);

  if (currentTime < Math.min(17.5, effectiveEndTime - 0.5)) {
    fillTimeSession(
      items,
      Math.min(17.5, effectiveEndTime),
      "Tham quan chiều",
      ['beach', 'cafe-snack', 'market', 'attraction', 'culture', 'nature', 'theme-park', 'ba-na-hills'],
      context,
      3, 5
    );
  }

  // ===============================================================================================
  // PHASE 4: BUỔI TỐI (18:00 -> 22:30)
  // ===============================================================================================
  if (currentTime < 21 && (currentTime + 1 < effectiveEndTime)) {
    console.log(`\n[PHASE 4] Tối (Start: ${currentTime})`);

    // 4.1 Ăn tối
    if (currentTime < 20 && (!isLastDay || currentTime < endTime - 2)) {
      const dinnerLoc = findBestLocation(allLocations, ['restaurant', 'restaurant-moderate', 'restaurant-cheap', 'street-food'], 90, context);
      if (dinnerLoc) tryAddActivity(dinnerLoc, "Ăn tối", 90);
    }

    // 4.2 Vui chơi tối
    fillTimeSession(
      items,
      Math.min(22.5, effectiveEndTime),
      "Vui chơi tối",
      ['bar-nightlife', 'night-attraction', 'cafe-snack', 'market'],
      context,
      2, 4
    );
  }

  // ===============================================================================================
  // PHASE 5: KẾT THÚC NGÀY
  // ===============================================================================================
  console.log(`\n[PHASE 5] End (Current: ${currentTime})`);

  if (isLastDay) {
    handleLastDayCheckout(items, hotel, endTime, context);
  } else {
    handleBackToHotel(items, hotel, currentTime, context);
  }

  // ===============================================================================================
  // 6. INTERNAL HELPERS (Restored)
  // ===============================================================================================

  function handleCheckIn(items, hotel, time, transport, cost) {
    items.push({
      type: "check-in",
      timeStart: formatDecimalTime(time),
      timeEnd: formatDecimalTime(time + 0.5),
      title: `Check-in: ${hotel.name}`,
      description: "Nhận phòng và nghỉ ngơi.",
      location: hotel,
      address: hotel.address,
      cost: { ticket: 0, food: 0, other: 0 },
      duration: 30,
      transport: null // Check-in is destination
    });
  }

  function handleBackToHotel(items, hotel, time, ctx) {
    // Add logic to return to hotel
    addActivityToSchedule(
      items, hotel, ctx.currentLoc, time, ctx.numPeople,
      "Về khách sạn", ctx.transport, [], new Map(), ctx.transportCosts, 0
    );
    // Manual push logic simplified for end of day
    const lastItem = items[items.length - 1];
    if (lastItem && lastItem.location.id !== hotel.id) {
      // Already added via addActivityToSchedule above
    }
  }

  function handleLastDayCheckout(items, hotel, endTime, ctx) {
    // Checkout logic
    items.push({
      type: "check-out",
      timeStart: formatDecimalTime(endTime - 0.5),
      timeEnd: formatDecimalTime(endTime),
      title: `Check-out: ${hotel.name}`,
      description: "Trả phòng và di chuyển ra sân bay/nhà ga.",
      location: hotel,
      address: hotel.address,
      cost: { ticket: 0, food: 0, other: 0 },
      duration: 30,
      transport: null
    });
  }

  function addSiesta(items, hotel, ctx) {
    // Return to hotel for rest
    if (ctx.currentLoc.id !== hotel.id) {
      tryAddActivity(hotel, "Về nghỉ trưa", 90);
    } else {
      // Already at hotel, just add rest note?
      // For simplicity, just skip if at hotel, or add a 'Rest' item
    }
  }

  function findBestLocation(locations, preferredTypes, durationMin, ctx) {
    // 1. Filter by type
    let candidates = locations.filter(l =>
      preferredTypes.some(t => l.type === t || l.visitType === t || (l.tags && l.tags.includes(t)))
    );

    // 2. Validate
    candidates = filterValidLocations(
      candidates, ctx.currentTime, durationMin,
      ctx.dailyVisitedCategories, ctx.dailyLastVisitTime, ctx.usedLocationIds
    );

    // 3. Sort (Rank by rating, then cost)
    candidates.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    return candidates[0];
  }

  function fillTimeSession(items, sessionEndTime, sessionTitle, preferredCats, ctx, minActs, maxActs) {
    let count = 0;
    while (ctx.currentTime < sessionEndTime - 1 && count < maxActs) {
      const loc = findBestLocation(ctx.allLocations, preferredCats, 60, ctx);
      if (!loc) break;

      if (tryAddActivity(loc, sessionTitle)) {
        count++;
      } else {
        break;
      }
    }
  }

  // Calculate Totals
  const totalCost = items.reduce((acc, item) => {
    const c = item.cost || {};
    const t = item.transport?.cost || 0;
    return acc + (c.ticket || 0) + (c.food || 0) + (c.other || 0) + t;
  }, 0) + (accommodationCost || 0);

  return {
    items,
    cost: totalCost,
    totalTime: (currentTime - startTime) * 60
  };
}

// --- HELPER: Add Activity Wrapper ---
function addActivityToSchedule(
  items,
  location,
  currentLoc,
  currentTime,
  numPeople,
  activityTitle,
  transport,
  dailyVisitedCategories,
  dailyLastVisitTime,
  transportCosts,
  customDuration = null
) {
  // Tính toán di chuyển
  const distance = calculateDistance(
    currentLoc.lat,
    currentLoc.lng,
    location.lat,
    location.lng
  );
  const transportInfo = calculateTransport(distance, transport, numPeople, transportCosts);

  // Thời gian di chuyển (giờ)
  const travelTimeHours = transportInfo.duration / 60;

  // Thời gian chơi (giờ)
  const visitDurationMin = customDuration || location.minVisitDuration || 60;
  const visitDurationHours = visitDurationMin / 60;

  // Tổng thời gian
  const totalTimeHours = travelTimeHours + visitDurationHours;

  // Chi phí
  const ticketCost = (location.ticket || 0) * numPeople;
  const foodCost = (location.avgPrice || 0) * numPeople; // Nếu là quán ăn
  const totalCost = ticketCost + foodCost + transportInfo.cost;

  // Add item di chuyển (nếu xa > 0.5km)
  // LOGIC MOVED: Thay vì push item riêng, ta gộp vào activity tiếp theo
  let inboundTransport = null;

  if (distance > 0.5 && currentLoc.id !== location.id) {
    // Calculate start/end time for transport
    const transStart = formatDecimalTime(currentTime);
    const transEnd = formatDecimalTime(currentTime + travelTimeHours);

    // Create transport info object (to attach to next item)
    inboundTransport = {
      ...transportInfo,
      mode: transportInfo.mode || "Di chuyển",
      from: currentLoc.name,
      to: location.name,
      startTime: transStart,
      endTime: transEnd,
      description: `Khoảng cách: ${distance.toFixed(1)}km`
    };

    // Tạm thời comment out việc push item riêng


    // Update time for transport (vẫn cộng thời gian di chuyển)
    currentTime += travelTimeHours;
  }

  // Add item hoạt động
  // Xác định loại item: food (quán ăn/street-food/cafe) hoặc activity (tham quan)
  // Logic mở rộng: Nếu có giá ăn (avgPrice > 0) mà không có vé (ticket == 0) -> Coi là địa điểm ăn uống (Beach Club, Cafe...)
  const isFood = location.type === "restaurant" ||
    location.type === "street-food" ||
    location.type === "cafe" ||
    location.type === "bar" ||
    location.visitType?.includes("restaurant") ||
    location.visitType?.includes("cafe") ||
    location.visitType?.includes("bar") ||
    ((location.avgPrice > 0) && (location.ticket === 0 || !location.ticket));

  items.push({
    type: isFood ? "food" : "activity",
    timeStart: formatDecimalTime(currentTime),
    timeEnd: formatDecimalTime(currentTime + visitDurationHours),
    title: `${activityTitle}: ${location.name}`,
    description: location.description || "Tham quan và trải nghiệm.",
    location: location,
    address: location.address || location.area || "Đà Nẵng", // THÊM: Địa chỉ
    cost: {
      ticket: isFood ? 0 : ticketCost,  // Quán ăn không có vé
      food: isFood ? (location.avgPrice || 50000) * numPeople : 0, // Quán ăn có giá ăn
      other: 0
    },
    duration: visitDurationMin,
    transport: null
  });

  // Update tracking
  const category = location.visitType || location.type;
  dailyVisitedCategories.push(category);
  dailyLastVisitTime.set(category, currentTime + visitDurationHours);

  return {
    location, // Needed for commitActivity
    endTime: currentTime + visitDurationHours,
    cost: totalCost,
    totalTime: totalTimeHours * 60
  };
}
