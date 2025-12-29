
import { randomUUID } from 'crypto';

export const seedAdmin = async (prisma) => {
  console.log('Creating Admin...');
  const adminPassword = 'admin123'; // Plain text as requested

  await prisma.account.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      id: `TK_${randomUUID()}`,
      username: 'admin',
      passwordHash: adminPassword,
      email: 'admin@danatravel.com',
      role: 'admin',
      active: true
    }
  });
  console.log('Created Admin: admin / admin123\n');
};
