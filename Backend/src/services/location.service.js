/**
 * =================================================================================================
 * LOCATION SERVICE - QUẢN LÝ DỮ LIỆU ĐỊA ĐIỂM
 * =================================================================================================
 * 
 * Nhiệm vụ:
 * 1. Tương tác trực tiếp với Database (Prisma) để lấy/ghi dữ liệu địa điểm.
 * 2. Xử lý logic chuyển đổi dữ liệu (JSON Parsing for Tags/Menu).
 */

import prisma from "../config/prisma.client.js";
import { randomUUID } from "crypto";

/**
 * =================================================================================================
 * PUBLIC API (CRUD)
 * =================================================================================================
 */

// 1. Get All (với Filter optional)
export const getAllLocations = async (filters = {}) => {
  const where = buildFilterCondition(filters);
  const locations = await prisma.location.findMany({ where });
  return locations.map(transformLocationData);
};

// 2. Get One by ID
export const getLocationById = async (id) => {
  const loc = await prisma.location.findUnique({ where: { id } });
  return loc ? transformLocationData(loc) : null;
};

// 3. Create
export const createLocation = async (data) => {
  return await prisma.location.create({
    data: {
      id: data.id || `KV_${randomUUID()}`,
      ...data,
      tags: safeJsonStringify(data.tags || []),
      menu: safeJsonStringify(data.menu),
    }
  });
};

// 4. Update
export const updateLocation = async (id, updates) => {
  const data = { ...updates };
  if (data.tags) data.tags = safeJsonStringify(data.tags);
  if (data.menu) data.menu = safeJsonStringify(data.menu);

  return await prisma.location.update({
    where: { id },
    data
  });
};

// 5. Delete
export const deleteLocation = async (id) => {
  try {
    await prisma.location.delete({ where: { id } });
    return true;
  } catch (error) {
    console.error(`Failed to delete location ${id}:`, error);
    return false;
  }
};


/**
 * =================================================================================================
 * HELPER FUNCTIONS (INTERNAL)
 * =================================================================================================
 */

// Xây dựng điều kiện lọc cho Prisma
function buildFilterCondition(filters) {
  const where = {};
  if (filters.type) where.type = filters.type;
  if (filters.indoor !== undefined) where.indoor = filters.indoor;
  if (filters.priceLevel) where.priceLevel = filters.priceLevel;
  if (filters.search) where.name = { contains: filters.search };
  return where;
}

// Chuyển đổi dữ liệu thô từ DB (JSON string) sang Object
function transformLocationData(loc) {
  return {
    ...loc,
    tags: safeJsonParse(loc.tags, []),
    menu: safeJsonParse(loc.menu, null),
    operatingHours: parseOperatingHours(loc.openTime, loc.closeTime),
  };
}

// Parse giờ mở cửa
function parseOperatingHours(openStr, closeStr) {
  if (!openStr && !closeStr) return null;

  const start = openStr ? parseInt(openStr.split(':')[0]) : 0;
  const end = closeStr ? parseInt(closeStr.split(':')[0]) : 24;

  return { start, end };
}

// Safe JSON Parse Utils
function safeJsonParse(str, fallback) {
  try { return str ? JSON.parse(str) : fallback; }
  catch { return fallback; }
}

function safeJsonStringify(obj) {
  return typeof obj === 'string' ? obj : JSON.stringify(obj);
}
