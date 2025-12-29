/**
 * Service xử lý logic Chatbot.
 * Kết hợp Rule-based (từ khóa) và AI (Gemini) để trả lời người dùng.
 */

import { getAllLocations, getLocationById } from "./location.service.js";
import { pickRandom } from "../utils/array.utils.js";
import { processChatWithAI } from "../adapters/gemini.adapter.js";
import { matchKnowledge } from "./knowledge.service.js";

/**
 * Xử lý tin nhắn từ người dùng và trả về phản hồi.
 * 
 * @param {string} message - Nội dung tin nhắn của user.
 * @param {Object} context - Ngữ cảnh cuộc trò chuyện (lịch trình hiện tại, v.v.).
 * @returns {Promise<Object>} - Đối tượng chứa câu trả lời (reply), gợi ý (suggestions), và hành động (itineraryPatch).
 */
export async function processChatMessage(message, context = {}) {
  const lowerMsg = message.toLowerCase().trim();

  // 1. Kiểm tra Context: Đang chờ thay thế địa điểm?
  if (context.pendingReplacement) {
     return handleReplacementFollowUp(message, context);
  }

  // 2. Intent: Thêm địa điểm cụ thể (từ nút bấm "Thêm ...")
  if (lowerMsg.startsWith("thêm ")) {
     return handleAddSpecificIntent(lowerMsg, context);
  }

  // Ưu tiên kiểm tra Knowledge Base
  const kb = await matchKnowledge(lowerMsg);
  if (kb) {
    return {
      reply: kb.reply,
      quickReplies: [],
      suggestions: [],
    };
  }

  // Intent: Thời tiết / Mưa
  if (
    lowerMsg.includes("mưa") ||
    lowerMsg.includes("weather") ||
    lowerMsg.includes("thời tiết") ||
    lowerMsg.includes("rain")
  ) {
    const indoorLocations = await getAllLocations({ indoor: true });
    return handleWeatherIntent(indoorLocations);
  }

  // Intent: Ăn uống
  if (
    lowerMsg.includes("ăn") ||
    lowerMsg.includes("food") ||
    lowerMsg.includes("quán") ||
    lowerMsg.includes("nhà hàng") ||
    lowerMsg.includes("restaurant")
  ) {
    return handleFoodIntent(lowerMsg);
  }

  // Intent: Điều chỉnh / Thay đổi lịch trình
  if (
    lowerMsg.includes("điều chỉnh") ||
    lowerMsg.includes("chỉnh sửa") ||
    lowerMsg.includes("sửa lịch trình")
  ) {
    return handleViewItineraryIntent(context);
  }

  // Intent: Đổi địa điểm
  if (
    lowerMsg.includes("đổi") ||
    lowerMsg.includes("thay") ||
    lowerMsg.includes("change") ||
    lowerMsg.includes("replace")
  ) {
    return handleChangeLocationIntent(lowerMsg, context);
  }

  // Intent: Ngân sách (TODO: Implement logic)
  if (
    lowerMsg.includes("ngân sách") ||
    lowerMsg.includes("budget") ||
    lowerMsg.includes("tiền") ||
    lowerMsg.includes("chi phí")
  ) {
    // return handleBudgetIntent(context);
  }

  // Intent: Thêm địa điểm (Được kích hoạt từ Quick Reply: "Thêm quán đầu tiên")
  if (
    lowerMsg.includes("thêm quán đầu tiên") ||
    lowerMsg.includes("thêm địa điểm đầu tiên") ||
    lowerMsg.includes("thêm quán số 1")
  ) {
    // Gọi AI nhưng với prompt định hướng rõ ràng để nó lấy context
    const historyContext = context.lastBotMessage ? `\n\n[Context - Danh sách vừa gợi ý]:\n${context.lastBotMessage}` : "";
    const aiResponse = await processChatWithAI(
      `Tôi muốn thêm địa điểm đầu tiên (số 1) từ danh sách bạn vừa gợi ý vào lịch trình. Hãy xác định tên địa điểm đó dựa trên Context bên dưới và trả về action 'add_location'.${historyContext}`,
      context
    );
    if (aiResponse && aiResponse.action === "add_location") {
        return await handleAddLocationIntent(aiResponse.data.locationName, aiResponse.reply);
    }
  }

  // Intent: Xem danh sách / Xem thêm (Fix bug Fallback)
  if (
    lowerMsg.includes("xem danh sách") ||
    lowerMsg.includes("xem them") ||
    lowerMsg.includes("xem thêm")
  ) {
    return handleViewListIntent();
  }

  // Intent: Xem lịch trình (Fix bug Fallback)
  if (
    lowerMsg.includes("xem lịch trình") ||
    lowerMsg.includes("kiểm tra lịch trình") ||
    lowerMsg.includes("lịch trình của tôi") ||
    lowerMsg.includes("lịch trình đâu")
  ) {
    return handleViewItineraryIntent(context);
  }

  // Intent: Xuất file / PDF (Fix bug Raw JSON)
  if (
    lowerMsg.includes("xuất file") ||
    lowerMsg.includes("xuất pdf") ||
    lowerMsg.includes("in lịch trình") ||
    lowerMsg.includes("export")
  ) {
    return handleExportIntent();
  }

  // Fallback: Sử dụng AI (Gemini)
  try {
    const aiResponse = await processChatWithAI(message, context);
    if (aiResponse) {
      // Xử lý các hành động đặc biệt từ AI (nếu có)
      
      // Action: Thêm địa điểm
      if (aiResponse.action === "add_location" && aiResponse.data?.locationName) {
        return await handleAddLocationIntent(aiResponse.data.locationName, aiResponse.reply);
      }
      
      // Action: Đổi địa điểm (AI phát hiện ý định đổi)
      if (aiResponse.action === "replace_location" && aiResponse.data?.locationName) {
         return handleChangeLocationIntent(`đổi ${aiResponse.data.locationName}`, context);
      }

      // Trả về phản hồi thông thường từ AI
      let cleanReply = aiResponse.reply;
      
      // SANITIZER: Kiểm tra nếu phản hồi là JSON raw (do AI render lỗi)
      if (typeof cleanReply === 'string' && cleanReply.trim().startsWith('{')) {
          try {
              const parsed = JSON.parse(cleanReply);
              if (parsed.reply) cleanReply = parsed.reply;
          } catch (e) {
              console.warn("Failed to sanitize JSON reply from AI:", e);
              // Nếu lỗi parse, giữ nguyên hoặc fallback
          }
      }

      return {
        reply: cleanReply,
        quickReplies: aiResponse.quickReplies || [],
        suggestions: aiResponse.suggestions || [],
        itineraryPatch: aiResponse.itineraryPatch,
      };
    }
  } catch (err) {
    console.error("Lỗi khi gọi AI adapter:", err);
  }

  // Fallback cuối cùng nếu AI lỗi
  return {
    reply:
      `Chào bạn, mình là trợ lý du lịch riêng của bạn.\n\n` +
      `Mình có thể giúp bạn tìm quán ăn ngon, gợi ý điểm vui chơi (kể cả khi trời mưa), hoặc điều chỉnh lịch trình cho phù hợp nhất.\n\n` +
      `Bạn cứ thoải mái chia sẻ mong muốn nhé!`,
    quickReplies: [
      "Gợi ý quán ăn ngon",
      "Chỗ chơi khi trời mưa",
      "Điều chỉnh lịch trình",
    ],
  };
}

