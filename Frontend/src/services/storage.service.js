// file: frontend/src/services/storageService.js

/**
 * Storage Service - persist data in sessionStorage
 *
 * Vai trò: save/load itinerary & userRequest giữa pages
 * Sử dụng sessionStorage (tồn tại trong session, mất khi đóng tab)
 */

const KEYS = {
  ITINERARY: "danang_itinerary",
  USER_REQUEST: "danang_user_request",
  CHAT_HISTORY: "danang_chat_history",
};

/**
 * Save itinerary
 * @param {Object} itinerary
 */
export function saveItinerary(itinerary) {
  try {
    sessionStorage.setItem(KEYS.ITINERARY, JSON.stringify(itinerary));
  } catch (error) {
    console.error("Failed to save itinerary:", error);
  }
}

/**
 * Load itinerary
 * @returns {Object|null}
 */
export function loadItinerary() {
  try {
    const data = sessionStorage.getItem(KEYS.ITINERARY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("Failed to load itinerary:", error);
    return null;
  }
}

/**
 * Save user request
 * @param {Object} userRequest
 */
export function saveUserRequest(userRequest) {
  try {
    sessionStorage.setItem(KEYS.USER_REQUEST, JSON.stringify(userRequest));
  } catch (error) {
    console.error("Failed to save user request:", error);
  }
}

/**
 * Load user request
 * @returns {Object|null}
 */
export function loadUserRequest() {
  try {
    const data = sessionStorage.getItem(KEYS.USER_REQUEST);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("Failed to load user request:", error);
    return null;
  }
}

/**
 * Save chat history
 * @param {Array} messages
 */
export function saveChatHistory(messages) {
  try {
    sessionStorage.setItem(KEYS.CHAT_HISTORY, JSON.stringify(messages));
  } catch (error) {
    console.error("Failed to save chat history:", error);
  }
}

/**
 * Load chat history
 * @returns {Array}
 */
export function loadChatHistory() {
  try {
    const data = sessionStorage.getItem(KEYS.CHAT_HISTORY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to load chat history:", error);
    return [];
  }
}

/**
 * Clear all stored data
 */
export function clearAll() {
  try {
    Object.values(KEYS).forEach((key) => {
      sessionStorage.removeItem(key);
    });
  } catch (error) {
    console.error("Failed to clear storage:", error);
  }
}

export default {
  saveItinerary,
  loadItinerary,
  saveUserRequest,
  loadUserRequest,
  saveChatHistory,
  loadChatHistory,
  clearAll,
};
