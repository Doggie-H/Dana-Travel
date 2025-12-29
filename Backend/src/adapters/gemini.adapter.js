/**
 * GEMINI ADAPTER
 * 
 * Adapter này chịu trách nhiệm giao tiếp với Google Gemini API.
 * Nó đóng vai trò là cầu nối để gửi tin nhắn của người dùng và ngữ cảnh hệ thống
 * đến mô hình AI, sau đó nhận về phản hồi thông minh.
 * 
 * Các chức năng chính:
 * 1. callGeminiAPI: Gửi request HTTP đến Google API.
 * 2. buildSystemPrompt: Xây dựng "nhân cách" và ngữ cảnh cho AI.
 * 3. processChatWithAI: Hàm wrapper xử lý toàn bộ luồng (Prompt -> Call -> Parse).
 * 
 * Yêu cầu: Cần có GEMINI_API_KEY trong file .env
 */

// Cấu hình Model và URL API
// Sử dụng model gemini-2.5-flash (hoặc fallback) cho tốc độ phản hồi nhanh
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

/**
 * Gọi trực tiếp đến Gemini API thông qua HTTP Request.
 * Sử dụng fetch thay vì thư viện client để giảm dependency và dễ kiểm soát.
 * 
 * @param {string} prompt - Nội dung prompt gửi đi.
 * @returns {Promise<string|null>} - Nội dung text trả về từ AI hoặc null nếu lỗi.
 */
async function callGeminiAPI(prompt) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.warn("Cảnh báo: Chưa cấu hình GEMINI_API_KEY. AI sẽ không hoạt động.");
    return null;
  }

  try {
    // Sử dụng AbortController để giới hạn thời gian chờ (Timeout) là 10 giây
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7, // Độ sáng tạo vừa phải
          maxOutputTokens: 1024, // Giới hạn độ dài câu trả lời
          topP: 0.8,
          topK: 40,
        },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout); // Xóa timeout nếu request thành công

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(`Gemini API lỗi (${response.status}): ${text}`);
    }

    const data = await response.json();
    // Trích xuất nội dung text từ cấu trúc phản hồi phức tạp của Google
    return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;
  } catch (error) {
    console.error("Lỗi khi gọi Gemini API:", error);
    return null;
  }
}

/**
 * Xây dựng System Prompt (Lời nhắc hệ thống).
 * Đây là phần quan trọng nhất để định hình tính cách và hành vi của AI.
 * 
 * @param {Object} itinerary - Lịch trình hiện tại (nếu có).
 * @param {Object} userRequest - Thông tin người dùng (ngân sách, sở thích...).
 * @returns {string} - Chuỗi prompt hoàn chỉnh.
 */
import prisma from "../utils/prisma.js";

// Fallback Prompt nếu DB lỗi
const FALLBACK_PROMPT = `
Bạn là Trợ lý Du lịch Cá nhân của Dana Travel.
Luôn trả về JSON format.
`;

/**
 * Xây dựng System Prompt (Lời nhắc hệ thống).
 * Lấy từ Database để có thể cấu hình động.
 */