// --- CÁC HÀM XỬ LÝ INTENT (INTENT HANDLERS) ---

/**
 * Xử lý intent "Xuất file / PDF".
 * Tính năng chưa hỗ trợ, trả về thông báo khéo léo.
 */
function handleExportIntent() {
  return {
    reply: "Được rồi, mình sẽ chuyển bạn sang trang Lịch trình để xuất file/in ngay nhé! Chờ xíu...",
    action: "navigate_results_print",
    quickReplies: [],
  };
}

// --- CÁC HÀM XỬ LÝ INTENT (INTENT HANDLERS) ---

/**
 * Xử lý intent "Xem lịch trình".
 * Trả về tóm tắt lịch trình hiện tại.
 */
async function handleViewItineraryIntent(context) {
  const itinerary = context?.itinerary;

  if (!itinerary || !itinerary.days || itinerary.days.length === 0) {
    return {
      reply: "Bạn chưa có lịch trình nào. Hãy thử tạo một lịch trình mới ở trang Dự tính nhé!",
      quickReplies: ["Tạo lịch trình ngay", "Gợi ý địa điểm hot"],
    };
  }

  let reply = `Đây là lịch trình hiện tại của bạn (${itinerary.days.length} ngày):\n\n`;
  
  itinerary.days.forEach((day, index) => {
    reply += `📅 Ngày ${index + 1} (${day.items.length} địa điểm):\n`;
    day.items.forEach((item, i) => {
      reply += `   ${i + 1}. ${item.title || item.name} (${item.type === 'restaurant' ? '🍳' : '📍'})\n`;
    });
    reply += "\n";
  });

  reply += "Bạn có muốn thay đổi chỗ nào không?";

  return {
    reply,
    quickReplies: ["Đổi địa điểm đầu tiên", "Thêm địa điểm mới", "Xuất file PDF"],
  };
}

