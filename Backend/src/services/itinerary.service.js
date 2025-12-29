/**
 * =================================================================================================
 * ITINERARY SERVICE - TRÌNH ĐIỀU PHỐI LỊCH TRÌNH
 * =================================================================================================
 *
 * Service này đóng vai trò là "Nhạc trưởng" (Orchestrator).
 * Nhiệm vụ:
 * 1. Tiếp nhận yêu cầu từ User (Input).
 * 2. Chuẩn bị dữ liệu cần thiết (Locations, Budget, Hotel).
 * 3. Điều phối việc lập lịch cho từng ngày (gọi schedule-generator).
 * 4. Đóng gói kết quả và trả về (Output).
 */

import { getAllLocations } from "./location.service.js";
import { randomUUID } from "crypto";
import { TRANSPORT_COSTS as DEFAULT_TRANSPORT_COSTS } from "../config/app.constants.js";
import {
  validateBudgetFeasibility,
} from "../utils/itinerary.validator.js";
import {
  getDaysBetween,
  roundToStep,
} from "../utils/format.util.js";
import {
  generateDayScheduleStrict
} from "../utils/schedule.generator.js";
import {
  resolveAccommodation,
  calculateAccommodationCost,
  getBudgetStatus,
  formatDate,
  createErrorDay
} from "../utils/itinerary.helper.js"; // Updated Import
import prisma from "../config/prisma.client.js";

/**
 * =================================================================================================
 * MAIN FLOW
 * =================================================================================================
 */
