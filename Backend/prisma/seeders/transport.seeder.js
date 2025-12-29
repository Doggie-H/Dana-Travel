
import { transport } from '../data/transport.js';
import { randomUUID } from 'crypto';

export const seedTransport = async (prisma) => {
  console.log('Seeding Transport...');
  for (const trans of transport) {
    await prisma.transport.create({
      data: {
        id: `PT_${randomUUID()}`,
        name: trans.name,
        type: trans.type,
        basePrice: trans.basePrice,
        pricePerKm: trans.pricePerKm,
        description: trans.description
      }
    });

    console.log(`Created Transport: ${trans.name}`);
  }
  console.log(`Seeded ${transport.length} transport options\n`);
};