async function buildSystemPrompt(itinerary, userRequest) {
  let promptContent = FALLBACK_PROMPT;

  try {
    const promptRecord = await prisma.aIPrompt.findUnique({
      where: { key: 'chatbot_persona' }
    });
    if (promptRecord && promptRecord.content) {
      promptContent = promptRecord.content;
    }
  } catch (error) {
    console.error("Lỗi lấy AI Prompt từ DB:", error);
  }

  let prompt = promptContent + "\n";


  // Context: Lịch trình hiện tại (CHI TIẾT ĐỂ AI PHÂN TÍCH)
  if (itinerary && itinerary.days && itinerary.days.length > 0) {
    prompt += `\n=== LỊCH TRÌNH CỦA NGƯỜI DÙNG ===\n`;
    prompt += `Tổng quan: ${itinerary.days.length} ngày, `;
    const totalActivities = itinerary.days.reduce((sum, d) => sum + (d.items?.length || 0), 0);
    prompt += `${totalActivities} hoạt động\n`;

    if (itinerary.totalCost) {
      prompt += `Tổng chi phí dự kiến: ${itinerary.totalCost.toLocaleString()} VND\n`;
    }

    // Chi tiết từng ngày
    itinerary.days.forEach((day, idx) => {
      prompt += `\n--- Ngày ${idx + 1} (${day.date || 'Không có ngày'}) ---\n`;
      if (day.items && day.items.length > 0) {
        day.items.forEach((item, itemIdx) => {
          const timeStr = item.startTime ? `${item.startTime}-${item.endTime || '?'}` : '';
          const costStr = item.estimatedCost ? ` (${item.estimatedCost.toLocaleString()}đ)` : '';
          prompt += `${itemIdx + 1}. ${timeStr} ${item.title || item.name}${costStr}\n`;
          if (item.description) {
            prompt += `   → ${item.description.substring(0, 80)}...\n`;
          }
        });
      } else {
        prompt += `Chưa có hoạt động nào.\n`;
      }
    });

    prompt += `\nKhi người dùng hỏi về lịch trình, hãy PHÂN TÍCH chi tiết: điểm mạnh, điểm cần cải thiện, gợi ý bổ sung. Đừng chỉ liệt kê lại!\n`;
  } else {
    prompt += `\n=== LỊCH TRÌNH ===\nNgười dùng CHƯA TẠO lịch trình nào. Nếu họ hỏi về lịch trình, nhắc họ tạo lịch trình trước.\n`;
  }

  // Context: Thông tin người dùng
  if (userRequest) {
    prompt += `\n=== THÔNG TIN NGƯỜI DÙNG ===\n`;
    if (userRequest.budgetTotal) {
      prompt += `- Ngân sách: ${userRequest.budgetTotal.toLocaleString()} VND\n`;
    }
    if (userRequest.numPeople) {
      prompt += `- Nhóm: ${userRequest.numPeople} người\n`;
    }
    if (userRequest.preferences && userRequest.preferences.length > 0) {
      prompt += `- Sở thích: ${userRequest.preferences.join(', ')}\n`;
    }
  }

  prompt += `\nCRITICAL: Trả về ĐÚNG JSON format, không markdown, không code block!`;

  return prompt;
}

/**
 * Hàm xử lý chính: Gửi tin nhắn sang AI và nhận phản hồi đã xử lý.
 * 
 * @param {string} message - Tin nhắn của người dùng.
 * @param {Object} context - Ngữ cảnh (lịch trình, request).
 * @returns {Promise<Object|null>} - Object phản hồi hoặc null nếu lỗi.
 */
export async function processChatWithAI(message, context = {}) {
  // 1. Xây dựng prompt
  const systemPrompt = await buildSystemPrompt(
    context.itinerary,
    context.userRequest
  );
  const fullPrompt = `${systemPrompt}\n\nUser: ${message}\nAssistant:`;

  if (process.env.NODE_ENV !== "production") {
    // Debug logging removed for audit compliance
  }

  // 2. Gọi API
  const aiResponse = await callGeminiAPI(fullPrompt);

  if (!aiResponse) {
    return null; // Fallback nếu AI không trả lời
  }

  // 3. Làm sạch phản hồi
  // Regex để tìm khối JSON {...} (bao gồm cả nested braces đơn giản)
  let cleanText = aiResponse.replace(/```json/g, "").replace(/```/g, "").trim();

  // Hàm helper để extract JSON từ chuỗi hỗn tạp
  const extractJSON = (text) => {
    try {
      // 1. Thử parse trực tiếp
      return JSON.parse(text);
    } catch (e) {
      // 2. Tìm substring bắt đầu bằng '{' và kết thúc bằng '}'
      const firstOpen = text.indexOf('{');
      const lastClose = text.lastIndexOf('}');
      if (firstOpen !== -1 && lastClose > firstOpen) {
        try {
          const jsonSubstring = text.substring(firstOpen, lastClose + 1);
          return JSON.parse(jsonSubstring);
        } catch (innerErr) {
          return null;
        }
      }
      return null;
    }
  };

  const parsed = extractJSON(cleanText);

  if (parsed && parsed.reply) {
    return {
      reply: parsed.reply,
      quickReplies: parsed.quickReplies || [],
      action: parsed.action,
      data: parsed.data,
      suggestions: parsed.suggestions // Quan trọng: Đảm bảo pass suggestions
    };
  }

  // Fallback: Nếu không parse được JSON, trả về text gốc (nhưng cố gắng loại bỏ JSON artifact nếu có)
  // Nếu text bắt đầu bằng '{"reply":', có thể nó bị cắt cụt hoặc lỗi cú pháp nhẹ
  console.warn("AI didn't return valid JSON. Fallback to raw text.");
  return {
    reply: cleanText,
    quickReplies: []
  };
}

export default {
  processChatWithAI,
};
