// file: backend/adapters/geminiAdapter.js

/**
 * Gemini AI Adapter - tích hợp Google Gemini API
 *
 * Vai trò: adapter layer, gọi Gemini API để hiểu ngữ cảnh chat
 * Input: user message, context (itinerary, userRequest)
 * Output: {intent, reply, suggestions?, itineraryPatch?}
 *
 * NOTE: Cần GEMINI_API_KEY trong .env
 */

// Model & API URL configuration
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1/models/${GEMINI_MODEL}:generateContent`;

/**
 * Call Gemini API
 * @param {string} prompt
 * @returns {Promise<string>}
 */
async function callGeminiAPI(prompt) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.warn("GEMINI_API_KEY not configured, using fallback");
    return null;
  }

  try {
    // Add timeout via AbortController
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // 10s

    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
          topP: 0.8,
          topK: 40,
        },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(`Gemini API error (${response.status}): ${text}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;
  } catch (error) {
    console.error("Gemini API error:", error);
    return null;
  }
}

/**
 * Build system prompt with context
 */
function buildSystemPrompt(itinerary, userRequest) {
  let prompt = `Bạn là "Trợ lý Du lịch Cao cấp" (Personal Travel Concierge) cho ứng dụng du lịch hạng sang tại Đà Nẵng.
Persona:
- Thân thiện, ấm áp, nhưng vô cùng chuyên nghiệp và tinh tế.
- Ngôn ngữ: Tiếng Việt tự nhiên, giàu cảm xúc, sử dụng từ ngữ chuẩn mực, lịch sự (xưng "mình" - gọi "bạn").
- Tuyệt đối KHÔNG dùng các câu máy móc như "Tôi là AI", "Tôi có thể giúp gì". Hãy giao tiếp như một người bạn am hiểu và tận tâm.

Nhiệm vụ:
- Giúp người dùng thiết kế trải nghiệm du lịch hoàn hảo.
- Gợi ý địa điểm ăn uống, vui chơi phù hợp với sở thích và ngân sách.
- Hỗ trợ thay đổi hoặc THÊM địa điểm vào lịch trình.

Capabilities (Khả năng):
1. Gợi ý hoạt động trong nhà khi trời mưa.
2. Tìm quán ăn theo ngân sách (Bình dân/Trung bình/Sang trọng).
3. Đổi địa điểm (Replace) nếu người dùng không thích.
4. THÊM địa điểm (Add) vào lịch trình nếu người dùng yêu cầu.

Knowledge (Kiến thức - Dữ liệu thực tế tại Đà Nẵng):
- Giá cước GrabBike: ~12.000đ/2km đầu, sau đó ~4.000đ/km.
- Giá cước GrabCar (4 chỗ): ~25.000đ/2km đầu, sau đó ~10.000đ/km.
- Giá cước Xanh SM Bike: ~12.000đ/2km đầu, sau đó ~4.000đ/km.
- Giá cước Xanh SM Taxi (Điện): ~20.000đ giá mở cửa, sau đó ~11.000đ-12.000đ/km.
- Lưu ý: Giá có thể thay đổi tùy thời điểm (giờ cao điểm, mưa bão) hoặc khuyến mãi. Xanh SM thường êm ái hơn nhưng giá có thể nhỉnh hơn Grab một chút ở chặng ngắn.

Output Format:
Bạn BẮT BUỘC phải trả về kết quả dưới dạng JSON object (không markdown, không code block) theo cấu trúc sau:
{
  "reply": "Câu trả lời của bạn dành cho người dùng (thân thiện, cảm xúc)",
  "action": "none" | "replace_location" | "add_location",
  "data": {
    "locationName": "Tên địa điểm cần xử lý (nếu có action)",
    "targetDay": 1 (Ngày muốn thêm vào, mặc định là 1 nếu không rõ)
  },
  "quickReplies": ["Gợi ý 1", "Gợi ý 2", "Gợi ý 3"]
}
`;

  if (itinerary) {
    prompt += `\nContext Lịch trình hiện tại:\n`;
    prompt += `- Số ngày: ${itinerary.days.length} ngày\n`;
    prompt += `- Tổng hoạt động: ${itinerary.days.reduce((sum, d) => sum + d.items.length, 0)}\n`;
  }

  if (userRequest) {
    prompt += `\nThông tin người dùng:\n`;
    prompt += `- Ngân sách: ${userRequest.budgetTotal.toLocaleString()} VND\n`;
    prompt += `- Nhóm: ${userRequest.numPeople} người\n`;
  }

  return prompt;
}

/**
 * Process chat with AI
 */
export async function processChatWithAI(message, context = {}) {
  const systemPrompt = buildSystemPrompt(
    context.itinerary,
    context.userRequest
  );
  const fullPrompt = `${systemPrompt}\n\nUser: ${message}\nAssistant:`;

  if (process.env.NODE_ENV !== "production") {
    console.log(`[Gemini] Using model: ${GEMINI_MODEL}`);
  }

  const aiResponse = await callGeminiAPI(fullPrompt);

  if (!aiResponse) {
    return null; // Fallback to keyword matching
  }

  // Clean up response to ensure valid JSON
  let cleanText = aiResponse.replace(/```json/g, "").replace(/```/g, "").trim();
  
  try {
    const parsed = JSON.parse(cleanText);
    return {
      reply: parsed.reply,
      quickReplies: parsed.quickReplies || [],
      action: parsed.action,
      data: parsed.data
    };
  } catch (e) {
    console.error("Failed to parse AI JSON response:", e);
    // Fallback if JSON parsing fails
    return {
      reply: cleanText,
      quickReplies: []
    };
  }
}



export default {
  processChatWithAI,
};
