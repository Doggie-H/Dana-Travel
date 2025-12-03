/**
 * ITINERARY CONTROLLER
 * 
 * Controller này xử lý các yêu cầu tạo lịch trình du lịch.
 * Nhiệm vụ chính là đảm bảo dữ liệu đầu vào (UserRequest) hợp lệ trước khi
 * chuyển cho Service tính toán phức tạp.
 * 
 * Các chức năng chính:
 * 1. generateItineraryHandler: API endpoint để tạo lịch trình.
 * 2. validateUserRequest: Hàm helper kiểm tra tính đúng đắn của dữ liệu.
 */

import { generateItinerary } from "../services/itinerary.service.js";

/**
 * API Handler: Tạo lịch trình từ yêu cầu người dùng.
 * Endpoint: POST /api/itinerary/generate
 * 
 * @param {Object} req - Request object.
 * @param {Object} res - Response object.
 * @param {Function} next - Error handler middleware.
 */
export async function generateItineraryHandler(req, res, next) {
  try {
    const userRequest = req.body;

    // 1. Validate dữ liệu đầu vào
    // Nếu dữ liệu sai, trả về lỗi 400 ngay lập tức để tiết kiệm tài nguyên server.
    const errors = validateUserRequest(userRequest);
    if (errors.length > 0) {
      return res.status(400).json({
        error: "Dữ liệu không hợp lệ (Validation failed)",
        details: errors,
      });
    }

    // 2. Gọi Service để tạo lịch trình
    // Đây là nơi logic "nặng" (tính toán, thuật toán) được thực thi.
    const itinerary = await generateItinerary(userRequest);

    // 3. Trả về kết quả
    res.status(200).json({
      success: true,
      data: itinerary,
    });
  } catch (error) {
    // Chuyển lỗi cho middleware xử lý trung tâm
    next(error);
  }
}

/**
 * Hàm kiểm tra tính hợp lệ của UserRequest.
 * Kiểm tra các trường bắt buộc, kiểu dữ liệu, và logic nghiệp vụ cơ bản (VD: ngày về > ngày đi).
 * 
 * @param {Object} req - Đối tượng request từ người dùng.
 * @returns {string[]} - Mảng chứa các thông báo lỗi (nếu có).
 */
function validateUserRequest(req) {
  const errors = [];

  // Kiểm tra Ngân sách (Phải là số dương)
  if (
    !req.budgetTotal ||
    typeof req.budgetTotal !== "number" ||
    req.budgetTotal <= 0
  ) {
    errors.push("Ngân sách (budgetTotal) phải là số dương.");
  }

  // Kiểm tra Số người (Phải >= 1)
  if (
    !req.numPeople ||
    typeof req.numPeople !== "number" ||
    req.numPeople < 1
  ) {
    errors.push("Số người (numPeople) phải lớn hơn hoặc bằng 1.");
  }

  // Kiểm tra Ngày đến (Arrive Date)
  if (!req.arriveDateTime) {
    errors.push("Ngày đến (arriveDateTime) là bắt buộc.");
  } else {
    const arriveDate = new Date(req.arriveDateTime);
    if (isNaN(arriveDate.getTime())) {
      errors.push("Ngày đến không đúng định dạng.");
    }
  }

  // Kiểm tra Ngày về (Leave Date)
  if (!req.leaveDateTime) {
    errors.push("Ngày về (leaveDateTime) là bắt buộc.");
  } else {
    const leaveDate = new Date(req.leaveDateTime);
    if (isNaN(leaveDate.getTime())) {
      errors.push("Ngày về không đúng định dạng.");
    }

    // Logic: Ngày về phải sau ngày đến
    if (req.arriveDateTime && leaveDate <= new Date(req.arriveDateTime)) {
      errors.push("Ngày về phải sau ngày đến.");
    }
  }

  // Kiểm tra Phương tiện (Enum Validation)
  const validTransports = ["own", "rent", "taxi", "public", "grab-bike", "grab-car"];
  if (!req.transport || !validTransports.includes(req.transport)) {
    errors.push(`Phương tiện không hợp lệ. Phải là: ${validTransports.join(", ")}`);
  }

  // Kiểm tra Chỗ ở (Enum Validation)
  const validAccommodations = ["free", "hotel", "homestay", "resort"];
  if (!req.accommodation || !validAccommodations.includes(req.accommodation)) {
    errors.push(
      `Loại chỗ ở không hợp lệ. Phải là: ${validAccommodations.join(", ")}`
    );
  }

  // Kiểm tra Sở thích (Phải là mảng)
  if (req.preferences && !Array.isArray(req.preferences)) {
    errors.push("Sở thích (preferences) phải là một danh sách (array).");
  }

  return errors;
}

export default {
  generateItineraryHandler,
};
