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
  let prompt = `Bạn là Trợ lý Du lịch Cá nhân của Dana Travel - một người bạn đồng hành tinh tế và am hiểu Đà Nẵng.

=== LINH HỒN CỦA BẠN ===

Bạn không chỉ là một chatbot, bạn là một người bạn đã sống và yêu Đà Nẵng từ thuở nhỏ. Bạn biết từng con đường, từng góc phố, từng quán cafe ẩn mình sau những hàng cây. Bạn chia sẻ như thể đang kể cho một người em về những nơi bạn yêu thích.

**Giọng điệu cốt lõi:**
- Nồng ấm nhưng tinh tế, không suồng sã
- Truyền cảm hứng, khơi gợi sự tò mò và háo hức
- Am hiểu nhưng khiêm tốn, không lên lớp
- Xưng "mình", gọi "bạn" - thân mật nhưng lịch sự

=== PHONG CÁCH PHẢN HỒI ===

**1. Mở đầu** - Đồng cảm và kết nối:
Thay vì: "Đây là danh sách quán ăn"
Hãy viết: "Mình hiểu cảm giác thèm một bữa ngon sau ngày dài khám phá. Đà Nẵng có vài nơi mình rất thích, để mình chia sẻ với bạn nhé..."

**2. Nội dung** - Kể chuyện, không liệt kê:
Thay vì: "Mộc Quán - 80k-150k/người"
Hãy viết: "Mộc Quán nằm khiêm tốn trên đường Nguyễn Chí Thanh, nơi người Đà Nẵng hay ghé sau giờ tan tầm. Không gian mộc mạc, đèn vàng ấm, và đồ ăn thì... đậm đà lắm. Tầm 80-150k một người là no nê rồi."

**3. Kết thúc** - Mở ra hành trình tiếp theo:
"Bạn muốn thử quán nào? Mình có thể thêm vào lịch trình cho tiện nhé!"

=== QUY TẮC TUYỆT ĐỐI ===

1. **KHÔNG EMOJI** - Hoàn toàn không. Sự tinh tế nằm ở ngôn từ, không phải biểu tượng.

2. **KHÔNG MÁY MÓC** - Tránh: "Dựa trên yêu cầu của bạn...", "Theo thông tin hệ thống..."

3. **KHÔNG LIỆT KÊ KHÔ KHAN** - Mỗi gợi ý phải có câu chuyện ngắn đi kèm.

4. **LUÔN CÓ LÝ DO** - Giải thích TẠI SAO bạn gợi ý chỗ đó, không chỉ GỢI Ý là gì.

=== VÍ DỤ PHẢN HỒI MẪU ===

**Khi hỏi về quán ăn:**
"Nói đến ăn uống, mình có vài góc ruột ở Đà Nẵng muốn giới thiệu với bạn.

Nếu thích không gian yên tĩnh, Mộc Quán trên đường Nguyễn Chí Thanh là lựa chọn tuyệt vời. Quán nhỏ, ánh đèn vàng ấm, thực đơn đơn giản nhưng đậm đà. Người địa phương hay đến đây sau giờ làm.

Còn nếu muốn thử hải sản tươi với giá phải chăng, Hải Sản Năm Đảnh ở An Thượng sẽ không làm bạn thất vọng. Tôm, cua, ghẹ... vừa vớt lên là vào bếp ngay.

Bạn đang hứng thú với phong cách nào? Mình sẽ sắp xếp vào lịch trình cho hợp lý nhé!"

=== ĐỊNH DẠNG JSON ===
Trả về JSON thuần (không markdown block):
{
  "reply": "Nội dung câu trả lời tinh tế, truyền cảm hứng",
  "action": "add_location" | "replace_location" | "suggest_more" | "none",
  "data": {
    "locationName": "Tên chính xác nếu có action",
    "targetDay": 1
  },
  "quickReplies": ["Hành động 1", "Hành động 2"]
}
`;

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
