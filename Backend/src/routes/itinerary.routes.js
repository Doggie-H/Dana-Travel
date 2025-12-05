/**
 * Định nghĩa API cho Lịch trình.
 * POST /api/itinerary/generate
 */

import express from "express";
import { generateItineraryHandler } from "../controllers/itinerary.controller.js";

const router = express.Router();

// POST /api/itinerary/generate
// Tạo lịch trình du lịch dựa trên yêu cầu người dùng
router.post("/generate", generateItineraryHandler);

export default router;
