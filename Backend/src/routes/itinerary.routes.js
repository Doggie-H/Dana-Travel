// file: backend/routes/itineraryRoutes.js

/**
 * Itinerary Routes
 * Định tuyến mỏng, không chứa logic
 */

import express from "express";
import { generateItineraryHandler } from "../controllers/itinerary.controller.js";

const router = express.Router();

// POST /api/itinerary/generate
router.post("/generate", generateItineraryHandler);

export default router;
