
/**
 * DATABASE SEED SCRIPT
 * 
 * Script khởi tạo dữ liệu mẫu cho Database.
 * Chạy lệnh: `npx prisma db seed`
 */

import { PrismaClient } from '@prisma/client';
import { seedClean } from './seeders/clean.seeder.js';
import { seedAdmin } from './seeders/admin.seeder.js';
import { seedKnowledge } from './seeders/knowledge.seeder.js';
import { seedLocations } from './seeders/location.seeder.js';
import { seedTransport } from './seeders/transport.seeder.js';
import { seedSystem } from './seeders/system.seeder.js';

const prisma = new PrismaClient();

async function main() {
  console.log('Bắt đầu khởi tạo dữ liệu mẫu (Seeding)...\n');

  try {
    // 1. Clean Data
    await seedClean(prisma);

    // 2. Create Admin
    await seedAdmin(prisma);

    // 3. Seed Knowledge Base
    await seedKnowledge(prisma);

    // 4. Seed Locations
    await seedLocations(prisma);

    // 5. Seed Transport
    await seedTransport(prisma);

    // 6. Seed System Settings & Prompts
    await seedSystem(prisma);

    console.log('Seeding completed successfully!');
  } catch (e) {
    console.error('Error during seeding:', e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
