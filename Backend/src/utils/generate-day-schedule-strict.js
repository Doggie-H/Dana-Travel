/**
 * Thuật toán tạo lịch trình chi tiết cho một ngày.
 * Xử lý logic sắp xếp địa điểm, thời gian, và chi phí dựa trên constraints.
 */
import {
  calculateTotalActivityTime,
  filterValidLocations,
  canEndDayAtTime,
} from "./itinerary-validator.js";
import {
  LOCATION_RULES,
  SCHEDULING_RULES,
} from "../config/scheduling.constants.js";
import {
  calculateDistance,
  calculateTransport,
  formatTime,
} from "./itinerary-helpers.js";

/**
 * Hàm chính: Tạo lịch trình cho 1 ngày
 * 
 * @param {Object} params - Tham số đầu vào
 * @param {Date}   params.date - Ngày cần lập lịch
 * @param {number} params.startTime - Giờ bắt đầu (dạng số, VD: 8.5 = 8h30)
 * @param {number} params.endTime - Giờ kết thúc
 * @param {Array}  params.allLocations - Danh sách tất cả địa điểm
 * @param {Set}    params.usedLocationIds - Các địa điểm đã đi (tránh lặp)
 * @param {string} params.transport - Phương tiện di chuyển
 * @param {number} params.numPeople - Số người
 * @param {number} params.dailyBudget - Ngân sách ngày (VND)
 * @param {Object} params.hotel - Thông tin khách sạn
 * @param {boolean} params.isFirstDay - Có phải ngày đầu tiên?
 * @param {boolean} params.isLastDay - Có phải ngày cuối?
 * @returns {Object} { items, totalCost } - Lịch trình và tổng chi phí
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
  preferences = [], // THÊM: Sở thích của user (biển, văn hóa, ẩm thực...)
  accommodationCost = 0, // THÊM: Tổng chi phí khách sạn
}) {
  const items = [];
  let currentTime = startTime;
  let currentLoc = hotel; // Mặc định bắt đầu từ khách sạn (hoặc sân bay nếu ngày đầu)
  let remainingBudget = dailyBudget;

  // Initialize per-day tracking
  const dailyVisitedCategories = [];
  const dailyLastVisitTime = new Map();

  // ==========================================
  // HELPER FUNCTIONS (A.1, A.2, B.4, B.5)
  // ==========================================

  /**
   * A.1: Kiểm tra địa điểm có phù hợp preferences không
   * Nếu user không chọn preferences nào → match tất cả
   */
  const matchesPreferences = (location) => {
    if (!preferences || preferences.length === 0) return true;
    
    // Parse tags từ location (có thể là JSON string hoặc array)
    let locationTags = [];
    try {
      locationTags = typeof location.tags === 'string' 
        ? JSON.parse(location.tags) 
        : (location.tags || []);
    } catch (e) {
      locationTags = [];
    }
    
    // Map preferences tiếng Việt sang tags trong DB
    const prefMapping = {
      'beach': ['biển', 'beach', 'bien'],
      'culture': ['văn hóa', 'culture', 'van-hoa', 'history'],
      'food': ['ẩm thực', 'food', 'am-thuc', 'restaurant'],
      'nature': ['thiên nhiên', 'nature', 'thien-nhien', 'mountain'],
      'nightlife': ['vui chơi đêm', 'nightlife', 'bar', 'club'],
      'shopping': ['mua sắm', 'shopping', 'market', 'cho'],
      'adventure': ['mạo hiểm', 'adventure', 'sport'],
      'relax': ['thư giãn', 'relax', 'spa', 'massage']
    };
    
    // Kiểm tra location có match với bất kỳ preference nào không
    return preferences.some(pref => {
      const prefLower = pref.toLowerCase();
      const mappedTags = prefMapping[prefLower] || [prefLower];
      
      // Check type match
      if (mappedTags.includes(location.type?.toLowerCase())) return true;
      
      // Check visitType match
      if (mappedTags.includes(location.visitType?.toLowerCase())) return true;
      
      // Check tags match
      return locationTags.some(tag => 
        mappedTags.includes(tag?.toLowerCase())
      );
    });
  };

  /**
   * B.4: Tính điểm cho địa điểm để chọn tối ưu
   * Score cao = nên chọn
   */
  const scoreLocation = (location) => {
    let score = 0;
    
    // 1. Phù hợp preferences: +30 điểm (QUAN TRỌNG NHẤT)
    if (matchesPreferences(location)) score += 30;
    
    // 2. Gần vị trí hiện tại: +0-15 điểm (càng gần càng cao)
    if (currentLoc && location.lat && location.lng) {
      const distance = calculateDistance(
        currentLoc.lat, currentLoc.lng, 
        location.lat, location.lng
      );
      score += Math.max(0, 15 - distance * 2); // Mỗi km xa giảm 2 điểm
    }
    
    // 3. Trong budget: +10 điểm
    const ticketCost = (location.ticket || 0) * numPeople;
    if (ticketCost <= remainingBudget * 0.35) score += 10;
    
    // 4. Chưa đi category này hôm nay: +5 điểm (đa dạng hóa)
    const category = location.visitType || location.type;
    if (!dailyVisitedCategories.includes(category)) score += 5;
    
    return score;
  };

  /**
   * A.2: Lấy duration phù hợp cho địa điểm
   * Ưu tiên suggestedDuration từ DB, fallback theo type
   */
  const getSmartDuration = (location, maxMinutes = 180) => {
    // 1. Ưu tiên suggestedDuration từ database
    if (location.suggestedDuration && location.suggestedDuration > 0) {
      return Math.min(location.suggestedDuration, maxMinutes);
    }
    
    // 2. Fallback theo type
    const durationByType = {
      'theme-park': 240,     // 4 tiếng (Bà Nà, Asia Park)
      'attraction': 120,     // 2 tiếng
      'beach': 120,          // 2 tiếng
      'culture': 90,         // 1.5 tiếng
      'nature': 120,         // 2 tiếng
      'mountain': 180,       // 3 tiếng
      'restaurant': 60,      // 1 tiếng
      'cafe': 45,            // 45 phút
      'street-food': 30,     // 30 phút
      'bar': 120,            // 2 tiếng
      'market': 60,          // 1 tiếng
      'museum': 90,          // 1.5 tiếng
    };
    
    const typeDuration = durationByType[location.type] || 
                         durationByType[location.visitType] || 
                         60;
    
    return Math.min(typeDuration, maxMinutes);
  };

  /**
   * B.5: Chọn địa điểm tốt nhất từ danh sách candidates
   * Sử dụng scoring system thay vì random
   */
  const selectBestLocation = (candidates) => {
    if (candidates.length === 0) return null;
    if (candidates.length === 1) return candidates[0];
    
    // Score tất cả candidates
    const scoredLocations = candidates.map(loc => ({
      ...loc,
      _score: scoreLocation(loc)
    }));
    
    // Sort theo score giảm dần
    scoredLocations.sort((a, b) => b._score - a._score);
    
    // Trả về địa điểm có score cao nhất
    return scoredLocations[0];
  };

  console.log(`\n📅 Lập lịch ${new Date(date).toLocaleDateString("vi-VN")}`);
  console.log(
    `⏰ Thời gian: ${startTime}h - ${endTime}h | 💰 Ngân sách: ${dailyBudget.toLocaleString()}đ`
  );

  // === LAST DAY: Tính thời gian cut-off thực tế ===
  // Ngày cuối cần dừng hoạt động sớm để checkout + ra sân bay
  // VD: Bay 14h → checkout 12h → dừng activities lúc 11:30
  const effectiveEndTime = isLastDay 
    ? Math.max(startTime + 2, endTime - 1.5) // Checkout trước 1.5h, tối thiểu 2h hoạt động
    : endTime;
  
  console.log(`⏱️ Thời gian kết thúc hoạt động: ${effectiveEndTime}h ${isLastDay ? '(Ngày cuối)' : ''}`);

  // Helper function to add activity
  const addActivity = (location, activityType, customDuration = null) => {
    const result = addActivityToSchedule(
      items,
      location,
      currentLoc,
      currentTime,
      numPeople,
      activityType,
      transport,
      dailyVisitedCategories,
      dailyLastVisitTime,
      customDuration
    );

    if (result) {
      currentTime = result.endTime;
      currentLoc = location;
      remainingBudget -= result.cost;
      usedLocationIds.add(location.id);
      return true;
    }
    return false;
  };

  // --- PHASE 1: SÁNG (START - 11:30) ---
  console.log(`[PHASE 1] Morning Start: ${currentTime}`);

  // 1.1 Check-in (Ngày đầu, nếu đến sớm trước 14h thì gửi đồ, sau 14h thì check-in)
  if (isFirstDay && currentTime <= 14) {
    const isEarly = currentTime < 13;
    items.push({
      type: "check-in",
      timeStart: formatTime(currentTime),
      timeEnd: formatTime(currentTime + 0.5),
      title: isEarly
        ? `Gửi hành lý tại ${hotel.name}`
        : `Check-in khách sạn ${hotel.name}`,
      description: isEarly
        ? "Đến sớm, gửi hành lý tại lễ tân để đi chơi."
        : "Nhận phòng và cất hành lý.",
      location: hotel,
      cost: { ticket: accommodationCost, food: 0, other: 0 }, // Hiển thị tổng tiền phòng
      duration: 30,
      transport: {
        mode: transport.mode,
        distance: 5, // Giả định từ sân bay
        durationMin: 30,
        cost: transport.mode === "taxi" ? 150000 : 50000,
        from: "Sân bay/Nhà ga",
        to: hotel.name,
        suggestion: "Di chuyển về khách sạn",
      },
    });
    currentTime += 0.5;
    currentLoc = hotel;
  }

  // 1.2 Ăn sáng (Nếu chưa quá 9h30)
  if (currentTime < 9.5) {
    const breakfastCandidates = allLocations.filter(
      (l) =>
        (l.visitType === "restaurant-cheap" || l.type === "street-food") &&
        !usedLocationIds.has(l.id)
    );
    const validBreakfasts = filterValidLocations(
      breakfastCandidates,
      currentTime,
      30, // Max 30p
      dailyVisitedCategories,
      dailyLastVisitTime,
      usedLocationIds
    );
    
    if (validBreakfasts.length > 0) {
      const bestBreakfast = selectBestLocation(validBreakfasts);
      addActivity(bestBreakfast, "Ăn sáng", getSmartDuration(bestBreakfast, 45));
    }
  }

  // 1.3 Hoạt động sáng (2 slots)
  // Slot 1: 2-3 tiếng (Công viên, Bảo tàng...)
  if (currentTime < Math.min(11, effectiveEndTime - 1)) {
     const slot1Candidates = allLocations.filter(
      (l) =>
        (l.type === "attraction" || l.type === "culture" || l.type === "nature") &&
        !usedLocationIds.has(l.id) &&
        l.ticket <= remainingBudget * 0.4
    );
    const validSlot1 = filterValidLocations(
        slot1Candidates, currentTime, 120, dailyVisitedCategories, dailyLastVisitTime, usedLocationIds
    );
    if (validSlot1.length > 0) {
        const bestSlot1 = selectBestLocation(validSlot1);
        addActivity(bestSlot1, "Tham quan sáng", getSmartDuration(bestSlot1, 180));
    }
  }

  // Slot 2: 1-2 tiếng (Địa điểm nhẹ nhàng hơn)
  if (currentTime < Math.min(11.5, effectiveEndTime - 0.5)) {
     const slot2Candidates = allLocations.filter(
      (l) =>
        (l.type === "attraction" || l.type === "culture" || l.visitType === "market") &&
        !usedLocationIds.has(l.id)
    );
    const validSlot2 = filterValidLocations(
        slot2Candidates, currentTime, 60, dailyVisitedCategories, dailyLastVisitTime, usedLocationIds
    );
    if (validSlot2.length > 0) {
        const bestSlot2 = selectBestLocation(validSlot2);
        addActivity(bestSlot2, "Tham quan tiếp", getSmartDuration(bestSlot2, 120));
    }
  }

  // --- PHASE 2: TRƯA (11:30 - 14:00) ---
  console.log(`[PHASE 2] Noon: ${currentTime}`);

  // 2.1 Ăn trưa (15-30p)
  if (currentTime < Math.min(13.5, effectiveEndTime - 0.5)) {
    const lunchCandidates = allLocations.filter(
      (l) =>
        (l.type === "restaurant" || l.visitType?.includes("restaurant")) &&
        !usedLocationIds.has(l.id)
    );
    const validLunch = filterValidLocations(
        lunchCandidates, currentTime, 45, dailyVisitedCategories, dailyLastVisitTime, usedLocationIds
    );
    if (validLunch.length > 0) {
        const bestLunch = selectBestLocation(validLunch);
        addActivity(bestLunch, "Ăn trưa", getSmartDuration(bestLunch, 60));
    }
  }

  // 2.2 Nghỉ trưa (SIESTA) - BẮT BUỘC (Trừ ngày cuối hoặc khi không đủ thời gian)
  if ((!isLastDay || endTime > 16) && currentTime + 2.5 < effectiveEndTime) {
    // Tính toán di chuyển về khách sạn
    const distanceToHotel = calculateDistance(currentLoc.lat, currentLoc.lng, hotel.lat, hotel.lng);
    const transportToHotel = calculateTransport(distanceToHotel, transport, numPeople);
    
    // Thêm item di chuyển về khách sạn nghỉ ngơi
    // Ta add activity "Nghỉ trưa" tại Hotel
    const restDuration = 120; // 2 tiếng nghỉ
    
    // Manual add to avoid complex validation logic blocking "Hotel" visit
    const travelTime = Math.round((distanceToHotel / 30) * 60 + 5);
    const arrivalTime = currentTime + travelTime / 60;
    
    items.push({
        type: "transport",
        timeStart: formatTime(currentTime),
        timeEnd: formatTime(arrivalTime),
        title: `Di chuyển về ${hotel.name}`,
        description: "Về khách sạn nghỉ trưa tránh nắng.",
        location: hotel,
        cost: { ticket: 0, food: 0, other: transportToHotel.cost },
        duration: travelTime,
        transport: {
            ...transportToHotel,
            from: currentLoc.name,
            to: hotel.name,
            suggestion: "Về nghỉ trưa"
        }
    });
    
    currentTime = arrivalTime;
    remainingBudget -= transportToHotel.cost;

    items.push({
        type: "rest",
        timeStart: formatTime(currentTime),
        timeEnd: formatTime(currentTime + 2), // Nghỉ 2 tiếng
        title: `Nghỉ trưa tại ${hotel.name}`,
        description: "Nạp lại năng lượng cho buổi chiều.",
        location: hotel,
        cost: { ticket: 0, food: 0, other: 0 },
        duration: 120,
        transport: null
    });
    
    currentTime += 2;
    currentLoc = hotel;
  }

  // --- PHASE 3: CHIỀU (14:00 - 18:00) ---
  console.log(`[PHASE 3] Afternoon: ${currentTime}`);

  // 3.1 Chơi 3 (Biển/Cafe/Chợ 1-2h)
  if (currentTime < Math.min(16, effectiveEndTime - 1)) {
      const afternoon1Candidates = allLocations.filter(
      (l) =>
        (l.visitType === "beach" || l.visitType === "cafe-snack" || l.visitType === "market") &&
        !usedLocationIds.has(l.id)
    );
    const validAfternoon1 = filterValidLocations(
        afternoon1Candidates, currentTime, 90, dailyVisitedCategories, dailyLastVisitTime, usedLocationIds
    );
    if (validAfternoon1.length > 0) {
        const bestAfternoon1 = selectBestLocation(validAfternoon1);
        addActivity(bestAfternoon1, "Dạo chơi chiều", getSmartDuration(bestAfternoon1, 120));
    }
  }

  // 3.2 Chơi 4 (Địa điểm thứ 2 - 2-3h)
  if (currentTime < Math.min(17.5, effectiveEndTime - 0.5)) {
      const afternoon2Candidates = allLocations.filter(
      (l) =>
        (l.type === "attraction" || l.type === "culture" || l.visitType === "theme-park") &&
        !usedLocationIds.has(l.id)
    );
    const validAfternoon2 = filterValidLocations(
        afternoon2Candidates, currentTime, 120, dailyVisitedCategories, dailyLastVisitTime, usedLocationIds
    );
    if (validAfternoon2.length > 0) {
        const bestAfternoon2 = selectBestLocation(validAfternoon2);
        addActivity(bestAfternoon2, "Tham quan chiều", getSmartDuration(bestAfternoon2, 180));
    }
  }

  // --- PHASE 4: TỐI (18:00 - 22:30) ---
  // CHỈ chạy nếu KHÔNG PHẢI ngày cuối HOẶC nếu ngày cuối mà giờ về > 20h
  if (!isLastDay || (isLastDay && endTime >= 20)) {
    console.log(`[PHASE 4] Evening: ${currentTime}`);

    // 4.1 Ăn tối (tùy budget: 45p-90p)
    if (currentTime < 20 && (!isLastDay || currentTime < endTime - 2)) {
        const dinnerCandidates = allLocations.filter(
        (l) =>
          (l.type === "restaurant" || l.visitType?.includes("restaurant") || l.type === "street-food") &&
          !usedLocationIds.has(l.id)
      );
      const validDinner = filterValidLocations(
          dinnerCandidates, currentTime, 60, dailyVisitedCategories, dailyLastVisitTime, usedLocationIds
      );
      
      if (validDinner.length > 0) {
          const bestDinner = selectBestLocation(validDinner);
          addActivity(bestDinner, "Ăn tối", getSmartDuration(bestDinner, 90));
      }
    }

    // 4.2 Chơi tối (Bar/Club/Cầu/Biển)
    // CHỈ nếu KHÔNG PHẢI ngày cuối
    // A.3: FIX - Thêm loop counter để tránh infinite loop
    if (!isLastDay) {
      let nightLoopCount = 0;
      const MAX_NIGHT_ACTIVITIES = 3; // Tối đa 3 hoạt động tối
      
      while (currentTime < 22 && nightLoopCount < MAX_NIGHT_ACTIVITIES) {
        nightLoopCount++;
        
        const nightCandidates = allLocations.filter(
          (l) =>
            (l.visitType === "bar-nightlife" || l.visitType === "night-attraction" || l.visitType === "cafe-snack") &&
            !usedLocationIds.has(l.id)
        );
        const validNight = filterValidLocations(
            nightCandidates, currentTime, 60, dailyVisitedCategories, dailyLastVisitTime, usedLocationIds
        );

        if (validNight.length > 0) {
            const bestNight = selectBestLocation(validNight);
            // B.5: Dynamic duration - fill đến 22:30 nhưng không quá
            const maxDuration = Math.min(180, (22.5 - currentTime) * 60);
            addActivity(bestNight, "Vui chơi tối", getSmartDuration(bestNight, maxDuration));
        } else {
            break; // Hết chỗ chơi
        }
      }
    }
  }

  // --- PHASE 5: KẾT THÚC NGÀY ---
  console.log(`[PHASE 5] End of Day: ${currentTime}, endTime: ${endTime}, isLastDay: ${isLastDay}`);

  if (isLastDay) {
    // === NGÀY CUỐI: LOGIC ĐẶC BIỆT ===
    // Check-out thường là 12:00, cần về sân bay trước giờ bay 2 tiếng
    // Ví dụ: Bay 14:00 thì check-out 11:00-11:30, ra sân bay 11:30-12:00
    
    // Tính thời gian cần để ra sân bay (30-45 phút) + buffer 30 phút
    const airportTransferTime = 1; // 1 tiếng để ra sân bay an toàn
    const checkoutTime = Math.max(6, endTime - airportTransferTime - 0.5); // Checkout trước ra sân bay 30p
    
    // Nếu currentTime đã vượt quá checkoutTime, không thêm hoạt động nữa
    // Trường hợp user về sớm (VD: 14h), cần đảm bảo lịch không schedule quá 12:30
    
    // Thời gian còn lại trước checkout
    const timeRemainingBeforeCheckout = checkoutTime - currentTime;
    
    console.log(`[LAST DAY] Checkout at: ${checkoutTime}h, timeRemaining: ${timeRemainingBeforeCheckout}h`);
    
    // Nếu còn > 2 tiếng, thêm 1 hoạt động ngắn (cafe/chợ)
    if (timeRemainingBeforeCheckout >= 2) {
      const quickCandidates = allLocations.filter(
        (l) =>
          (l.visitType === "cafe-snack" || l.visitType === "market" || l.type === "street-food") &&
          !usedLocationIds.has(l.id)
      );
      const validQuick = filterValidLocations(
          quickCandidates, currentTime, 60, dailyVisitedCategories, dailyLastVisitTime, usedLocationIds
      );
      if (validQuick.length > 0) {
          const activityDuration = Math.min(90, (checkoutTime - currentTime - 0.5) * 60); // Max 1.5h hoặc vừa đủ
          addActivity(validQuick[0], "Dạo chơi cuối", activityDuration);
      }
    } else if (timeRemainingBeforeCheckout >= 1) {
      // Còn 1-2 tiếng: uống cafe nhanh 30-45p
      const cafeCandidates = allLocations.filter(
        (l) => l.visitType === "cafe-snack" && !usedLocationIds.has(l.id)
      );
      if (cafeCandidates.length > 0) {
          addActivity(cafeCandidates[0], "Cafe trước khi về", 45);
      }
    }
    
    // Về khách sạn checkout (nếu chưa ở khách sạn)
    if (currentLoc.id !== hotel.id) {
      const distanceToHotel = calculateDistance(currentLoc.lat, currentLoc.lng, hotel.lat, hotel.lng);
      const transportToHotel = calculateTransport(distanceToHotel, transport, numPeople);
      const travelTime = Math.round((distanceToHotel / 30) * 60 + 5);
      
      items.push({
        type: "transport",
        timeStart: formatTime(currentTime),
        timeEnd: formatTime(currentTime + travelTime / 60),
        title: `Về khách sạn lấy hành lý`,
        description: "Về khách sạn checkout và chuẩn bị kết thúc chuyến đi.",
        location: hotel,
        address: hotel.address || hotel.area || "Đà Nẵng",
        cost: { ticket: 0, food: 0, other: transportToHotel.cost },
        duration: travelTime,
        transport: transportToHotel
      });
      currentTime += travelTime / 60;
    }
    
    // Check-out đơn giản - không tính tiền, chỉ đánh dấu kết thúc
    items.push({
      type: "check-out",
      timeStart: formatTime(currentTime),
      timeEnd: formatTime(endTime),
      title: `Check-out & Kết thúc chuyến đi`,
      description: `Trả phòng ${hotel.name}, chào tạm biệt Đà Nẵng!`,
      location: hotel,
      address: hotel.address || hotel.area || "Đà Nẵng",
      cost: { ticket: 0, food: 0, other: 0 }, // Không tính tiền checkout
      duration: 0,
      transport: null // Không cần transport
    });
  } else {
    // NGÀY THƯỜNG: Về khách sạn ngủ
    let returnTime = currentTime < 22.5 ? 22.5 : currentTime;
    
    // Tính chi phí phòng
    const basePrice = hotel.ticket || (hotel.priceLevel === "expensive" ? 1500000 : 500000);
    const numRooms = Math.ceil(numPeople / 2);
    const nightlyCost = basePrice * numRooms;

    items.push({
      type: "accommodation",
      timeStart: formatTime(returnTime),
      timeEnd: "06:00",
      title: `Về khách sạn: ${hotel.name}`,
      description: "Nghỉ ngơi sau một ngày dài.",
      location: hotel,
      cost: { ticket: 0, food: 0, other: 0 }, // Đã tính tiền phòng lúc check-in
      duration: 0,
      transport: {
          mode: "Di chuyển",
          distance: 5,
          durationMin: 20,
          cost: 50000, // Taxi về đêm
          from: currentLoc.name,
          to: hotel.name,
          suggestion: "Về khách sạn nghỉ ngơi"
      }
    });
  }

  return { items };
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
  customDuration = null
) {
  // Tính toán di chuyển
  const distance = calculateDistance(
    currentLoc.lat,
    currentLoc.lng,
    location.lat,
    location.lng
  );
  const transportInfo = calculateTransport(distance, transport, numPeople);
  
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
  if (distance > 0.5 && currentLoc.id !== location.id) {
      items.push({
          type: "transport",
          timeStart: formatTime(currentTime),
          timeEnd: formatTime(currentTime + travelTimeHours),
          title: `Di chuyển đến ${location.name}`,
          description: `Khoảng cách: ${distance.toFixed(1)}km`,
          location: location, // SỬA: Dùng location đích để lấy address
          address: location.address || location.area || "Đà Nẵng", // THÊM: Địa chỉ
          cost: { ticket: 0, food: 0, other: transportInfo.cost },
          duration: transportInfo.duration,
          transport: {
              ...transportInfo,
              from: currentLoc.name,
              to: location.name
          }
      });
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
      timeStart: formatTime(currentTime),
      timeEnd: formatTime(currentTime + visitDurationHours),
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
      endTime: currentTime + visitDurationHours,
      cost: totalCost,
      totalTime: totalTimeHours * 60
  };
}
