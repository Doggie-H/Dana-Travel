/**
 * Controller xử lý tin nhắn chat.
 * Tiếp nhận request từ client, gọi service xử lý và trả về phản hồi.
 */

import { processChatMessage } from "../services/chatbot.service.js";
import { logChatInteraction, getLastBotMessage, getConversationContext } from "../services/chat.history.service.js";

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
    // Lấy context lịch sử (tin nhắn cuối của bot) để AI hiểu "quán này", "quán đầu tiên"...
    // Updated: Lấy cả lịch sử hội thoại gần đây
    const lastBotMessage = await getLastBotMessage();
    const history = await getConversationContext(5); // Lấy 5 cặp hội thoại gần nhất

    const enrichedContext = {
      ...(context || {}),
      lastBotMessage,
      history
    };

    // Controller không nên chứa logic phức tạp, chỉ điều phối.
    const response = await processChatMessage(message, enrichedContext);

    // 4. Ghi log tương tác (để debug hoặc phân tích sau này)
    // Chạy async để không block response, nhưng vẫn đảm bảo log được ghi
    try {
      await logChatInteraction({
        userMessage: message,
        botResponse: typeof response === 'object' ? JSON.stringify(response) : String(response),
      });
    } catch (logError) {
      console.error("Lỗi khi ghi log chat:", logError);
    }

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
