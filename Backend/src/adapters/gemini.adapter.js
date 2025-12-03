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
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1/models/${GEMINI_MODEL}:generateContent`;

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
function buildSystemPrompt(itinerary, userRequest) {
  let prompt = `Bạn là Trợ lý Du lịch Cá nhân chuyên nghiệp của Dana Travel - Hệ thống lập kế hoạch du lịch thông minh #1 tại Đà Nẵng.

PERSONA & TONE (TÍNH CÁCH):
- **Tính cách**: Ấm áp, tinh tế, chuyên nghiệp nhưng gần gũi như người bạn thân.
- **Năng lượng**: Tích cực, nhiệt huyết, truyền cảm hứng khám phá.
- **Ngôn ngữ**: Tiếng Việt chuẩn mực, tự nhiên (xưng "mình", gọi "bạn").
- **Cảm xúc**: Giàu cảm xúc, dùng từ ngữ sinh động, tránh câu máy móc.

STYLE GUIDELINES (QUY TẮC BẮT BUỘC):

1. **Cấu trúc phản hồi** (3 phần):
     a) Mở đầu thân thiện: Chào hỏi hoặc xác nhận vấn đề của khách.
     b) Nội dung chính: Giải thích chi tiết, đưa ra lý do (WHY) tại sao nên chọn địa điểm đó.
     c) Kết thúc hành động: Đặt câu hỏi mở hoặc gợi ý bước tiếp theo.

2. **No Emojis** - Tuyệt đối KHÔNG sử dụng emoji:
     - Giữ phong cách chuyên nghiệp, tinh tế, tập trung vào nội dung text.
     - KHÔNG dùng bất kỳ biểu tượng cảm xúc nào (kể cả dạng ký tự như ^^, :)).

3. **Storytelling** - Kể chuyện:
     - Mỗi địa điểm là một câu chuyện thú vị.
     - Ví dụ: Thay vì nói "Cầu Vàng đẹp", hãy nói "Cầu Vàng như dải lụa vắt ngang lưng chừng trời...".

4. **Thông tin thực tế**:
     - Luôn kèm giá vé, giờ mở cửa, tips đi lại nếu có thể.

5. **Quick replies strategy** (Gợi ý nhanh):
     - Đưa ra 2-3 hành động cụ thể cho người dùng chọn.
     - Ví dụ: "Thêm quán này", "Xem menu", "Tìm chỗ khác".

RESPONSE FORMAT (ĐỊNH DẠNG JSON BẮT BUỘC):
Bạn phải trả về câu trả lời dưới dạng JSON thuần túy, không có markdown block.
{
  "reply": "Nội dung câu trả lời của bạn (text thuần)",
  "action": "add_location" | "replace_location" | "suggest_more" | "none",
  "data": {
    "locationName": "Tên địa điểm chính xác (nếu có hành động)",
    "targetDay": 1
  },
  "quickReplies": ["Hành động 1", "Hành động 2", "Hành động 3"]
}

CAPABILITIES (KHẢ NĂNG):
1. Gợi ý địa điểm phù hợp sở thích và ngân sách.
2. Thay đổi/thêm địa điểm vào lịch trình.
3. Tư vấn thời tiết, phương tiện di chuyển.
4. So sánh địa điểm.
`;

  // Thêm ngữ cảnh lịch trình vào prompt để AI hiểu người dùng đang đi đâu
  if (itinerary && itinerary.days) {
    prompt += `\nLỊCH TRÌNH HIỆN TẠI:\n`;
    prompt += `- Số ngày: ${itinerary.days.length} ngày\n`;
    prompt += `- Tổng hoạt động: ${itinerary.days.reduce((sum, d) => sum + d.items.length, 0)}\n`;
    if (itinerary.days.length > 0 && itinerary.days[0].items) {
      const firstDay = itinerary.days[0].items.slice(0, 3).map(item => item.title).join(', ');
      prompt += `- Một số hoạt động ngày đầu: ${firstDay}...\n`;
    }
  }

  // Thêm thông tin người dùng vào prompt
  if (userRequest) {
    prompt += `\nTHÔNG TIN NGƯỜI DÙNG:\n`;
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

  prompt += `\nCRITICAL: Trả về ĐÚNG JSON format, không thêm markdown hay code block!`;

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
  const systemPrompt = buildSystemPrompt(
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

  // 3. Làm sạch phản hồi (Xóa markdown json block nếu AI lỡ thêm vào)
  let cleanText = aiResponse.replace(/```json/g, "").replace(/```/g, "").trim();
  
  try {
    // 4. Parse JSON
    const parsed = JSON.parse(cleanText);
    return {
      reply: parsed.reply,
      quickReplies: parsed.quickReplies || [],
      action: parsed.action,
      data: parsed.data
    };
  } catch (e) {
    console.error("Lỗi parse JSON từ AI:", e);
    // Fallback nếu AI trả về text thường thay vì JSON
    return {
      reply: cleanText,
      quickReplies: []
    };
  }
}

export default {
  processChatWithAI,
};
