// file: backend/controllers/locationController.js

/**
 * Location Controller - search locations
 *
 * Vai trò: filter & return locations theo query params
 */

import { getAllLocations } from "../services/location.service.js";

/**
 * GET /api/location/search?q=&type=
 * Search locations by keyword & type
 */
export async function searchLocationsHandler(req, res, next) {
  try {
    const { q, type } = req.query;

    let results = await getAllLocations();

    // Filter by type
    if (type) {
      results = results.filter((loc) => loc.type === type);
    }

    // Filter by keyword (search in name, area, tags)
    if (q && q.trim().length > 0) {
      const keyword = q.toLowerCase().trim();
      results = results.filter(
        (loc) =>
          loc.name.toLowerCase().includes(keyword) ||
          loc.area.toLowerCase().includes(keyword) ||
          loc.tags?.some((tag) => tag.toLowerCase().includes(keyword))
      );
    }

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