// --- CÁC HÀM XỬ LÝ INTENT (INTENT HANDLERS) ---

/**
 * Xử lý intent "Xem danh sách / Xem thêm".
 * Gợi ý ngẫu nhiên các địa điểm nổi bật.
 */
async function handleViewListIntent() {
  const allLocs = await getAllLocations();
  const suggestions = pickRandom(allLocs, 5);

  return {
    reply: "Dưới đây là một số địa điểm thú vị ở Đà Nẵng mình gợi ý cho bạn:",
    suggestions: suggestions.map(loc => ({
        locationId: loc.id,
        name: loc.name,
        type: loc.type,
        reason: "Gợi ý ngẫu nhiên",
        priceLevel: loc.priceLevel
    })),
    // Sử dụng chung format nút bấm "Thêm ..."
    quickReplies: suggestions.map(s => `Thêm ${s.name}`).concat(["Xem thêm gợi ý"]),
  };
}

// --- CÁC HÀM XỬ LÝ INTENT (INTENT HANDLERS) ---

/**
 * Xử lý intent "Thời tiết/Mưa".
 * Gợi ý các địa điểm trong nhà.
 */
function handleWeatherIntent(indoorLocations) {
  // Chọn ngẫu nhiên 5 địa điểm trong nhà
  const suggestions = pickRandom(indoorLocations, 5);

  if (!suggestions || suggestions.length === 0) {
      return {
          reply: "Hiện tại mình chưa tìm thấy địa điểm trong nhà nào phù hợp. Tuy nhiên, Đà Nẵng vẫn còn rất nhiều điểm đến hấp dẫn khác, bạn có muốn xem thử không?",
          quickReplies: ["Gợi ý địa điểm khác", "Giữ nguyên lịch trình"],
      };
  }

  const reply =
    `Trời mưa cũng không sao đâu! Đà Nẵng có nhiều chỗ trong nhà thú vị lắm. Bạn tham khảo thử nhé:\n\n` +
    suggestions
      .map(
        (loc, i) =>
          `${i + 1}. ${loc.name} (${loc.area || ''})${
            loc.ticket
              ? ` - Vé: ${loc.ticket.toLocaleString("vi-VN")}₫`
              : " - Miễn phí"
          }`
      )
      .join("\n") +
    `\n\nBạn có muốn đổi địa điểm nào trong lịch trình sang mấy chỗ này không?`;

  return {
    reply,
    suggestions: suggestions.map((loc) => ({
      locationId: loc.id,
      name: loc.name,
      type: loc.type,
      reason: "Hoạt động trong nhà, không lo thời tiết",
    })),
    quickReplies: ["Đổi địa điểm đầu tiên", "Giữ nguyên lịch trình"],
  };
}

/**
 * Xử lý intent "Ăn uống".
 * Gợi ý quán ăn theo mức giá.
 */
