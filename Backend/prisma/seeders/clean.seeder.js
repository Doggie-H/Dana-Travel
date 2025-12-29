
export const seedClean = async (prisma) => {
  console.log('Cleaning old data...');
  await prisma.knowledge.deleteMany();
  await prisma.location.deleteMany();
  await prisma.transport.deleteMany();
  await prisma.admin.deleteMany(); // Force clean to regenerate UUID
  console.log('Cleaned old data\n');
};
