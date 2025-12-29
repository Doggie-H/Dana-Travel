
export const seedClean = async (prisma) => {
  console.log('Cleaning old data...');
  await prisma.knowledgeBase.deleteMany();
  await prisma.location.deleteMany();
  await prisma.transportation.deleteMany();
  await prisma.account.deleteMany(); // Force clean to regenerate UUID
  console.log('Cleaned old data\n');
};