async function handleFoodIntent(message) {
  let priceLevel = "moderate"; // Mặc định là trung bình

  // Phân tích mức giá từ tin nhắn
  if (
    message.includes("rẻ") ||
    message.includes("bình dân") ||
    message.includes("cheap")
  ) {
    priceLevel = "cheap";
  } else if (
    message.includes("sang") ||
    message.includes("cao cấp") ||
    message.includes("expensive")
  ) {
    priceLevel = "expensive";
  }

  // Lấy danh sách nhà hàng phù hợp
  const restaurants = await getAllLocations({ type: "restaurant", priceLevel });
  const suggestions = pickRandom(restaurants, 5);

  const priceLevelLabel = {
    cheap: "bình dân, ngon bổ rẻ",
    moderate: "giá cả hợp lý",
    expensive: "sang trọng, cao cấp",
  }[priceLevel];

  const reply =
    `Mình tìm thấy vài quán ${priceLevelLabel} được đánh giá cao nè:\n\n` +
    suggestions
      .map((loc, i) => {
        const priceRange = {
          cheap: "30k-60k",
          moderate: "80k-150k",
          expensive: "200k-400k",
        }[loc.priceLevel || priceLevel] || "Tùy món";
        return `${i + 1}. ${loc.name} (${loc.area || ''}) - Tầm ${priceRange}/người`;
      })
      .join("\n") +
    `\n\nBạn ưng quán nào không? Mình thêm vào lịch trình cho nhé!`;

  return {
    reply,
    suggestions: suggestions.map((loc) => ({
      locationId: loc.id,
      name: loc.name,
      type: loc.type,
      priceLevel: loc.priceLevel,
      reason: `Quán ăn ${priceLevelLabel}`,
    })),
    quickReplies: suggestions.map(s => `Thêm ${s.name}`).concat(["Xem thêm gợi ý"]),
  };
}

/**
 * Xử lý intent "Thêm [Tên địa điểm]" (từ nút bấm).
 * Hỏi người dùng muốn thay thế địa điểm nào.
 */
async function handleAddSpecificIntent(message, context) {
  const locationName = message.replace(/^thêm\s+/i, "").trim();

  // Fix bug: Người dùng bấm "Thêm địa điểm mới" mà Bot lại đi tìm quán tên là "Địa điểm mới"
  const genericKeywords = ["địa điểm mới", "mới", "new location", "địa điểm khác"];
  if (genericKeywords.includes(locationName.toLowerCase())) {
      const allLocs = await getAllLocations();
      const suggestions = pickRandom(allLocs, 5);
      return {
          reply: "Bạn muốn thêm địa điểm nào nè? Nhắn tên cho mình hoặc chọn từ gợi ý bên dưới nhé:",
          suggestions: suggestions.map(loc => ({
              locationId: loc.id,
              name: loc.name,
              type: loc.type,
              reason: "Gợi ý thêm mới",
          })),
          quickReplies: suggestions.map(s => `Thêm ${s.name}`).concat(["Xem danh sách đầy đủ"])
      };
  }

  const searchResults = await getAllLocations({ search: locationName });
  const targetLocation = searchResults[0];

  if (!targetLocation) {
    return {
      reply: `Mình tìm không thấy địa điểm "${locationName}". Bạn kiểm tra lại tên nhé?`,
      quickReplies: ["Xem lại danh sách", "Thêm địa điểm mới"],
    };
  }

  // Logic cảnh báo ngân sách
  let warningMessage = "";
  if (context?.userRequest?.budgetTotal) {
      const budgetPerPerson = context.userRequest.budgetTotal / (context.userRequest.numPeople || 1);
      const locationCost = (targetLocation.ticket || 0) + (targetLocation.avgPrice || 0);
      
      // Ngưỡng: Nếu chi phí địa điểm > 30% ngân sách trung bình 1 ngày (giả sử đi 3 ngày)
      // Hoặc đơn giản: Nếu là địa điểm "expensive" mà ngân sách < 5 triệu
      const isExpensive = targetLocation.priceLevel === 'expensive' || locationCost > 500000;
      const isLowBudget = budgetPerPerson < 2000000; // Dưới 2tr/người là thấp

      if (isExpensive && isLowBudget) {
          warningMessage = `\n\n⚠️ **Lưu ý:** Địa điểm này có chi phí khá cao (${locationCost.toLocaleString()}đ/người), có thể làm vượt ngân sách dự kiến của bạn đó.`;
      }
  }

  return {
    reply: `Bạn muốn thêm "${targetLocation.name}" vào lịch trình.${warningMessage}\n\nBạn muốn **thay thế cho địa điểm nào** đang có trong lộ trình? (Nhắn tên địa điểm cũ hoặc "Thêm mới" để chèn vào cuối)`,
    context: {
      pendingReplacement: targetLocation // Lưu context để chờ câu trả lời tiếp theo
    },
    quickReplies: ["Thêm vào cuối ngày", "Xem lịch trình hiện tại"] 
  };
}

