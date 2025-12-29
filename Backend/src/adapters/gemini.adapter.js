
import { getAllLocations } from "../services/location.service.js";
import { getAllKnowledge } from "../services/knowledge.base.service.js";

// --- CONFIG ---
const API_KEY = process.env.GEMINI_API_KEY || "";

/**
 * Xử lý chat với AI (Gemini) - SAFE DYNAMIC IMPORT VERSION
 * 
 * @param {string} userMessage - Tin nhắn người dùng.
 * @param {Object} context - Ngữ cảnh (lịch trình, history...).
 * @returns {Promise<Object>} { reply, quickReplies }
 */
export async function processChatWithAI(userMessage, context = {}) {
  // 1. DYNAMIC IMPORT: Chỉ load thư viện khi hàm được gọi
  // Giúp server không bị crash lúc khởi động nếu thiếu node_modules
  let GoogleGenerativeAI;
  try {
    const module = await import("@google/generative-ai");
    GoogleGenerativeAI = module.GoogleGenerativeAI;
  } catch (e) {
    console.warn("⚠️ @google/generative-ai not installed. Switching to Mock Mode.");
  }

  // 2. REAL AI MODE
  if (GoogleGenerativeAI && API_KEY) {
    try {
      const genAI = new GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

      const [locations, knowledgeItems] = await Promise.all([
        getAllLocations(),
        getAllKnowledge()
      ]);

      const locationNames = locations.map(l => l.name).join(", ");

      // Format Knowledge Base for AI Context
      const knowledgeContext = knowledgeItems.map(k =>
        `- Q: "${k.question}" -> A: "${k.answer}"`
      ).join("\n");

      const prompt = `
Bạn là Dana - một thổ địa Đà Nẵng trẻ trung (Gen Z), sành điệu và cực kỳ tinh tế. 🌟
Bạn không phải là một "AI vô cảm" hay một "nhân viên sale công nghiệp". Bạn là một người bạn đường nhiệt tình.

QUY TẮC CỐT LÕI (TONE & VOICE):
1.  **Ngôn ngữ:** Dùng từ ngữ đời thường, trẻ trung (VD: "check-in", "sống ảo", "chill", "chốt đơn", "must-try", "kèo này thơm").
    *   ⛔ TUYỆT ĐỐI TRÁNH: "Mật độ", "Sở thích", "Tổng quan", "Phân tích", "Preference", "Vibe check" (dùng từ này kiểu AI rất sượng).
2.  **Thái độ:**
    *   Đừng chỉ trích (VD: Thay vì "Lịch trình này quá nhiều đồ ngọt", hãy nói "Ăn ngọt nhiều hơi ngán xíu, mình đổi gió qua món mặn nha?").
    *   Luôn đưa giải pháp thay thế đi kèm lợi ích (Ngon hơn, Rẻ hơn, Gần hơn).
3.  **Xưng hô:** Mình - Bạn (Rất thân thiện).

QUY ĐỊNH TRÌNH BÀY (VISUAL):
1.  **Header:** Dùng emoji đầu dòng cho sinh động (VD: ✨ Giải pháp, 📅 Lịch trình chốt).
2.  **Highlight:** Dùng **In đậm** cho tên quán/món ăn/giá tiền.
3.  **Ngắn gọn:** Viết như đang chat, không viết văn nghị luận dài dòng.

[Dữ liệu địa điểm tham khảo]: ${locationNames}
[Kiến thức bổ sung]:
${knowledgeContext}

[Ngữ cảnh chuyến đi]: ${JSON.stringify(context)}

User: "${userMessage}"
Dana (Gen Z Mode On):`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return {
        reply: response.text(),
        quickReplies: []
      };
    } catch (err) {
      console.error("Gemini Real Error:", err);
    }
  }

  // 3. FALLBACK / MOCK MODE
  return {
    reply: `[AI Mock Response] Bạn vừa nói: "${userMessage}"\n(Hệ thống đang chạy chế độ Offline do chưa cài đặt thư viện AI hoặc thiếu API Key).`,
    quickReplies: []
  };
}
