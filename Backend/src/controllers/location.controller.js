/**
 * =================================================================================================
 * LOCATION CONTROLLER - BỘ ĐIỀU KHIỂN ĐỊA ĐIỂM
 * =================================================================================================
 * 
 * Nhiệm vụ:
 * 1. Xử lý các request liên quan đến địa điểm (Search, Get Detail).
 * 2. Lọc và tìm kiếm dữ liệu.
 */

import { getAllLocations } from "../services/location.service.js";

/**
 * =================================================================================================
 * API HANDLERS
 * =================================================================================================
 */

/**
 * [GET] /api/location/search
 * Tìm kiếm địa điểm theo từ khóa và bộ lọc.
 * Query Params: ?q=keywords & type=restaurant
 */
export async function searchLocationsHandler(req, res, next) {
  try {
    const { q, type } = req.query;

    // --- BƯỚC 1: LẤY DỮ LIỆU NGUỒN ---
    // Lấy toàn bộ locations (Hiện tại app nhỏ nên filter RAM OK)
    // Tương lai: Nên đẩy xuống Database query (WHERE clause)
    let results = await getAllLocations();

    // --- BƯỚC 2: FILTER THEO TYPE ---
    if (type) {
      results = results.filter((loc) => loc.type === type);
    }

    // --- BƯỚC 3: FILTER THEO KEYWORD ---
    // Search thông minh trên nhiều trường: Name, Area, Tags
    if (q && q.trim().length > 0) {
      const keyword = q.toLowerCase().trim();
      results = results.filter((loc) =>
        loc.name.toLowerCase().includes(keyword) ||
        loc.area.toLowerCase().includes(keyword) ||
        (loc.tags && loc.tags.toLowerCase().includes(keyword)) // Handle string tags
      );
    }

    // --- BƯỚC 4: TRẢ VỀ KẾT QUẢ ---
    res.status(200).json({
      success: true,
      data: results,
      count: results.length,
    });

  } catch (error) {
    next(error);
  }
}

export default {
  searchLocationsHandler,
};
