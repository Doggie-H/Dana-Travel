// file: backend/controllers/itineraryController.js

/**
 * Itinerary Controller - validate input, gọi service, format response
 *
 * Vai trò: controller mỏng, không chứa business logic
 * Flow: validate → service → response
 * Error handling: throw với message rõ ràng, middleware sẽ catch
 */

import { generateItinerary } from "../services/itinerary.service.js";

/**
 * POST /api/itinerary/generate
 * Generate lịch trình từ user request
 */
export async function generateItineraryHandler(req, res, next) {
  try {
    const userRequest = req.body;

    // Validate required fields
    const errors = validateUserRequest(userRequest);
    if (errors.length > 0) {
      return res.status(400).json({
        error: "Validation failed",
        details: errors,
      });
    }

    // Call service
    const itinerary = await generateItinerary(userRequest);

    // Success response
    res.status(200).json({
      success: true,
      data: itinerary,
    });
  } catch (error) {
    // Pass to error handler middleware
    next(error);
  }
}

/**
 * Validate UserRequest object
 * @param {Object} req - user request
 * @returns {string[]} - array of error messages
 */
function validateUserRequest(req) {
  const errors = [];

  // Required fields
  if (
    !req.budgetTotal ||
    typeof req.budgetTotal !== "number" ||
    req.budgetTotal <= 0
  ) {
    errors.push("budgetTotal phải là số dương");
  }

  if (
    !req.numPeople ||
    typeof req.numPeople !== "number" ||
    req.numPeople < 1
  ) {
    errors.push("numPeople phải >= 1");
  }

  if (!req.arriveDateTime) {
    errors.push("arriveDateTime là bắt buộc");
  } else {
    const arriveDate = new Date(req.arriveDateTime);
    if (isNaN(arriveDate.getTime())) {
      errors.push("arriveDateTime không hợp lệ");
    }
  }

  if (!req.leaveDateTime) {
    errors.push("leaveDateTime là bắt buộc");
  } else {
    const leaveDate = new Date(req.leaveDateTime);
    if (isNaN(leaveDate.getTime())) {
      errors.push("leaveDateTime không hợp lệ");
    }

    // Check leave > arrive
    if (req.arriveDateTime && leaveDate <= new Date(req.arriveDateTime)) {
      errors.push("leaveDateTime phải sau arriveDateTime");
    }
  }

  // Enum validations
  const validTransports = ["own", "rent", "taxi", "public", "grab-bike", "grab-car"];
  if (!req.transport || !validTransports.includes(req.transport)) {
    errors.push(`transport phải là một trong: ${validTransports.join(", ")}`);
  }

  const validAccommodations = ["free", "hotel", "homestay", "resort"];
  if (!req.accommodation || !validAccommodations.includes(req.accommodation)) {
    errors.push(
      `accommodation phải là một trong: ${validAccommodations.join(", ")}`
    );
  }

  // Optional: preferences must be array
  if (req.preferences && !Array.isArray(req.preferences)) {
    errors.push("preferences phải là array");
  }

  return errors;
}

export default {
  generateItineraryHandler,
};
