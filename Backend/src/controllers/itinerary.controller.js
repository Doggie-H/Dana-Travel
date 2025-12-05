/**
 * =================================================================================================
 * FILE: itinerary.controller.js
 * MỤC ĐÍCH: Tiếp nhận yêu cầu tạo lịch trình từ người dùng và phản hồi kết quả.
 * NGƯỜI TẠO: Team DanaTravel (AI Support)
 * 
 * MÔ TẢ CHI TIẾT (BEGINNER GUIDE):
 * Controller đóng vai trò như "người lễ tân" của khách sạn:
 * 1. Nhận yêu cầu (Request): Khách muốn đi đâu? Bao nhiêu tiền? Mấy người?
 * 2. Kiểm tra (Validation): Xem thông tin khách đưa có đủ không? Có hợp lệ không?
 * 3. Chuyển giao (Delegate): Gọi "Tổng quản lý" (Service) để tính toán lịch trình.
 * 4. Phản hồi (Response): Trả kết quả cuối cùng cho khách.
 * 
 * CÁC HÀM CHÍNH:
 * - generateItineraryHandler: Xử lý API tạo lịch trình.
 * - validateUserRequest: Kiểm tra tính hợp lệ của dữ liệu đầu vào.
 * =================================================================================================
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
    // Chuẩn hóa dữ liệu đầu vào
    if (!userRequest.preferences) {
      userRequest.preferences = [];
    }

    // Nếu dữ liệu sai, trả về lỗi 400 ngay lập tức để tiết kiệm tài nguyên server.
    const errors = validateUserRequest(userRequest);
    if (errors.length > 0) {
      console.log("❌ Validation failed:", errors);
      console.log("Request body:", userRequest);
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
  const validTransports = ["own", "grab-bike", "grab-car"];
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

  // Kiểm tra Sở thích (Phải là mảng, Min 1, Max 3)
  if (!req.preferences || !Array.isArray(req.preferences) || req.preferences.length === 0) {
    errors.push("Vui lòng chọn ít nhất 1 sở thích.");
  } else if (req.preferences.length > 3) {
    errors.push("Vui lòng chọn tối đa 3 sở thích.");
  }

  return errors;
}

export default {
  generateItineraryHandler,
};
