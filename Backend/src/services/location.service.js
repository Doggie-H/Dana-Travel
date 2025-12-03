import prisma from "../utils/prisma.js";

export const getAllLocations = async (filters = {}) => {
  const where = {};

  if (filters.type) where.type = filters.type;
  if (filters.indoor !== undefined) where.indoor = filters.indoor;
  if (filters.priceLevel) where.priceLevel = filters.priceLevel;
  if (filters.search) {
    where.name = { contains: filters.search };
  }

  const locations = await prisma.location.findMany({ where });
  return locations.map(loc => ({
    ...loc,
    tags: loc.tags ? JSON.parse(loc.tags) : [],
    menu: loc.menu ? JSON.parse(loc.menu) : null,
  }));
};

export const getLocationById = async (id) => {
  const loc = await prisma.location.findUnique({ where: { id } });
  if (!loc) return null;
  return {
    ...loc,
    tags: loc.tags ? JSON.parse(loc.tags) : [],
    menu: loc.menu ? JSON.parse(loc.menu) : null,
  };
};

export const createLocation = async (data) => {
  return await prisma.location.create({
    data: {
      ...data,
      tags: JSON.stringify(data.tags || []),

    }
  });
};

export const updateLocation = async (id, updates) => {
  const data = { ...updates };
  if (data.tags) data.tags = JSON.stringify(data.tags);


  return await prisma.location.update({
    where: { id },
    data
  });
};

export const deleteLocation = async (id) => {
  try {
    await prisma.location.delete({ where: { id } });
    return true;
  } catch (error) {
    return false;
  }
};


