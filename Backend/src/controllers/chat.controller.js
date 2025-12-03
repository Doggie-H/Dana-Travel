/**
 * CHAT CONTROLLER
 * 
 * Controller này chịu trách nhiệm xử lý các yêu cầu liên quan đến Chatbot.
 * Nó đóng vai trò là "người gác cổng" (Gatekeeper) tiếp nhận request từ Frontend,
 * kiểm tra tính hợp lệ của dữ liệu, sau đó chuyển giao cho Service xử lý.
 * 
 * Các chức năng chính:
 * 1. chatHandler: Tiếp nhận tin nhắn, validate, gọi service và trả về phản hồi.
 */

import { processChatMessage } from "../services/chatbot.service.js";
import { logChatInteraction } from "../services/chatLog.service.js";

/**
 * Xử lý tin nhắn chat từ người dùng.
 * API Endpoint: POST /api/chat
 * 
 * @param {Object} req - Request object từ Express.
 * @param {Object} res - Response object để trả về kết quả.
 * @param {Function} next - Hàm middleware tiếp theo (dùng để xử lý lỗi).
 */
export async function chatHandler(req, res, next) {
  try {
    // 1. Lấy dữ liệu từ body request
    const { message, context } = req.body;

    // 2. Validate (Kiểm tra dữ liệu đầu vào)
    // Đảm bảo message tồn tại và là chuỗi không rỗng
    if (
      !message ||
      typeof message !== "string" ||
      message.trim().length === 0
    ) {
      return res.status(400).json({
        error: "Tin nhắn là bắt buộc và không được để trống.",
      });
    }

    // 3. Gọi Service để xử lý logic nghiệp vụ (AI, tìm kiếm...)
    // Controller không nên chứa logic phức tạp, chỉ điều phối.
    const response = await processChatMessage(message, context || {});

    // 4. Ghi log tương tác (để debug hoặc phân tích sau này)
    // Việc này nên chạy bất đồng bộ hoặc không chặn luồng chính nếu có thể,
    // nhưng ở đây ta await để đảm bảo log được ghi.
    logChatInteraction({
      userMessage: message,
      botResponse: response,
      context: context || {},
    });

    // 5. Trả về kết quả thành công
    res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error) {
    // Chuyển lỗi xuống middleware xử lý lỗi chung (error.handler.middleware.js)
    next(error);
  }
}

export default {
  chatHandler,
};
