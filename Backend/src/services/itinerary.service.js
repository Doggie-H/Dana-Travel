/**
 * ITINERARY SERVICE
 * 
 * Service này chịu trách nhiệm tạo ra lịch trình du lịch tự động dựa trên yêu cầu của người dùng.
 * Đây là "bộ não" chính của ứng dụng, kết hợp dữ liệu địa điểm, tính toán ngân sách và logic sắp xếp thời gian.
 * 
 * Các chức năng chính:
 * 1. generateItinerary: Hàm chính để tạo lịch trình.
 * 2. generateDayItems: Tạo chi tiết hoạt động cho từng ngày.
 * 3. estimateItemCosts: Tính toán chi phí (di chuyển, ăn uống).
 */

import { getAllLocations } from "./location.service.js";
import {
  calculateBudgetBreakdown,
  estimateAccommodationCost,
  estimateFoodCost,
  estimateTransportCost,
  summarizeBudget,
} from "./budget.service.js";
import {
  generateDateRange,
  parseTimeOnDate,
  toTimeString,
} from "../utils/time.utils.js";
import { pickRandom, shuffle } from "../utils/array.utils.js";
import {
  getDaysBetween,
  randomInRange,
  roundToStep,
} from "../utils/format.utils.js";
import {
  TRANSPORT_COSTS,
} from "../config/app.constants.js";

// --- CÁC HÀM TIỆN ÍCH NỘI BỘ (HELPER FUNCTIONS) ---

/**
 * Cộng thêm phút vào một mốc thời gian.
 * @param {Date|string} time - Thời gian gốc.
 * @param {number} durationMin - Số phút cần cộng.
 * @returns {Date} - Đối tượng Date mới.
 */
function addMinutes(time, durationMin) {
  const result = new Date(time);
  result.setMinutes(result.getMinutes() + durationMin);
  return result;
}

/**
 * Tính khoảng cách giữa 2 tọa độ (Haversine formula).
 * Dùng để tính chi phí di chuyển và thời gian đi lại.
 * 
 * @param {number} lat1 - Vĩ độ điểm 1.
 * @param {number} lon1 - Kinh độ điểm 1.
 * @param {number} lat2 - Vĩ độ điểm 2.
 * @param {number} lon2 - Kinh độ điểm 2.
 * @returns {number} - Khoảng cách (km).
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Bán kính trái đất (km)
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Khoảng cách km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

// --- LOGIC CHÍNH (CORE LOGIC) ---

/**
 * Tạo lịch trình du lịch chi tiết.
 *
 * @param {Object} userRequest - Yêu cầu từ người dùng.
 * @param {number} userRequest.budgetTotal - Tổng ngân sách (VND).
 * @param {number} userRequest.numPeople - Số lượng người đi.
 * @param {string} userRequest.arriveDateTime - Thời gian đến (ISO string).
 * @param {string} userRequest.leaveDateTime - Thời gian đi (ISO string).
 * @param {string} userRequest.transport - Phương tiện di chuyển (taxi, grab, public, v.v.).
 * @param {string} userRequest.accommodation - Loại chỗ ở (hotel, homestay, resort, v.v.).
 * @param {string[]} userRequest.preferences - Sở thích (biển, núi, văn hóa, v.v.).
 * @returns {Promise<Object>} - Đối tượng chứa danh sách ngày và tóm tắt ngân sách.
 */
