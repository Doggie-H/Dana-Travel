/**
 * =================================================================================================
 * ITINERARY CONTROLLER - BỘ ĐIỀU KHIỂN TẠO LỊCH TRÌNH
 * =================================================================================================
 * 
 * Nhiệm vụ:
 * 1. Nhận request từ Client (API Endpoint).
 * 2. Validate dữ liệu đầu vào (Input Validation).
 * 3. Gọi Service để xử lý logic nghiệp vụ (Business Logic).
 * 4. Trả về kết quả cho Client (Response).
 */

import { randomUUID } from "crypto";
import prisma from "../config/prisma.client.js";
import { generateItinerary } from "../services/itinerary.service.js";

/**
 * =================================================================================================
 * API HANDLERS
 * =================================================================================================
 */

/**
 * [POST] /api/itinerary/generate
 * Tạo lịch trình dựa trên thông tin người dùng cung cấp.
 */
export async function generateItineraryHandler(req, res, next) {
  try {
    const userRequest = req.body;

    // --- BƯỚC 1: CHUẨN HÓA & VALIDATE DATA ---
    // Đảm bảo preferences luôn là mảng
    if (!userRequest.preferences) {
      userRequest.preferences = [];
    }

    // Kiểm tra tính hợp lệ
    const validationErrors = validateUserRequest(userRequest);
    if (validationErrors.length > 0) {
      console.warn("Bad Request:", validationErrors);
      return res.status(400).json({
        success: false,
        error: "Dữ liệu không hợp lệ",
        details: validationErrors,
      });
    }

    // --- RECORD SEARCH STATS (FIRE & FORGET) ---
    // Ghi lại xu hướng tìm kiếm để hiển thị lên Dashboard
    try {
      await prisma.searchQuery.create({
        data: {
          id: `XH_${randomUUID()}`,
          tags: JSON.stringify(userRequest.preferences || []),
          budget: Number(userRequest.budgetTotal),
          people: Number(userRequest.numPeople),
          duration: userRequest.arriveDateTime && userRequest.leaveDateTime
            ? `${Math.ceil(Math.abs(new Date(userRequest.leaveDateTime) - new Date(userRequest.arriveDateTime)) / (1000 * 60 * 60 * 24))} ngày`
            : null
        }
      });
    } catch (e) {
      console.error("Stats Error:", e.message);
    }

    // --- BƯỚC 2: GỌI SERVICE XỬ LÝ ---
    // Chuyển giao cho Service xử lý logic phức tạp
    console.log(`Received Itinerary Request for ${userRequest.numPeople} people, Budget: ${userRequest.budgetTotal}`);
    const itinerary = await generateItinerary(userRequest);

    // --- BƯỚC 3: TRẢ VỀ KẾT QUẢ ---
    res.status(200).json({
      success: true,
      data: itinerary,
    });

  } catch (error) {
    // Chuyển lỗi cho Global Error Handler
    next(error);
  }
}

/**
 * =================================================================================================
 * HELPER FUNCTIONS (VALIDATION)
 * =================================================================================================
 */

function validateUserRequest(req) {
  const errors = [];

  // 1. Validate Ngân sách (Positive Number)
  if (!req.budgetTotal || typeof req.budgetTotal !== "number" || req.budgetTotal <= 0) {
    errors.push("Ngân sách (budgetTotal) phải là số dương.");
  }

  // 2. Validate Số người (Min 1)
  if (!req.numPeople || typeof req.numPeople !== "number" || req.numPeople < 1) {
    errors.push("Số người (numPeople) phải lớn hơn hoặc bằng 1.");
  }

  // 3. Validate Thời gian (Dates)
  if (!req.arriveDateTime || isNaN(new Date(req.arriveDateTime).getTime())) {
    errors.push("Ngày đến (arriveDateTime) không hợp lệ.");
  }

  if (!req.leaveDateTime || isNaN(new Date(req.leaveDateTime).getTime())) {
    errors.push("Ngày về (leaveDateTime) không hợp lệ.");
  }

  // Logic: Ngày về phải sau ngày đến
  if (req.arriveDateTime && req.leaveDateTime) {
    const arrive = new Date(req.arriveDateTime);
    const leave = new Date(req.leaveDateTime);
    if (leave <= arrive) {
      errors.push("Ngày về phải sau ngày đến.");
    }
  }

  // 4. Validate Enum (Transport & Accommodation)
  const validTransports = ["own", "grab-bike", "grab-car", "rent", "taxi"];
  if (req.transport && !validTransports.includes(req.transport)) {
    // Cho phép null/undefined (sẽ có default), nhưng nếu có value thì phải đúng
    errors.push(`Phương tiện không hợp lệ. Valid: ${validTransports.join(", ")}`);
  }

  const validAccommodations = ["free", "hotel", "homestay", "resort", "friend", "relative", "home", "any"];
  if (req.accommodation && !validAccommodations.includes(req.accommodation)) {
    errors.push(`Loại chỗ ở không hợp lệ. Valid: ${validAccommodations.join(", ")}`);
  }

  // 5. Validate Preferences (Max 3)
  if (req.preferences && Array.isArray(req.preferences)) {
    if (req.preferences.length > 5) { // Nới lỏng lên 5
      errors.push("Vui lòng chọn tối đa 5 sở thích.");
    }
  }

  return errors;
}

export default {
  generateItineraryHandler,
};
