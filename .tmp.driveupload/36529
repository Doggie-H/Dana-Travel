
import { generateItinerary } from './src/services/itinerary.service.js';

async function runTest(caseName, request) {
    console.log(`\n--- TEST CASE: ${caseName} ---`);
    try {
        const result = await generateItinerary(request);
        printDaySummary(result);
    } catch (e) {
        console.error(`Error ${caseName}:`, e);
    }
}

async function main() {
    console.log("=== STARTING ITINERARY LOGIC TEST ===");

    // Case 1: Early Arrival, Low Budget, Beach Preference
    await runTest("Early Arrival (7AM), Low Budget, Beach", {
        budgetTotal: 5000000,
        numPeople: 2,
        arriveDateTime: '2025-06-01T07:00:00',
        leaveDateTime: '2025-06-03T14:00:00',
        transport: 'motorbike',
        accommodation: 'hotel',
        preferences: ['beach', 'nature']
    });

    // Case 2: Late Arrival, High Budget, Nightlife
    await runTest("Late Arrival (2PM), High Budget, Nightlife", {
        budgetTotal: 50000000,
        numPeople: 2,
        arriveDateTime: '2025-06-01T14:00:00',
        leaveDateTime: '2025-06-03T20:00:00',
        transport: 'taxi',
        accommodation: 'resort',
        preferences: ['nightlife', 'luxury']
    });

    // Case 3: Camping Trip
    await runTest("Camping Trip", {
        budgetTotal: 3000000,
        numPeople: 4,
        arriveDateTime: "2025-06-01T06:00:00",
        leaveDateTime: "2025-06-02T18:00:00",
        transport: "rental-bike",
        accommodation: "homestay", // Should be ignored if camping logic overrides, or used as base
        preferences: ["camping", "nature", "adventure"],
    });
}

function printDaySummary(itinerary) {
    itinerary.days.forEach(day => {
        console.log(`\nDay ${day.dayNumber} (${day.date}):`);
        if (day.items.length === 0) {
            console.log("  [Empty Schedule]");
            return;
        }
        const firstItem = day.items[0];
        const lastItem = day.items[day.items.length - 1];
        
        console.log(`  Start: ${formatTime(firstItem.timeStart)} - ${firstItem.title}`);
        console.log(`  End:   ${formatTime(lastItem.timeEnd)} - ${lastItem.title}`);
        
        // Check for specific items
        const hasSnack = day.items.find(i => i.title.includes('Ăn xế'));
        if (hasSnack) console.log(`  -> Has Snack: Yes (${formatTime(hasSnack.timeStart)})`);
        
        const hasBar = day.items.find(i => i.title.includes('Bar') || i.title.includes('Club') || i.title.includes('Pub'));
        if (hasBar) console.log(`  -> Has Bar: Yes (${hasBar.title} - ${hasBar.cost.food.toLocaleString()} VND)`);

        const hasCamping = day.items.find(i => i.tags && i.tags.includes('camping')); // Note: tags might not be on item unless passed through
        // Check title for camping locations
        const campingLocs = ["Ghềnh Bàng", "Bãi Đa", "Giếng Trời", "Hồ Đồng Xanh", "Bãi Tiên Sa"];
        const campingItem = day.items.find(i => campingLocs.some(c => i.title.includes(c)));
        if (campingItem) console.log(`  -> Camping Spot: ${campingItem.title}`);

        // Check Start Time Logic
        const startHour = new Date(firstItem.timeStart).getHours();
        console.log(`  -> Start Hour: ${startHour}h`);
    });
    console.log(`\nTotal Cost: ${itinerary.summary.totalCost.toLocaleString()} VND`);
}

function formatTime(isoString) {
    const d = new Date(isoString);
    return `${d.getHours()}:${d.getMinutes().toString().padStart(2, '0')}`;
}

main();
