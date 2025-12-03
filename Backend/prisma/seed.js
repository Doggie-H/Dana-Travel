import { PrismaClient } from '@prisma/client';
import { locations } from './data/locations.js';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  try {
    // Xóa dữ liệu cũ
    await prisma.location.deleteMany();
    console.log('Deleted old locations');

    // Insert dữ liệu mới
    let count = 0;
    for (const loc of locations) {
      // Handle tags: ensure it's a string (JSON)
      let tagsString = '[]';
      if (Array.isArray(loc.tags)) {
        tagsString = JSON.stringify(loc.tags);
      } else if (typeof loc.tags === 'string') {
        tagsString = loc.tags;
      }

      // Handle menu: ensure it's a string (JSON)
      let menuString = null;
      if (loc.menu) {
          if (typeof loc.menu === 'object') {
              menuString = JSON.stringify(loc.menu);
          } else {
              menuString = loc.menu;
          }
      }

      await prisma.location.create({
        data: {
          id: loc.id,
          name: loc.name,
          type: loc.type,
          area: loc.area,
          address: loc.address,
          lat: loc.lat,
          lng: loc.lng,
          ticket: loc.ticket || 0,
          indoor: loc.indoor || false,
          priceLevel: loc.priceLevel,
          tags: tagsString,
          suggestedDuration: loc.suggestedDuration,
          menu: menuString,
          description: loc.description,
        },
      });
      count++;
    }

    console.log(`Seeded ${count} locations successfully.`);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
