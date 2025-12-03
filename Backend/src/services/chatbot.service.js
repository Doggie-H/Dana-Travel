// file: backend/services/suggestionService.js

/**
 * Suggestion Service - xử lý chatbot intent & gợi ý thay thế
 *
 * Vai trò: parse user message, detect intent, trả về suggestions
 * Input: {message, currentItinerary?}
 * Output: {reply, suggestions[], itineraryPatch?}
 *
 * Supported intents:
 * 1. "mưa" / "weather" -> gợi ý indoor locations
 * 2. "ăn" / "food" -> gợi ý restaurants theo priceLevel
 * 3. "đổi" + location name -> gợi ý thay thế location
 *
 * TODO: Tích hợp Gemini AI để hiểu ngữ cảnh tốt hơn
 */

import { getAllLocations } from "./location.service.js";
import { pickRandom } from "../utils/array.utils.js";
import { processChatWithAI } from "../adapters/gemini.adapter.js";
import { matchKnowledge } from "./knowledge.service.js";

export async function processChatMessage(message, context = {}) {
  const lowerMsg = message.toLowerCase().trim();

  // 0) Check Knowledge Base
  const kb = await matchKnowledge(lowerMsg);
  if (kb) {
    return {
      reply: kb.reply,
      quickReplies: [],
      suggestions: [],
    };
  }

  // 1. Intent: Weather / Rain
  if (
    lowerMsg.includes("mưa") ||
    lowerMsg.includes("weather") ||
    lowerMsg.includes("thời tiết") ||
    lowerMsg.includes("rain")
  ) {
    const indoorLocations = await getAllLocations({ indoor: true });
    return handleWeatherIntent(indoorLocations);
  }

  // 2. Intent: Food
  if (
    lowerMsg.includes("ăn") ||
    lowerMsg.includes("food") ||
    lowerMsg.includes("quán") ||
    lowerMsg.includes("nhà hàng") ||
    lowerMsg.includes("restaurant")
  ) {
    return handleFoodIntent(lowerMsg);
  }

  // 3. Intent: Change Location
  if (
    lowerMsg.includes("đổi") ||
    lowerMsg.includes("thay") ||
    lowerMsg.includes("change") ||
    lowerMsg.includes("replace")
  ) {
    return handleChangeLocationIntent(lowerMsg);
  }

  // 4. Intent: Budget
  if (
    lowerMsg.includes("ngân sách") ||
    lowerMsg.includes("budget") ||
    lowerMsg.includes("tiền") ||
    lowerMsg.includes("chi phí")
  ) {
    return handleBudgetIntent(context);
  }

  // Default: Use AI
  try {
    const aiResponse = await processChatWithAI(message, context);
    if (aiResponse) {
      // Handle AI Actions
      if (aiResponse.action === "add_location" && aiResponse.data?.locationName) {
        return await handleAddLocationIntent(aiResponse.data.locationName, aiResponse.reply);
      }
      
      if (aiResponse.action === "replace_location" && aiResponse.data?.locationName) {
         // Re-use existing logic but triggered by AI
         return handleChangeLocationIntent(`đổi ${aiResponse.data.locationName}`);
      }

      return {
        reply: aiResponse.reply,
        quickReplies: aiResponse.quickReplies || [],
        suggestions: aiResponse.suggestions || [],
        itineraryPatch: aiResponse.itineraryPatch,
      };
    }
  } catch (err) {
    console.error("AI adapter error:", err);
  }

  // Fallback
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

function handleWeatherIntent(indoorLocations) {
  const suggestions = pickRandom(indoorLocations, 5);

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

async function handleFoodIntent(message) {
  let priceLevel = "moderate";

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

  // Fetch only restaurants with specific price level (or all if moderate/default)
  // Note: If priceLevel is moderate, we might want to show cheap too? Or just moderate.
  // Let's fetch strictly for now to be precise.
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
    quickReplies: ["Thêm quán đầu tiên", "Xem thêm gợi ý"],
  };
}

async function handleChangeLocationIntent(message) {
  const match = message.match(/(?:đổi|thay|change)\s+(.+)/i);

  if (!match) {
    return {
      reply:
        "Bạn muốn đổi địa điểm nào nhỉ? Nhắn rõ tên giúp mình nhé.\n\n" +
        'Ví dụ: "Đổi Bà Nà Hills" hoặc "Thay Bảo Tàng"',
      quickReplies: ["Xem lịch trình hiện tại"],
    };
  }

  const searchTerm = match[1].trim();
  const searchResults = await getAllLocations({ search: searchTerm });
  const targetLocation = searchResults[0]; // Take best match

  if (!targetLocation) {
    // Fallback suggestions
    const randomLocs = await getAllLocations(); // Fallback to random
    return {
      reply:
        `Mình tìm không thấy địa điểm "${searchTerm}". Hay là bạn thử mấy chỗ này xem:\n\n` +
        pickRandom(randomLocs, 5)
          .map((loc) => `• ${loc.name}`)
          .join("\n"),
      quickReplies: ["Xem danh sách địa điểm"],
    };
  }

  // Find alternatives of same type
  const sameType = await getAllLocations({ type: targetLocation.type });
  const alternativesList = sameType.filter(l => l.id !== targetLocation.id);

  // Simple tag matching if tags exist
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
}

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

  // Create patch to add location
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
