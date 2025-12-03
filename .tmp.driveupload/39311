import prisma from "../utils/prisma.js";

export const getAllCategories = async () => {
  return await prisma.category.findMany({
    orderBy: { createdAt: "desc" },
  });
};

export const getCategoryById = async (id) => {
  return await prisma.category.findUnique({
    where: { id },
  });
};

export const createCategory = async (categoryData) => {
  return await prisma.category.create({
    data: categoryData,
  });
};

export const updateCategory = async (id, updates) => {
  return await prisma.category.update({
    where: { id },
    data: updates,
  });
};

export const deleteCategory = async (id) => {
  try {
    await prisma.category.delete({
      where: { id },
    });
    return true;
  } catch (error) {
    return false;
  }
};
