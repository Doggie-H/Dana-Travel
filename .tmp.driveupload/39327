import prisma from "../utils/prisma.js";

export const getAllMenus = async () => {
  return await prisma.menu.findMany({
    orderBy: { order: "asc" },
  });
};

export const createMenu = async (menuData) => {
  return await prisma.menu.create({
    data: {
      ...menuData,
      order: Number(menuData.order) || 0,
    },
  });
};

export const updateMenu = async (id, updates) => {
  const data = { ...updates };
  if (data.order) data.order = Number(data.order);

  return await prisma.menu.update({
    where: { id },
    data,
  });
};

export const deleteMenu = async (id) => {
  try {
    await prisma.menu.delete({
      where: { id },
    });
    return true;
  } catch (error) {
    return false;
  }
};
