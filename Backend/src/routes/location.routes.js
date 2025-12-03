/**
 * LOCATION ROUTES
 * 
 * Định tuyến cho các chức năng tìm kiếm địa điểm.
 * Endpoint: /api/location
 */

import express from "express";
import { searchLocationsHandler } from "../controllers/location.controller.js";

const router = express.Router();

// GET /api/location/search
// Tìm kiếm địa điểm theo từ khóa và bộ lọc
router.get("/search", searchLocationsHandler);

export default router;
