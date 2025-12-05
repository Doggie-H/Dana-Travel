/**
 * Định nghĩa API tìm kiếm địa điểm.
 * GET /api/location/search
 */

import express from "express";
import { searchLocationsHandler } from "../controllers/location.controller.js";

const router = express.Router();

// GET /api/location/search
// Tìm kiếm địa điểm theo từ khóa và bộ lọc
router.get("/search", searchLocationsHandler);

export default router;