export async function generateItinerary(userRequest) {
  // 1. Giải nén dữ liệu từ request
  const {
    budgetTotal,
    numPeople,
    arriveDateTime,
    leaveDateTime,
    transport,
    accommodation,
    preferences = [],
  } = userRequest;

  // 2. Tính toán cơ bản (số ngày, dải ngày)
  const numDays = getDaysBetween(arriveDateTime, leaveDateTime);
  const dateRange = generateDateRange(arriveDateTime, leaveDateTime);
  const arriveDateObj = new Date(arriveDateTime);
  const leaveDateObj = new Date(leaveDateTime);

  // Xác định ngân sách thấp (dưới 1 triệu/người/ngày)
  const isLowBudget = (budgetTotal / numPeople / numDays) < 1000000;

  // 3. Phân bổ ngân sách dự kiến
  const budgetBreakdown = calculateBudgetBreakdown({
    budgetTotal,
    numPeople,
    numDays,
    accommodation,
    transport,
  });

  // 4. Lấy dữ liệu địa điểm từ database
  const allLocations = await getAllLocations();

  // 5. Chọn nơi lưu trú (Accommodation)
  let stayLocation = null;
  if (accommodation !== 'free' && accommodation !== 'own') {
      // Tìm nơi ở phù hợp với loại user chọn (hotel, homestay...)
      let suitableStays = allLocations.filter(l => 
          l.type === 'accommodation' && 
          Array.isArray(l.tags) && 
          l.tags.includes(accommodation)
      );
      
      // Fallback: Nếu không tìm thấy đúng loại, lấy bất kỳ chỗ nào là accommodation
      if (suitableStays.length === 0) {
          suitableStays = allLocations.filter(l => l.type === 'accommodation');
      }
      
      if (suitableStays.length > 0) {
          stayLocation = suitableStays[0]; // Chọn cái đầu tiên (có thể cải tiến random)
      }
  }

  /**
   * Hàm nội bộ: Lọc và chấm điểm địa điểm dựa trên sở thích.
   */
  function selectLocationsByPreferences(locations, prefs, days, lowBudget) {
      const scored = locations.map(loc => {
          let score = 0;
          // Tăng điểm nếu khớp sở thích
          if (loc.tags) {
              prefs.forEach(p => {
                  if (loc.tags.includes(p)) score += 2;
                  // Ưu tiên đặc biệt cho camping nếu user chọn
                  if (p === 'camping' && loc.tags.includes('camping')) score += 3;
              });
          }
          // Tăng điểm cho địa điểm giá rẻ nếu ngân sách thấp
          if (lowBudget && loc.priceLevel === 'cheap') score += 1;
          return { ...loc, score };
      });
      
      // Sắp xếp theo điểm giảm dần
      scored.sort((a, b) => b.score - a.score);
      
      // Phân loại để dễ dàng lấy ra khi tạo lịch trình
      return {
          attractions: scored.filter(l => l.type === 'attraction' || l.type === 'nature' || l.type === 'culture'),
          restaurants: scored.filter(l => l.type === 'restaurant' || l.type === 'food'),
          others: scored.filter(l => l.type === 'cafe' || l.type === 'bar')
      };
  }

  const selectedLocations = selectLocationsByPreferences(allLocations, preferences, numDays, isLowBudget);

  // 6. Tạo lịch trình cho từng ngày (Vòng lặp chính)
  const days = [];
  for (let i = 0; i < dateRange.length; i++) {
    const dayItems = generateDayItems(
      dateRange[i],
      i,
      arriveDateObj,
      leaveDateObj,
      selectedLocations,
      stayLocation,
      transport,
      numPeople,
      isLowBudget,
      preferences
    );
    
    days.push({
      dayNumber: i + 1,
      date: toTimeString(dateRange[i]).split(' ')[0], // Chỉ lấy phần ngày
      items: dayItems,
    });
  }

  // 7. Tổng hợp ngân sách cuối cùng
  const summary = summarizeBudget({ days }, budgetTotal, numPeople);

  // 8. Lưu dữ liệu xu hướng tìm kiếm (Trend Data) - Fire & Forget
  try {
    const durationText = `${numDays} ngày ${numDays - 1} đêm`;
    
    import("../utils/prisma.js").then(({ default: prisma }) => {
       prisma.searchTrend.create({
        data: {
          tags: JSON.stringify(preferences || []),
          duration: durationText,
          budget: Number(budgetTotal),
          people: Number(numPeople),
        }
      }).catch(err => console.error("Error saving trend:", err));
    });
  } catch (e) {
    console.error("Error preparing trend data:", e);
  }

  return {
    days,
    summary: {
        ...summary,
        totalCost: summary.estimatedTotal // Alias để tương thích frontend
    }
  };
}

