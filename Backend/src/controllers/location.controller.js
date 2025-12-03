/**
 * LOCATION CONTROLLER
 * 
 * Controller này xử lý các yêu cầu tìm kiếm và truy xuất dữ liệu địa điểm du lịch.
 * Hỗ trợ các tính năng lọc theo từ khóa, loại hình, và khu vực.
 * 
 * Các chức năng chính:
 * 1. searchLocationsHandler: API tìm kiếm địa điểm đa tiêu chí.
 */

import { getAllLocations } from "../services/location.service.js";

/**
 * API Handler: Tìm kiếm địa điểm.
 * Endpoint: GET /api/location/search
 * Query Params:
 * - q: Từ khóa tìm kiếm (tên, khu vực, tags).
 * - type: Loại địa điểm (restaurant, hotel, visit...).
 * 
 * @param {Object} req - Request object.
 * @param {Object} res - Response object.
 * @param {Function} next - Error handler middleware.
 */
export async function searchLocationsHandler(req, res, next) {
  try {
    const { q, type } = req.query;

    // 1. Lấy toàn bộ danh sách địa điểm từ Service
    // Lưu ý: Trong thực tế nếu dữ liệu lớn, nên đẩy việc lọc xuống tầng Database (Prisma)
    // thay vì lọc trên RAM như hiện tại để tối ưu hiệu năng.
    let results = await getAllLocations();

    // 2. Lọc theo loại hình (Type)
    if (type) {
      results = results.filter((loc) => loc.type === type);
    }

    // 3. Lọc theo từ khóa (Keyword)
    // Tìm kiếm trong Tên, Khu vực, và Tags
    if (q && q.trim().length > 0) {
      const keyword = q.toLowerCase().trim();
      results = results.filter(
        (loc) =>
          loc.name.toLowerCase().includes(keyword) ||
          loc.area.toLowerCase().includes(keyword) ||
          loc.tags?.some((tag) => tag.toLowerCase().includes(keyword))
      );
    }

    // 4. Trả về kết quả
    res.status(200).json({
      success: true,
      data: results,
      count: results.length, // Trả về số lượng để Frontend dễ hiển thị
    });
  } catch (error) {
    next(error);
  }
}

export default {
  searchLocationsHandler,
};
