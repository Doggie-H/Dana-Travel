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

function addMinutes(time, durationMin) {
  const result = new Date(time);
  result.setMinutes(result.getMinutes() + durationMin);
  return result;
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

export async function generateItinerary(userRequest) {
  const {
    budgetTotal,
    numPeople,
    arriveDateTime,
    leaveDateTime,
    transport,
    accommodation,
    preferences = [],
  } = userRequest;

  const numDays = getDaysBetween(arriveDateTime, leaveDateTime);
  const dateRange = generateDateRange(arriveDateTime, leaveDateTime);
  const arriveDateObj = new Date(arriveDateTime);
  const leaveDateObj = new Date(leaveDateTime);

  const isLowBudget = (budgetTotal / numPeople / numDays) < 1000000;

  const budgetBreakdown = calculateBudgetBreakdown({
    budgetTotal,
    numPeople,
    numDays,
    accommodation,
    transport,
  });

  const allLocations = await getAllLocations();

  let stayLocation = null;
  if (accommodation !== 'free' && accommodation !== 'own') {
      let suitableStays = allLocations.filter(l => 
          l.type === 'accommodation' && 
          Array.isArray(l.tags) && 
          l.tags.includes(accommodation)
      );
      
      if (suitableStays.length === 0) {
          suitableStays = allLocations.filter(l => l.type === 'accommodation');
      }
      
      if (suitableStays.length > 0) {
          stayLocation = suitableStays[0]; 
      }
  }

  function selectLocationsByPreferences(locations, prefs, days, lowBudget) {
      const scored = locations.map(loc => {
          let score = 0;
          if (loc.tags) {
              prefs.forEach(p => {
                  if (loc.tags.includes(p)) score += 2;
                  // Boost camping locations if preference exists
                  if (p === 'camping' && loc.tags.includes('camping')) score += 3;
              });
          }
          if (lowBudget && loc.priceLevel === 'cheap') score += 1;
          return { ...loc, score };
      });
      
      scored.sort((a, b) => b.score - a.score);
      
      return {
          attractions: scored.filter(l => l.type === 'attraction' || l.type === 'nature' || l.type === 'culture'),
          restaurants: scored.filter(l => l.type === 'restaurant' || l.type === 'food'),
          others: scored.filter(l => l.type === 'cafe' || l.type === 'bar')
      };
  }

  const selectedLocations = selectLocationsByPreferences(allLocations, preferences, numDays, isLowBudget);

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
      date: toTimeString(dateRange[i]).split(' ')[0], // Simple date string
      items: dayItems,
    });
  }

  const summary = summarizeBudget({ days }, budgetTotal, numPeople);

  // --- SAVE TREND DATA ---
  try {
    // Calculate duration string
    const durationText = `${numDays} ngày ${numDays - 1} đêm`;
    
    // Save to DB (Fire and forget)
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
  // -----------------------

  return {
    days,
    summary: {
        ...summary,
        totalCost: summary.estimatedTotal // Alias for compatibility
    }
  };
}

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
  const dayItems = [];
  
  let currentTime;
  let endTimeLimit = parseTimeOnDate(date, '22:00');
  let isLastDay = false;

  if (dayIndex === 0 && arriveDateObj) {
      const arrivalTime = new Date(arriveDateObj);
      currentTime = addMinutes(arrivalTime, 60); 
  } else {
      if (preferences.includes('beach') || preferences.includes('nature') || preferences.includes('camping')) {
          currentTime = parseTimeOnDate(date, '05:30');
      } else if (preferences.includes('photo') || preferences.includes('culture')) {
          currentTime = parseTimeOnDate(date, '06:30');
      } else {
          currentTime = parseTimeOnDate(date, '07:30');
      }
  }

  if (leaveDateObj) {
      const daysDiff = getDaysBetween(currentTime, leaveDateObj);
      if (daysDiff <= 1) {
           isLastDay = true;
           const departureTime = new Date(leaveDateObj);
           endTimeLimit = addMinutes(departureTime, -150);
      }
  }

  let hasBreakfast = false;
  let hasLunch = false;
  let hasSnack = false;
  let hasDinner = false;
  let prevLocation = stayLocation; 

  const addItem = (item) => {
      items.push(item);
      dayItems.push(item);
      prevLocation = { lat: item.lat, lng: item.lng, name: item.title, id: item.locationId };
      currentTime = new Date(item.timeEnd);
  };

  let safetyLoop = 0;
  while (currentTime < endTimeLimit && safetyLoop < 25) {
      safetyLoop++;
      // Fix: Calculate currentHour in Vietnam Time (UTC+7)
      const currentHour = (currentTime.getUTCHours() + 7) % 24;

      // Breakfast (Before 9 AM)
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

      // Lunch (11:30 - 13:30)
      if (!hasLunch && currentHour >= 11 && currentHour < 14) {
          // Pick Restaurant
          let selectedLoc = null;
          if (selectedLocations.restaurants.length > 0) {
              selectedLoc = selectedLocations.restaurants.shift(); 
          }
          
          const duration = 60;
          
          // Calculate travel
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
          
          // Add Rest after Lunch (optional) - Only if not last day or plenty of time
          if (stayLocation && !isLastDay) { 
             const restStart = currentTime;
             const restEnd = addMinutes(restStart, 60); // 1h rest
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

      // Afternoon Snack (Ăn xế) (16:00 - 17:00) - Only if budget allows
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

      // Dinner (18:00 - 20:00)
      if (!hasDinner && currentHour >= 18) {
           // Pick Restaurant
          let selectedLoc = null;
          if (selectedLocations.restaurants.length > 0) {
              selectedLoc = selectedLocations.restaurants.shift(); 
          }
          
          const duration = 90;
          
           // Calculate travel
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
      
      // 2. Activity Selection
      let selectedLoc = null;
      let activityType = 'sightseeing';
      
      // Try to pick Day Trip if morning
      if (currentHour < 10 && !hasLunch) {
          const dayTripLoc = selectedLocations.attractions.find(l => l.suggestedDuration >= 240);
          if (dayTripLoc) {
              selectedLoc = dayTripLoc;
              selectedLocations.attractions = selectedLocations.attractions.filter(l => l.id !== dayTripLoc.id);
              activityType = 'day-trip';
          }
      }

      // Pick next attraction that is SUITABLE for current time
      if (!selectedLoc && selectedLocations.attractions.length > 0) {
          // Find first suitable location
          const suitableIndex = selectedLocations.attractions.findIndex(l => isSuitableForTime(l, currentHour));
          
          if (suitableIndex !== -1) {
              selectedLoc = selectedLocations.attractions[suitableIndex];
              selectedLocations.attractions.splice(suitableIndex, 1);

              let duration = selectedLoc.suggestedDuration || 90;
              
              // Calculate travel
              let dist = 0;
              if (prevLocation) {
                  dist = calculateDistance(prevLocation.lat, prevLocation.lng, selectedLoc.lat, selectedLoc.lng);
              } else {
                  dist = calculateDistance(16.0544, 108.2022, selectedLoc.lat, selectedLoc.lng);
              }
              
              const costs = estimateItemCosts(selectedLoc, transport, activityType, numPeople, isLowBudget, dist);
              
              // Add Travel Time
              if (dist > 0.5) {
                  const travelDuration = costs.transport.durationMin;
                  currentTime = addMinutes(currentTime, travelDuration);
              }

              // Check if Day Trip
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
                  // Normal Activity
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
              // No suitable location found, advance time to avoid infinite loop
              currentTime = addMinutes(currentTime, 30);
          }
      }

  if (isLastDay && stayLocation) {
      // Add Check-out Item
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
          cost: { ticket: 0, food: 0, other: 0 }, // Paid at check-in
          notes: 'Trả phòng và thanh toán chi phí phát sinh'
      });
      
      // Add Travel to Airport/Station
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
      // Add Overnight Stay item (if not the last day)
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

function estimateItemCosts(location, transportMode, activityType, numPeople, isLowBudget = false, distanceKm = 0) {
    // 1. Transport Cost
    let transportCost = 0;
    let travelDuration = 15; // Default

    // Default to taxi if undefined
    const mode = transportMode || 'taxi';
    const transportConfig = TRANSPORT_COSTS[mode] || TRANSPORT_COSTS['taxi'];
    
    // Calculate speed and duration
    const speed = transportConfig.speed || 30; // km/h
    travelDuration = Math.max(15, Math.round((distanceKm / speed) * 60));

    // Calculate cost
    if (mode === 'grab-bike' || mode === 'grab-car' || mode === 'taxi') {
        const vehicles = Math.ceil(numPeople / transportConfig.capacity);
        const costPerVehicle = transportConfig.base + (distanceKm * transportConfig.perKm);
        transportCost = costPerVehicle * vehicles;
    } else if (mode === 'public') {
        transportCost = transportConfig.base * numPeople; // Per person
    } else {
        // Rent/Own: Cost is calculated per day in budget service, not per trip
        transportCost = 0; 
    }

    // 2. Food Cost
    let foodCost = 0;
    if (activityType === 'dining' || activityType === 'day-trip') {
        const mealCost = isLowBudget ? 50000 : 150000;
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

function isSuitableForTime(location, hour) {
    // Basic logic: Don't visit night markets in morning, etc.
    if (location.type === 'bar' || location.type === 'pub') {
        return hour >= 18;
    }
    if (location.name && location.name.toLowerCase().includes('chợ đêm')) {
        return hour >= 17;
    }
    // Museums usually close at 17:00
    if (location.type === 'museum') {
        return hour >= 8 && hour < 16;
    }
    return true;
}
}