/**
 * Tạo danh sách hoạt động cho một ngày cụ thể.
 * Logic bao gồm: Ăn sáng -> Hoạt động sáng -> Ăn trưa -> Nghỉ trưa -> Hoạt động chiều -> Ăn tối -> Tối.
 */
function generateDayItems(
  date,
  dayIndex,
  arriveDateObj,
  leaveDateObj,
  selectedLocations,
  stayLocation,
  transport,
  numPeople,
  isLowBudget,
  preferences = []
) {
  const items = [];
  const dayItems = []; // Dùng để theo dõi items trong ngày này
  
  let currentTime;
  let endTimeLimit = parseTimeOnDate(date, '22:00'); // Mặc định kết thúc lúc 22h
  let isLastDay = false;

  // Xử lý giờ bắt đầu
  if (dayIndex === 0 && arriveDateObj) {
      // Ngày đầu tiên: Bắt đầu sau khi đến 60 phút
      const arrivalTime = new Date(arriveDateObj);
      currentTime = addMinutes(arrivalTime, 60); 
  } else {
      // Các ngày khác: Tùy sở thích mà dậy sớm hay muộn
      if (preferences.includes('beach') || preferences.includes('nature') || preferences.includes('camping')) {
          currentTime = parseTimeOnDate(date, '05:30'); // Dậy sớm đón bình minh
      } else if (preferences.includes('photo') || preferences.includes('culture')) {
          currentTime = parseTimeOnDate(date, '06:30');
      } else {
          currentTime = parseTimeOnDate(date, '07:30'); // Giờ tiêu chuẩn
      }
  }

  // Xử lý ngày cuối cùng
  if (leaveDateObj) {
      const daysDiff = getDaysBetween(currentTime, leaveDateObj);
      if (daysDiff <= 1) {
           isLastDay = true;
           const departureTime = new Date(leaveDateObj);
           // Kết thúc sớm hơn giờ bay 150 phút (2.5 tiếng)
           endTimeLimit = addMinutes(departureTime, -150);
      }
  }

  // Trạng thái các bữa ăn
  let hasBreakfast = false;
  let hasLunch = false;
  let hasSnack = false;
  let hasDinner = false;
  let prevLocation = stayLocation; 

  // Helper để thêm item vào danh sách
  const addItem = (item) => {
      items.push(item);
      dayItems.push(item);
      // Cập nhật vị trí hiện tại để tính khoảng cách cho điểm tiếp theo
      prevLocation = { lat: item.lat, lng: item.lng, name: item.title, id: item.locationId };
      // Cập nhật thời gian hiện tại
      currentTime = new Date(item.timeEnd);
  };

  let safetyLoop = 0;
  // Vòng lặp chính để lấp đầy thời gian trong ngày
  while (currentTime < endTimeLimit && safetyLoop < 25) {
      safetyLoop++;
      // Tính giờ hiện tại theo múi giờ Việt Nam (UTC+7)
      const currentHour = (currentTime.getUTCHours() + 7) % 24;

      // 1. Ăn sáng (Trước 9h)
      if (!hasBreakfast && currentHour < 9) {
          const duration = 45;
          const timeEnd = addMinutes(currentTime, duration);
          
          addItem({
              timeStart: currentTime.toISOString(),
              timeEnd: timeEnd.toISOString(),
              locationId: 'breakfast',
              title: 'Ăn sáng',
              type: 'food',
              activityType: 'dining',
              address: 'Tại khu vực trung tâm hoặc gần khách sạn',
              duration: duration,
              transport: null,
              cost: { ticket: 0, food: isLowBudget ? 45000 * numPeople : 60000 * numPeople, other: 0 },
              notes: 'Nạp năng lượng cho ngày mới (Bánh mì, Phở...)'
          });
          hasBreakfast = true;
          continue;
      }

      // 2. Ăn trưa (11h - 14h)
      if (!hasLunch && currentHour >= 11 && currentHour < 14) {
          // Chọn nhà hàng
          let selectedLoc = null;
          if (selectedLocations.restaurants.length > 0) {
              selectedLoc = selectedLocations.restaurants.shift(); 
          }
          
          const duration = 60;
          
          // Tính toán di chuyển
          let dist = 0;
          if (prevLocation && selectedLoc) {
             dist = calculateDistance(prevLocation.lat, prevLocation.lng, selectedLoc.lat, selectedLoc.lng);
          }
          const transportCost = estimateItemCosts(selectedLoc || {}, transport, 'dining', numPeople, isLowBudget, dist);
          
          if (dist > 0.5) {
             const travelDuration = transportCost.transport.durationMin;
             currentTime = addMinutes(currentTime, travelDuration);
          }

          if (selectedLoc) {
              addItem({
                  timeStart: currentTime.toISOString(),
                  timeEnd: addMinutes(currentTime, duration).toISOString(),
                  locationId: selectedLoc.id,
                  title: selectedLoc.name,
                  type: 'restaurant',
                  activityType: 'dining',
                  address: selectedLoc.address,
                  duration: duration,
                  transport: transportCost.transport,
                  cost: { ticket: 0, food: transportCost.food, other: 0 },
                  notes: 'Thưởng thức đặc sản Đà Nẵng'
              });
          } else {
               // Fallback nếu hết nhà hàng trong list
               addItem({
                  timeStart: currentTime.toISOString(),
                  timeEnd: addMinutes(currentTime, duration).toISOString(),
                  locationId: 'lunch',
                  title: 'Ăn trưa',
                  type: 'food',
                  activityType: 'dining',
                  address: 'Nhà hàng địa phương',
                  duration: duration,
                  transport: null,
                  cost: { ticket: 0, food: isLowBudget ? 50000 * numPeople : 150000 * numPeople, other: 0 },
                  notes: 'Nghỉ ngơi và ăn trưa'
              });
          }
          hasLunch = true;
          
          // Nghỉ trưa (tùy chọn) - Chỉ thêm nếu không phải ngày cuối
          if (stayLocation && !isLastDay) { 
             const restStart = currentTime;
             const restEnd = addMinutes(restStart, 60); // Nghỉ 1 tiếng
             addItem({
                  timeStart: restStart.toISOString(),
                  timeEnd: restEnd.toISOString(),
                  locationId: stayLocation.id,
                  title: `Nghỉ trưa tại ${stayLocation.name}`,
                  type: 'accommodation',
                  activityType: 'rest',
                  address: stayLocation.address,
                  duration: 60,
                  transport: null,
                  cost: { ticket: 0, food: 0, other: 0 },
                  notes: 'Nghỉ ngơi lấy lại sức'
             });
          }
          continue;
      }

      // 3. Ăn xế (16h - 17h) - Chỉ nếu ngân sách không quá thấp
      if (!hasSnack && currentHour >= 16 && currentHour < 17 && !isLowBudget) {
          const duration = 30;
          addItem({
              timeStart: currentTime.toISOString(),
              timeEnd: addMinutes(currentTime, duration).toISOString(),
              locationId: 'snack',
              title: 'Ăn xế chiều',
              type: 'food',
              activityType: 'dining',
              address: 'Quán chè / Kem bơ / Bánh tráng kẹp',
              duration: duration,
              transport: null,
              cost: { ticket: 0, food: 30000 * numPeople, other: 0 },
              notes: 'Thưởng thức quà vặt Đà Nẵng'
          });
          hasSnack = true;
          continue;
      }

      // 4. Ăn tối (18h - 20h)
      if (!hasDinner && currentHour >= 18) {
           // Chọn nhà hàng
          let selectedLoc = null;
          if (selectedLocations.restaurants.length > 0) {
              selectedLoc = selectedLocations.restaurants.shift(); 
          }
          
          const duration = 90;
          
           // Tính toán di chuyển
          let dist = 0;
          if (prevLocation && selectedLoc) {
             dist = calculateDistance(prevLocation.lat, prevLocation.lng, selectedLoc.lat, selectedLoc.lng);
          }
          const transportCost = estimateItemCosts(selectedLoc || {}, transport, 'dining', numPeople, isLowBudget, dist);
          
          if (dist > 0.5) {
             const travelDuration = transportCost.transport.durationMin;
             currentTime = addMinutes(currentTime, travelDuration);
          }

          if (selectedLoc) {
              addItem({
                  timeStart: currentTime.toISOString(),
                  timeEnd: addMinutes(currentTime, duration).toISOString(),
                  locationId: selectedLoc.id,
                  title: selectedLoc.name,
                  type: 'restaurant',
                  activityType: 'dining',
                  address: selectedLoc.address,
                  duration: duration,
                  transport: transportCost.transport,
                  cost: { ticket: 0, food: transportCost.food, other: 0 },
                  notes: 'Ăn tối ấm cúng'
              });
          } else {
               addItem({
                  timeStart: currentTime.toISOString(),
                  timeEnd: addMinutes(currentTime, duration).toISOString(),
                  locationId: 'dinner',
                  title: 'Ăn tối',
                  type: 'food',
                  activityType: 'dining',
                  address: 'Khu vực ẩm thực đêm',
                  duration: duration,
                  transport: null,
                  cost: { ticket: 0, food: isLowBudget ? 60000 * numPeople : 150000 * numPeople, other: 0 },
                  notes: 'Khám phá ẩm thực đêm'
              });
          }
          hasDinner = true;
          continue;
      }
      
      // 5. Chọn Hoạt động (Tham quan, Vui chơi)
      let selectedLoc = null;
      let activityType = 'sightseeing';
      
      // Ưu tiên Day Trip (đi cả ngày) nếu là buổi sáng
      if (currentHour < 10 && !hasLunch) {
          const dayTripLoc = selectedLocations.attractions.find(l => l.suggestedDuration >= 240); // > 4 tiếng
          if (dayTripLoc) {
              selectedLoc = dayTripLoc;
              // Xóa khỏi danh sách để không chọn lại
              selectedLocations.attractions = selectedLocations.attractions.filter(l => l.id !== dayTripLoc.id);
              activityType = 'day-trip';
          }
      }

      // Nếu không phải Day Trip, chọn địa điểm phù hợp tiếp theo
      if (!selectedLoc && selectedLocations.attractions.length > 0) {
          // Tìm địa điểm phù hợp với giờ hiện tại
          const suitableIndex = selectedLocations.attractions.findIndex(l => isSuitableForTime(l, currentHour));
          
          if (suitableIndex !== -1) {
              selectedLoc = selectedLocations.attractions[suitableIndex];
              selectedLocations.attractions.splice(suitableIndex, 1);

              let duration = selectedLoc.suggestedDuration || 90;
              
              // Tính toán di chuyển
              let dist = 0;
              if (prevLocation) {
                  dist = calculateDistance(prevLocation.lat, prevLocation.lng, selectedLoc.lat, selectedLoc.lng);
              } else {
                  dist = calculateDistance(16.0544, 108.2022, selectedLoc.lat, selectedLoc.lng); // Mặc định từ trung tâm
              }
              
              const costs = estimateItemCosts(selectedLoc, transport, activityType, numPeople, isLowBudget, dist);
              
              // Cộng thời gian di chuyển
              if (dist > 0.5) {
                  const travelDuration = costs.transport.durationMin;
                  currentTime = addMinutes(currentTime, travelDuration);
              }

              // Xử lý Day Trip (bao gồm ăn trưa)
              if (activityType === 'day-trip') {
                  hasLunch = true; 
                  const minEnd = parseTimeOnDate(date, '16:00');
                  let potentialEnd = addMinutes(currentTime, duration);
                  if (potentialEnd < minEnd) potentialEnd = minEnd;
                  
                  addItem({
                      timeStart: currentTime.toISOString(),
                      timeEnd: potentialEnd.toISOString(),
                      locationId: selectedLoc.id,
                      title: selectedLoc.name,
                      type: selectedLoc.type,
                      activityType: 'day-trip',
                      address: selectedLoc.address,
                      duration: (potentialEnd - currentTime) / 60000,
                      transport: costs.transport,
                      cost: { ticket: (selectedLoc.ticket || 0) * numPeople, food: costs.food, other: 0 },
                      notes: 'Vui chơi trọn gói cả ngày (bao gồm ăn trưa)'
                  });
              } else {
                  // Hoạt động bình thường
                  addItem({
                      timeStart: currentTime.toISOString(),
                      timeEnd: addMinutes(currentTime, duration).toISOString(),
                      locationId: selectedLoc.id,
                      title: selectedLoc.name,
                      type: selectedLoc.type,
                      activityType: 'sightseeing',
                      address: selectedLoc.address,
                      duration: duration,
                      transport: costs.transport,
                      cost: { ticket: (selectedLoc.ticket || 0) * numPeople, food: costs.food, other: 0 },
                      notes: 'Tham quan & Khám phá'
                  });
              }
          } else {
              // Không tìm thấy địa điểm phù hợp giờ này, tua nhanh thời gian
              currentTime = addMinutes(currentTime, 30);
          }
      } else {
           // Hết địa điểm để đi, tua nhanh
           currentTime = addMinutes(currentTime, 30);
      }
  }

  // Xử lý Check-out và ra sân bay nếu là ngày cuối
  if (isLastDay && stayLocation) {
      // Check-out
      const checkOutTime = currentTime; 
      const checkOutDuration = 30;
      
      addItem({
          timeStart: checkOutTime.toISOString(),
          timeEnd: addMinutes(checkOutTime, checkOutDuration).toISOString(),
          locationId: stayLocation.id,
          title: `Check-out: ${stayLocation.name}`,
          type: 'accommodation',
          activityType: 'check-out',
          address: stayLocation.address,
          duration: checkOutDuration,
          transport: null,
          cost: { ticket: 0, food: 0, other: 0 }, // Đã thanh toán lúc check-in
          notes: 'Trả phòng và thanh toán chi phí phát sinh'
      });
      
      // Di chuyển ra sân bay
      const airportDist = calculateDistance(stayLocation.lat, stayLocation.lng, 16.0544, 108.2022);
      const airportTransport = estimateItemCosts(stayLocation, transport, 'departure', numPeople, isLowBudget, airportDist);
      
      const travelStart = addMinutes(checkOutTime, checkOutDuration);
      const travelEnd = addMinutes(travelStart, airportTransport.transport.durationMin);
      
      addItem({
          timeStart: travelStart.toISOString(),
          timeEnd: travelEnd.toISOString(),
          locationId: 'airport',
          title: 'Di chuyển ra Sân bay / Bến xe',
          type: 'transport',
          activityType: 'departure',
          address: 'Sân bay Quốc tế Đà Nẵng / Bến xe Trung tâm',
          duration: airportTransport.transport.durationMin,
          transport: airportTransport.transport,
          cost: { ticket: 0, food: 0, other: 0 },
          notes: 'Kết thúc hành trình. Hẹn gặp lại!'
      });
  } else if (stayLocation && (!leaveDateObj || dayIndex < getDaysBetween(arriveDateObj, leaveDateObj) - 1)) {
      // Thêm item Nghỉ đêm (nếu không phải ngày cuối)
      const lastItem = items[items.length - 1];
      const overnightStart = lastItem ? lastItem.timeEnd : parseTimeOnDate(date, '22:00').toISOString();
      
      items.push({
          timeStart: overnightStart,
          timeEnd: overnightStart, 
          locationId: stayLocation.id,
          title: `Nghỉ đêm tại ${stayLocation.name}`,
          type: 'accommodation',
          area: stayLocation.area,
          lat: stayLocation.lat,
          lng: stayLocation.lng,
          activityType: 'rest',
          address: stayLocation.address,
          duration: 0,
          transport: null,
          cost: { ticket: 0, food: 0, other: 0 },
          notes: 'Nghỉ ngơi nạp năng lượng'
      });
  }
  
  return items;
}

