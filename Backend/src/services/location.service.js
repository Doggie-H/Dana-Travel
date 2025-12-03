/**
 * LOCATION SERVICE
 * 
 * Service này chịu trách nhiệm quản lý dữ liệu địa điểm (CRUD).
 * Nó tương tác trực tiếp với Database thông qua Prisma ORM.
 * 
 * Các chức năng chính:
 * 1. getAllLocations: Lấy danh sách địa điểm (có hỗ trợ lọc).
 * 2. getLocationById: Lấy chi tiết một địa điểm.
 * 3. createLocation: Thêm địa điểm mới.
 * 4. updateLocation: Cập nhật thông tin địa điểm.
 * 5. deleteLocation: Xóa địa điểm.
 * 
 * Lưu ý: Các trường dữ liệu phức tạp như 'tags' và 'menu' được lưu dưới dạng JSON string trong DB,
 * nên cần parse/stringify khi đọc/ghi.
 */

import prisma from "../utils/prisma.js";

/**
 * Lấy danh sách địa điểm với các bộ lọc tùy chọn.
 * 
 * @param {Object} filters - Các tiêu chí lọc.
 * @param {string} filters.type - Loại địa điểm (restaurant, hotel...).
 * @param {boolean} filters.indoor - Lọc địa điểm trong nhà.
 * @param {string} filters.priceLevel - Mức giá (cheap, moderate...).
 * @param {string} filters.search - Từ khóa tìm kiếm theo tên.
 * @returns {Promise<Array>} - Danh sách địa điểm đã được format.
 */
export const getAllLocations = async (filters = {}) => {
  const where = {};

  // Xây dựng câu truy vấn động dựa trên filters
  if (filters.type) where.type = filters.type;
  if (filters.indoor !== undefined) where.indoor = filters.indoor;
  if (filters.priceLevel) where.priceLevel = filters.priceLevel;
  
  // Tìm kiếm gần đúng (contains) cho tên địa điểm
  if (filters.search) {
    where.name = { contains: filters.search };
  }

  // Thực hiện truy vấn DB
  const locations = await prisma.location.findMany({ where });
  
  // Map dữ liệu để parse JSON string thành Object/Array
  return locations.map(loc => ({
    ...loc,
    tags: loc.tags ? JSON.parse(loc.tags) : [],
    menu: loc.menu ? JSON.parse(loc.menu) : null,
  }));
};

/**
 * Lấy chi tiết một địa điểm theo ID.
 * 
 * @param {string} id - ID của địa điểm.
 * @returns {Promise<Object|null>} - Object địa điểm hoặc null nếu không tìm thấy.
 */
export const getLocationById = async (id) => {
  const loc = await prisma.location.findUnique({ where: { id } });
  
  if (!loc) return null;
  
  // Parse JSON fields
  return {
    ...loc,
    tags: loc.tags ? JSON.parse(loc.tags) : [],
    menu: loc.menu ? JSON.parse(loc.menu) : null,
  };
};

/**
 * Tạo mới một địa điểm.
 * 
 * @param {Object} data - Dữ liệu địa điểm mới.
 * @returns {Promise<Object>} - Địa điểm vừa tạo.
 */
export const createLocation = async (data) => {
  return await prisma.location.create({
    data: {
      ...data,
      // Chuyển Array thành JSON string trước khi lưu vào DB
      tags: JSON.stringify(data.tags || []),
      menu: data.menu ? JSON.stringify(data.menu) : null,
    }
  });
};

/**
 * Cập nhật thông tin địa điểm.
 * 
 * @param {string} id - ID địa điểm cần sửa.
 * @param {Object} updates - Các trường thông tin cần cập nhật.
 * @returns {Promise<Object>} - Địa điểm sau khi cập nhật.
 */
export const updateLocation = async (id, updates) => {
  const data = { ...updates };
  
  // Nếu có cập nhật tags hoặc menu, cần stringify lại
  if (data.tags) data.tags = JSON.stringify(data.tags);
  if (data.menu) data.menu = JSON.stringify(data.menu);

  return await prisma.location.update({
    where: { id },
    data
  });
};

/**
 * Xóa một địa điểm.
 * 
 * @param {string} id - ID địa điểm cần xóa.
 * @returns {Promise<boolean>} - True nếu xóa thành công, False nếu lỗi.
 */
export const deleteLocation = async (id) => {
  try {
    await prisma.location.delete({ where: { id } });
    return true;
  } catch (error) {
    console.error(`Lỗi khi xóa địa điểm ${id}:`, error);
    return false;
  }
};
