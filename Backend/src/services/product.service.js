import prisma from "../utils/prisma.js";

export const getAllProducts = async () => {
  return await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: { category: true },
  });
};

export const getProductById = async (id) => {
  return await prisma.product.findUnique({
    where: { id },
    include: { category: true },
  });
};

export const createProduct = async (productData) => {
  // Ensure price is a float
  const data = {
    ...productData,
    price: Number(productData.price),
  };
  return await prisma.product.create({
    data,
  });
};

export const updateProduct = async (id, updates) => {
  const data = { ...updates };
  if (data.price) data.price = Number(data.price);

  return await prisma.product.update({
    where: { id },
    data,
  });
};

export const deleteProduct = async (id) => {
  try {
    await prisma.product.delete({
      where: { id },
    });
    return true;
  } catch (error) {
    return false;
  }
};