/**
 * Ước tính chi phí cho một hoạt động.
 * Bao gồm chi phí di chuyển (transport) và ăn uống (food).
 * 
 * @param {Object} location - Địa điểm.
 * @param {string} transportMode - Phương tiện (taxi, grab...).
 * @param {string} activityType - Loại hoạt động (dining, sightseeing...).
 * @param {number} numPeople - Số người.
 * @param {boolean} isLowBudget - Ngân sách thấp hay không.
 * @param {number} distanceKm - Khoảng cách di chuyển (km).
 * @returns {Object} - Chi phí chi tiết.
 */
function estimateItemCosts(location, transportMode, activityType, numPeople, isLowBudget = false, distanceKm = 0) {
    // 1. Chi phí di chuyển
    let transportCost = 0;
    let travelDuration = 15; // Mặc định 15 phút

    // Mặc định là taxi nếu không chọn
    const mode = transportMode || 'taxi';
    const transportConfig = TRANSPORT_COSTS[mode] || TRANSPORT_COSTS['taxi'];
    
    // Tính tốc độ và thời gian
    const speed = transportConfig.speed || 30; // km/h
    travelDuration = Math.max(15, Math.round((distanceKm / speed) * 60));

    // Tính tiền xe
    if (mode === 'grab-bike' || mode === 'grab-car' || mode === 'taxi') {
        const vehicles = Math.ceil(numPeople / transportConfig.capacity);
        const costPerVehicle = transportConfig.base + (distanceKm * transportConfig.perKm);
        transportCost = costPerVehicle * vehicles;
    } else if (mode === 'public') {
        transportCost = transportConfig.base * numPeople; // Vé xe buýt tính theo người
    } else {
        // Rent/Own: Chi phí tính theo ngày ở budget service, không tính theo chuyến
        transportCost = 0; 
    }

    // 2. Chi phí ăn uống
    let foodCost = 0;
    if (activityType === 'dining' || activityType === 'day-trip') {
        const mealCost = isLowBudget ? 50000 : 150000; // 50k hoặc 150k/người
        foodCost = mealCost * numPeople;
    }

    return {
        ticket: 0,
        food: foodCost,
        other: 0,
        transport: { 
            durationMin: travelDuration, 
            cost: roundToStep(transportCost),
            mode: mode
        }
    };
}

/**
 * Kiểm tra xem địa điểm có phù hợp với thời gian hiện tại không.
 *
 * @param {Object} location - Địa điểm cần kiểm tra.
 * @param {number} hour - Giờ hiện tại (0-23).
 * @returns {boolean} - True nếu phù hợp, False nếu không.
 */
function isSuitableForTime(location, hour) {
    // Logic cơ bản: Không đi chợ đêm vào buổi sáng, v.v.
    if (location.type === 'bar' || location.type === 'pub') {
        return hour >= 18; // Bar/Pub chỉ đi sau 18h
    }
    if (location.name && location.name.toLowerCase().includes('chợ đêm')) {
        return hour >= 17; // Chợ đêm mở sau 17h
    }
    // Bảo tàng thường đóng cửa lúc 17:00
    if (location.type === 'museum') {
        return hour >= 8 && hour < 16;
    }
    return true;
}