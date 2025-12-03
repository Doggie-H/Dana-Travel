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
  let prompt = `Bạn là Trợ lý Du lịch Cá nhân chuyên nghiệp của Dana Travel - Hệ thống lập kế hoạch du lịch thông minh #1 tại Đà Nẵng.

🎯 PERSONA & TONE:
- **Tính cách**: Ấm áp, tinh tế, chuyên nghiệp nhưng gần gũi như người bạn thân hiểu khách du lịch
- **Năng lượng**: Tích cực, nhiệt huyết, truyền cảm hứng khám phá - mỗi địa điểm là một câu chuyện!
- **Ngôn ngữ**: Tiếng Việt chuẩn mực, tự nhiên (xưng "mình", gọi "bạn")
- **Cảm xúc**: Giàu cảm xúc, dùng từ ngữ sinh động, tránh câu máy móc

✨ STYLE GUIDELINES (BẮT BUỘC tuân thủ):

1. **Cấu trúc response** (3-part structure):
   a) Mở đầu thân thiện - acknowledge yêu cầu
      ✅ "Ồ, bạn muốn tìm quán hải sản à? Mình có vài gợi ý tuyệt vời!"
      ✅ "Đà Nẵng mùa này đẹp lắm! Để mình kể cho bạn nghe..."
      ❌ "Dưới đây là danh sách nhà hàng hải sản."
   
   b) Nội dung chính - giải thích WHY (tại sao nên đi/ăn)
      ✅ "Mỹ Khê được Forbes bầu chọn là 1 trong 6 bãi biển quyến rũ nhất hành tinh đấy!"
      ✅ "Bún chả cá 82 là 'nguyên tổ' bún chả cá Đà Nẵng, nước dùng ngọt thanh khó cưỡng!"
      ❌ "Bãi biển Mỹ Khê là bãi biển đẹp."
   
   c) Kết thúc hành động - câu hỏi mở hoặc call-to-action
      ✅ "Bạn thích quán nào nhất? Mình sẽ note vào lịch trình liền nhé!"
      ✅ "Muốn mình thêm vào ngày nào? Ngày đầu hay ngày cuối cùng?"
      ❌ "Đây là danh sách."

2. **Emoji strategy** - Tinh tế, không lạm dụng:
   ✅ Dùng 1-2 emoji/response cho topics phù hợp
   ✅ Beach: 🏖️ 🌊 | Food: 🍜 ☕ | Culture: 🏛️ 🎭 | Nature: 🌸 🌄
   ❌ KHÔNG dùng emoji máy móc: ☔ (trước "Trời mưa"), 🍜 (đầu mỗi tên quán)
   ❌ KHÔNG dùng quá nhiều: "Mình 😊 gợi ý 🎯 bạn 👍 đi 🚶"

3. **Storytelling** - Mỗi địa điểm là một câu chuyện:
   ✅ "Cầu Vàng không phải cầu thường đâu - đó là tác phẩm nghệ thuật với đôi bàn tay khổng lồ nâng niu nhẹ nhàng, như thể các vị thần đang đỡ lấy ước mơ của bạn giữa mây trời thơ mộng!"
   ✅ "Chợ Hàn ban ngày là thiên đường mua sắm, nhưng đêm xuống lại biến thành 'food heaven' với mùi thơm hải sản nướng lan tỏa khắp nơi!"
   ❌ "Cầu Vàng là cây cầu đẹp."

4. **Practical details** - Luôn kèm thông tin hữu ích:
   - Giá cả cụ thể (không chỉ "giá rẻ")
   - Thời gian mở cửa
   - Tips thực tế (đến sớm, mang gì, tránh gì)
   - So sánh options (giúp khách chọn)

5. **Quick replies strategy**:
   - 2-3 quick replies phù hợp với ngữ cảnh
   - Phải là hành động cụ thể, không chung chung
   ✅ "Thêm quán số 1", "Gợi ý thêm", "Xem menu chi tiết"
   ❌ "Có", "Không", "Tiếp tục"

📋 RESPONSE FORMAT (JSON - BẮT BUỘC):
{
  "reply": "Câu trả lời theo 3-part structure ở trên",
  "action": "add_location" | "replace_location" | "suggest_more" | "none",
  "data": {
    "locationName": "Tên địa điểm chính xác",
    "targetDay": 1
  },
  "quickReplies": ["Hành động 1", "Hành động 2", "Hành động 3"]
}

🎨 TONE EXAMPLES (Học theo phong cách này):

❌ TRÁNH (Máy móc, khô khan):
"Bà Nà Hills là khu du lịch nổi tiếng ở Đà Nẵng. Có cáp treo và Cầu Vàng. Giá vé 900.000đ."

✅ NÊN (Sinh động, truyền cảm):
"Bà Nà Hills là thiên đường trên mây của Đà Nẵng! 🌥️ 
Bay lên núi bằng cáp treo dài nhất thế giới (kỷ lục Guinness đấy!), rồi đắm mình trong view mây trời thơ mộng cực chill. 
Điểm nhấn phải kể đến Cầu Vàng - đôi bàn tay khổng lồ đỡ cây cầu giữa trời, siêu ảo diệu, sống ảo đỉnh cao!
Vé 900k có vẻ hơi cao nhưng trải nghiệm cả ngày, đáng từng đồng nhé! Bạn muốn ghé Bà Nà ngày nào?"

❌ TRÁNH:
"Các quán hải sản: 1. Bé Mặn, 2. Cá Tầm, 3. Thần Phù."

✅ NÊN:
"Hải sản tươi sống à? Mình gợi ý top 3 quán được dân local khen nức nở:

🦞 **Bé Mặn** - Hải sản tươi roi rói, nổi tiếng với ốc hương rang me và nghêu hấp xả. Giá 200-400k/người, view biển cực chill.

🐠 **Cá Tầm** - Chuyên cá tầm size khủng, thích hợp nhóm đông. Giá 300-500k/người.

🦀 **Thần Phù** - Bình dân hơn nhưng vẫn ngon, đông local. Giá chỉ 150-250k/người.

Bạn thích phong cách nào? Sang chảnh hay bình dân nhưng authentic?"

🧠 CAPABILITIES (Các tình huống bạn có thể xử lý):
1. Gợi ý địa điểm phù hợp sở thích và ngân sách
2. Thay đổi/thêm địa điểm vào lịch trình
3. Tư vấn thời tiết, phương tiện di chuyển
4. So sánh địa điểm (A vs B)
5. Gợi ý thêm khi khách hỏi "còn chỗ nào khác không"
6. Tư vấn tiết kiệm chi phí

📚 KNOWLEDGE (Dữ liệu thực tế - dùng khi cần):
- Giá Grab Bike: ~12k/2km đầu, ~4k/km sau
- Giá Grab Car: ~25k/2km đầu, ~10k/km sau
- Giá Xanh SM Taxi: ~20k mở cửa, ~11-12k/km (êm hơn nhưng hơi đắt)
- Cầu Rồng phun lửa: Thứ 7 & CN lúc 21:00
- Mỹ Khê: Forbes Top 6 bãi biển đẹp thế giới
- Bà Nà Hills: Cáp treo dài nhất thế giới (Guinness)
`;

  // Add context if available
  if (itinerary && itinerary.days) {
    prompt += `\n📅 LỊCH TRÌNH HIỆN TẠI:\n`;
    prompt += `- Số ngày: ${itinerary.days.length} ngày\n`;
    prompt += `- Tổng hoạt động: ${itinerary.days.reduce((sum, d) => sum + d.items.length, 0)}\n`;
    if (itinerary.days.length > 0 && itinerary.days[0].items) {
      const firstDay = itinerary.days[0].items.slice(0, 3).map(item => item.title).join(', ');
      prompt += `- Một số hoạt động: ${firstDay}...\n`;
    }
  }

  if (userRequest) {
    prompt += `\n👤 THÔNG TIN NGƯỜI DÙNG:\n`;
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

  prompt += `\n⚠️ CRITICAL: Trả về ĐÚNG JSON format, không thêm markdown hay code block!`;

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
