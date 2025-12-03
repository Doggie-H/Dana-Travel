import prisma from "../utils/prisma.js";

export const getAllKnowledge = async () => {
  return await prisma.knowledge.findMany();
};

export const addKnowledge = async (data) => {
  return await prisma.knowledge.create({ data });
};

export const updateKnowledge = async (id, data) => {
  return await prisma.knowledge.update({
    where: { id },
    data
  });
};

export const deleteKnowledge = async (id) => {
  try {
    await prisma.knowledge.delete({ where: { id } });
    return true;
  } catch (error) {
    return false;
  }
};

export const findKnowledge = async (query) => {
  // Simple keyword search
  return await prisma.knowledge.findFirst({
    where: {
      OR: [
        { question: { contains: query } },
        { keywords: { contains: query } }
      ]
    }
  });
};

export const matchKnowledge = async (query) => {
  const item = await findKnowledge(query);
  if (item) {
    return { reply: item.answer };
  }
  return null;
};