/**
 * Xử lý câu trả lời khi đang chờ thay thế địa điểm.
 */
async function handleReplacementFollowUp(message, context) {
  const newLocation = context.pendingReplacement;
  if (!newLocation) return null; // Should not happen if logic is correct

  // Nếu user chọn "Thêm mới" hoặc similar
  if (message.toLowerCase().includes("thêm mới") || message.toLowerCase().includes("thêm vào cuối")) {
     return {
        reply: `Đã thêm "${newLocation.name}" vào cuối hành trình!`,
        itineraryPatch: {
          action: "add",
          locationId: newLocation.id,
          message: `Đã thêm ${newLocation.name}`
        },
        context: { pendingReplacement: null } // Clear context
     };
  }

  // Tìm địa điểm cũ muốn thay thế
  // Logic đơn giản: User nhắn tên địa điểm cũ -> Tìm trong DB (hoặc ideally, tìm trong Itinerary hiện tại nếu có)
  // Tạm thời tìm trong DB để lấy ID
  const searchResults = await getAllLocations({ search: message });
  const oldLocation = searchResults[0];

  if (!oldLocation) {
     return {
        reply: `Mình không tìm thấy địa điểm "${message}" để thay thế. Bạn nhắn lại đúng tên được không?`,
        context: { pendingReplacement: newLocation } // Keep context
     };
  }

  return {
    reply: `Đã thay thế "${oldLocation.name}" bằng "${newLocation.name}" và cập nhật lộ trình!`,
    itineraryPatch: {
      action: "replace",
      oldLocationId: oldLocation.id,
      newLocationId: newLocation.id,
      newItem: {
        id: newLocation.id,
        name: newLocation.name,
        type: newLocation.type,
        // Giữ lại timeStart/End của item cũ ở Frontend
      },
      message: `Đổi ${oldLocation.name} -> ${newLocation.name}`
    },
    context: { pendingReplacement: null } // Clear context
  };
}

/**
 * Xử lý intent "Đổi địa điểm".
 * Tìm địa điểm thay thế tương tự.
 */
