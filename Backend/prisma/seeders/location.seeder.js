/**
 * LOCATION SEEDER
 * 
 * Nạp dữ liệu địa điểm du lịch vào database.
 * Dữ liệu được lấy từ `data/index.js` (tổng hợp từ nhiều nguồn).
 */
import { newLocations } from '../data/index.js';
import { randomUUID } from 'crypto';

export const seedLocations = async (prisma) => {
  console.log('Seeding Locations...');

  for (const loc of newLocations) {
    const locId = `KV_${randomUUID()}`;
    await prisma.location.create({
      data: {
        id: locId,
        name: loc.name,
        type: loc.type,
        area: "Đà Nẵng",
        address: loc.address,
        lat: loc.lat,
        lng: loc.lng,
        ticket: loc.ticket,
        priceLevel: loc.priceLevel,
        description: loc.description,
        tags: JSON.stringify(loc.tags),
        indoor: false,
        openTime: loc.operatingHours ? `${loc.operatingHours.start}:00` : "00:00",
        closeTime: loc.operatingHours ? `${loc.operatingHours.end}:00` : "24:00",
        suggestedDuration: 90,
        visitType: loc.visitType,
        menu: JSON.stringify([
          { name: "Chi phí ăn uống trung bình", price: loc.food || 0 },
          { name: "Chi phí phát sinh", price: loc.extra || 0 }
        ])
      }
    });

    console.log(`Created: [${locId}] ${loc.name}`);
  }
  console.log(`Seeded ${newLocations.length} locations\n`);
};