export const generateItinerary = async (userRequest) => {
  // --- BƯỚC 1: TIẾP NHẬN & PHÂN TÍCH INPUT ---
  const {
    budgetTotal,
    numPeople,
    arriveDateTime,
    leaveDateTime,
    transport,
    accommodation,
    preferences = [],
  } = userRequest;

  const startDate = new Date(arriveDateTime);
  const endDate = new Date(leaveDateTime);
  const numDays = getDaysBetween(startDate, endDate) + 1;

  console.log(`\n=== BẮT ĐẦU TẠO LỊCH TRÌNH (${numDays} ngày) ===`);
  console.log(`Budget: ${parseFloat(budgetTotal).toLocaleString()}đ | Khách: ${numPeople}`);


  // --- BƯỚC 2: KIỂM TRA TÍNH KHẢ THI (VALIDATION) ---
  const hasOwnTransport = transport === "own" || transport === "rent";
  const budgetCheck = validateBudgetFeasibility(
    budgetTotal,
    numPeople,
    numDays,
    0,
    hasOwnTransport
  );

  if (!budgetCheck.valid) {
    console.warn("Validation Failed:", budgetCheck.message);
    throw { statusCode: 400, message: budgetCheck.message };
  }


  // --- BƯỚC 3: CHUẨN BỊ DỮ LIỆU (PREPARATION) ---
  const allLocations = await getAllLocations();
  const hotels = allLocations.filter(l => ["hotel", "homestay", "resort", "guesthouse"].includes(l.type));

  // 3.1 Fetch Transportation from DB & Map to Config
  const dbTransports = await prisma.transportation.findMany();
  const transportCosts = { ...DEFAULT_TRANSPORT_COSTS }; // Copy defaults (contains 'own')

  dbTransports.forEach(t => {
    // Map DB name to Config Keys
    let key = null;
    if (t.name === "Grab Bike") key = "grab-bike";
    else if (t.name === "Xanh SM Bike") key = "xanh-bike";
    else if (t.name === "Grab Car 4 chỗ") key = "grab-car-4";
    else if (t.name === "Xanh SM Taxi") key = "xanh-car-4";
    else if (t.name === "Grab Car 7 chỗ") key = "grab-car-7";
    else if (t.name === "Xanh SM Luxury") key = "xanh-car-7";

    if (key) {
      transportCosts[key] = {
        base: t.basePrice,
        perKm: t.pricePerKm,
        speed: 30, // Default fallback
        label: t.name,
        // Preserve other props if needed or fallback
        capacity: t.type === 'car7' ? 7 : (t.type === 'car4' ? 4 : 1)
      };
      // Adjust speeds based on type
      if (t.type.includes('car')) transportCosts[key].speed = 40;
    }
  });


  // --- BƯỚC 4: XÁC ĐỊNH NƠI Ở (ACCOMMODATION) ---
  const dailyBudget = budgetTotal / numDays;
  const selectedHotel = resolveAccommodation(accommodation, hotels, dailyBudget, numPeople);

  const accommodationCost = calculateAccommodationCost(selectedHotel, accommodation, numDays, numPeople);

  let remainingBudget = budgetTotal - accommodationCost;
  const dailyPlayBudget = remainingBudget / numDays;

  console.log(`Nơi ở: ${selectedHotel.name} | Chi phí ở: ${accommodationCost.toLocaleString()}đ`);
  console.log(`Ngân sách ăn chơi/ngày: ${dailyPlayBudget.toLocaleString()}đ`);


  // --- BƯỚC 5: TẠO LỊCH TRÌNH CHI TIẾT (GENERATION LOOP) ---
  const itinerary = {
    id: `trip-${Date.now()}`,
    name: `Lịch trình Đà Nẵng ${numDays}N${numDays - 1}Đ`,
    totalCost: accommodationCost,
    days: [],
  };

  const usedLocationIds = new Set([selectedHotel.id]);

  for (let i = 0; i < numDays; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);

    // Xác định giờ giấc linh hoạt
    let startTime = preferences.some(p => ['beach', 'nature', 'mountain'].includes(p)) ? 6 : 7.5;
    let endTime = 22.5;

    if (i === 0) startTime = Math.max(startTime, startDate.getHours() + (startDate.getMinutes() / 60));
    if (i === numDays - 1) endTime = Math.min(endTime, endDate.getHours() + (endDate.getMinutes() / 60));

    try {
      const daySchedule = await generateDayScheduleStrict({
        date: currentDate,
        startTime,
        endTime,
        allLocations,
        usedLocationIds,
        transport,
        numPeople,
        dailyBudget: dailyPlayBudget,
        hotel: selectedHotel,
        hotelType: selectedHotel.type,
        isFirstDay: i === 0,
        isLastDay: i === numDays - 1,
        preferences,
        accommodationCost,
        transportCosts
      });

      // Update Total Cost
      daySchedule.items.forEach(item => {
        if (item.location) usedLocationIds.add(item.location.id);
        if (item.type !== 'accommodation' && item.type !== 'check-in') {
          itinerary.totalCost += (item.cost?.ticket || 0) + (item.cost?.food || 0) + (item.transport?.cost || 0);
        }
      });

      itinerary.days.push({
        day: i + 1,
        date: formatDate(currentDate),
        items: daySchedule.items
      });
    } catch (error) {
      console.error(`Lỗi tạo lịch ngày ${i + 1}:`, error);
      import('fs').then(fs => fs.writeFileSync('SERVICE_ERROR.log', error.stack || error.toString()));
      itinerary.days.push(createErrorDay(i + 1, currentDate, startTime, endTime));
    }
  }


  // --- BƯỚC 6: HOÀN TẤT (FINALIZE) ---
  const finalItinerary = {
    ...itinerary,
    totalCost: roundToStep(itinerary.totalCost, 1000),
    budgetStatus: getBudgetStatus(itinerary.totalCost, budgetTotal),
  };

  trackSearchHistory(preferences, numPeople, budgetTotal, numDays); // Fire and forget log

  return finalItinerary;
};

// --- SILENT TRACKING HELPER ---
async function trackSearchHistory(preferences, numPeople, budget, numDays) {
  try {
    const tags = preferences && preferences.length > 0 ? preferences : ["General"];
    await prisma.searchQuery.create({
      data: {
        id: `XH_${randomUUID()}`,
        tags: JSON.stringify(tags),
        duration: `${numDays} ngày`,
        budget: parseFloat(budget),
        people: parseInt(numPeople)
      }
    });
  } catch (e) { /* Ignore log error */ }
}