async function handleChangeLocationIntent(message, context) {
  try {
    // Trích xuất tên địa điểm muốn đổi từ tin nhắn
    const match = message.match(/(?:đổi|thay|change)\s+(.+)/i);

    // Danh sách các từ khóa chung chung
    const genericTerms = ["địa điểm", "chỗ", "location", "place", "quán", "điểm đến"];
    const searchTerm = match ? match[1].trim() : "";
    const isGeneric = genericTerms.includes(searchTerm.toLowerCase());
    
    // Debug
    console.log(`[DEBUG] Change Intent: searchTerm="${searchTerm}", hasContext=${!!context?.itinerary}`);

    if (!match || isGeneric) {
      return {
        reply:
          "Bạn muốn đổi địa điểm nào trong lịch trình nhỉ? Nhắn rõ tên giúp mình nhé.\n\n" +
          'Ví dụ: "Đổi Bà Nà Hills" hoặc "Thay Bảo Tàng Chăm"',
        quickReplies: ["Xem lịch trình hiện tại", "Đổi địa điểm đầu tiên"],
      };
    }

    let targetLocation = null;

    // Logic nhận diện "địa điểm đầu tiên" / "số 1"
    const isFirstLocationReq = 
      searchTerm.toLowerCase().includes("đầu tiên") || 
      searchTerm.toLowerCase().includes("số 1") ||
      searchTerm.toLowerCase().includes("quán đầu");

    if (isFirstLocationReq) {
         if (context?.itinerary?.days?.[0]?.items?.[0]) {
            const firstItemId = context.itinerary.days[0].items[0].id;
            console.log("[DEBUG] First Item ID:", firstItemId);
            targetLocation = await getLocationById(firstItemId);
         } else {
             console.log("[DEBUG] No itinerary context found for 'first location'");
         }
    }

    // Nếu không phải là "đầu tiên" hoặc không tìm thấy trong context, tìm theo tên
    if (!targetLocation) {
        const searchResults = await getAllLocations({ search: searchTerm });
        targetLocation = searchResults[0]; 
    }

    if (!targetLocation) {
      const randomLocs = await getAllLocations();
      return {
        reply:
          `Mình tìm không thấy địa điểm "${searchTerm}" trong hệ thống. Hay là bạn thử mấy chỗ này xem:\n\n` +
          pickRandom(randomLocs, 5)
            .map((loc) => `• ${loc.name}`)
            .join("\n"),
        quickReplies: ["Xem danh sách địa điểm"],
      };
    }
    
    // ... rest of logic ...
    
    // Tìm các địa điểm thay thế cùng loại (ví dụ: cùng là bảo tàng, cùng là công viên)
    const sameType = await getAllLocations({ type: targetLocation.type });
    const alternativesList = sameType.filter(l => l.id !== targetLocation.id);

    // Ưu tiên các địa điểm có cùng tag (ví dụ: cùng tag 'văn hóa')
    const withOverlap = alternativesList.filter((loc) =>
      Boolean(
        Array.isArray(loc.tags) &&
          Array.isArray(targetLocation.tags) &&
          loc.tags.some((tag) => targetLocation.tags.includes(tag))
      )
    );

    const alternatives = (withOverlap.length > 0 ? withOverlap : alternativesList).slice(0, 5);

    if (alternatives.length === 0) {
      return {
        reply: `Tiếc quá, mình chưa tìm thấy chỗ nào tương tự "${targetLocation.name}" để thay thế lúc này.`,
        quickReplies: ["Xem địa điểm khác"],
      };
    }

    const reply =
      `Nếu không thích ${targetLocation.name}, bạn thử tham khảo mấy chỗ này xem sao:\n\n` +
      alternatives
        .map(
          (loc, i) =>
            `${i + 1}. ${loc.name} (${loc.area || ''})${
              loc.ticket ? ` - Vé: ${loc.ticket.toLocaleString("vi-VN")}₫` : ""
            }\n` + `   - ${loc.tags?.slice(0, 3).join(", ")}`
        )
        .join("\n\n") +
      `\n\nBạn muốn chốt đổi sang chỗ nào?`;

    // Tạo patch để cập nhật lịch trình (Frontend sẽ xử lý cái này)
    const itineraryPatch = {
      action: "replace",
      oldLocationId: targetLocation.id,
      newLocationId: alternatives[0].id,
      message: `Đã đổi ${targetLocation.name} → ${alternatives[0].name}`,
    };

    return {
      reply,
      suggestions: alternatives.map((loc) => ({
        locationId: loc.id,
        name: loc.name,
        type: loc.type,
        reason: `Thay thế cho ${targetLocation.name}`,
      })),
      itineraryPatch,
      quickReplies: alternatives.slice(0, 3).map((loc) => `Đổi sang ${loc.name}`),
    };

  } catch (err) {
      console.error("[ERROR] handleChangeLocationIntent:", err);
      return {
          reply: "Xin lỗi, mình đang gặp trục trặc khi xử lý yêu cầu đổi địa điểm này. Bạn thử lại với tên địa điểm cụ thể nhé!",
          quickReplies: ["Xem lịch trình"],
      };
  }
}

/**
 * Xử lý intent "Thêm địa điểm" (thường được gọi từ AI).
 */
async function handleAddLocationIntent(locationName, aiReply) {
  const searchTerm = locationName.trim();
  const searchResults = await getAllLocations({ search: searchTerm });
  const targetLocation = searchResults[0];

  if (!targetLocation) {
    return {
      reply: `${aiReply}\n\n(Tuy nhiên, mình tìm trong hệ thống chưa thấy địa điểm "${locationName}". Bạn thử kiểm tra lại tên xem sao nhé?)`,
      quickReplies: ["Gợi ý địa điểm khác"],
    };
  }

  // Tạo patch để thêm địa điểm
  const itineraryPatch = {
    action: "add",
    locationId: targetLocation.id,
    message: `Đã thêm ${targetLocation.name} vào lịch trình`,
  };

  return {
    reply: `${aiReply}\n\nMình đã tìm thấy "${targetLocation.name}" và thêm vào lịch trình cho bạn rồi nhé!`,
    suggestions: [{
      locationId: targetLocation.id,
      name: targetLocation.name,
      type: targetLocation.type,
      reason: "Được thêm theo yêu cầu",
    }],
    itineraryPatch,
    quickReplies: ["Xem lịch trình mới", "Thêm địa điểm khác"],
  };
}

export default {
  processChatMessage,
};
