/**
 * STORAGE SERVICE
 * 
 * Module quản lý lưu trữ dữ liệu tạm thời trên trình duyệt (Session Storage).
 * Giúp duy trì trạng thái ứng dụng khi người dùng reload trang hoặc chuyển đổi giữa các trang.
 * 
 * Dữ liệu lưu trữ bao gồm:
 * 1. Lịch trình đã tạo (Itinerary).
 * 2. Yêu cầu ban đầu của người dùng (User Request).
 * 3. Lịch sử chat (Chat History).
 */

const KEYS = {
  ITINERARY: "danang_itinerary",
  USER_REQUEST: "danang_user_request",
  CHAT_HISTORY: "danang_chat_history",
};

/**
 * Lưu lịch trình vào Session Storage.
 * @param {Object} itinerary - Đối tượng lịch trình.
 */
export function saveItinerary(itinerary) {
  try {
    sessionStorage.setItem(KEYS.ITINERARY, JSON.stringify(itinerary));
  } catch (error) {
    console.error("Lỗi khi lưu lịch trình:", error);
  }
}

/**
 * Tải lịch trình từ Session Storage.
 * @returns {Object|null} - Đối tượng lịch trình hoặc null nếu không có.
 */
export function loadItinerary() {
  try {
    const data = sessionStorage.getItem(KEYS.ITINERARY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("Lỗi khi tải lịch trình:", error);
    return null;
  }
}

/**
 * Lưu yêu cầu người dùng (User Request).
 * @param {Object} userRequest - Dữ liệu form nhập liệu.
 */
export function saveUserRequest(userRequest) {
  try {
    sessionStorage.setItem(KEYS.USER_REQUEST, JSON.stringify(userRequest));
  } catch (error) {
    console.error("Lỗi khi lưu User Request:", error);
  }
}

/**
 * Tải yêu cầu người dùng.
 * @returns {Object|null}
 */
export function loadUserRequest() {
  try {
    const data = sessionStorage.getItem(KEYS.USER_REQUEST);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("Lỗi khi tải User Request:", error);
    return null;
  }
}

/**
 * Lưu lịch sử chat.
 * @param {Array} messages - Danh sách tin nhắn.
 */
export function saveChatHistory(messages) {
  try {
    sessionStorage.setItem(KEYS.CHAT_HISTORY, JSON.stringify(messages));
  } catch (error) {
    console.error("Lỗi khi lưu lịch sử chat:", error);
  }
}

/**
 * Tải lịch sử chat.
 * @returns {Array} - Danh sách tin nhắn hoặc mảng rỗng.
 */
export function loadChatHistory() {
  try {
    const data = sessionStorage.getItem(KEYS.CHAT_HISTORY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Lỗi khi tải lịch sử chat:", error);
    return [];
  }
}

/**
 * Xóa toàn bộ dữ liệu đã lưu (Reset Session).
 */
export function clearAll() {
  try {
    Object.values(KEYS).forEach((key) => {
      sessionStorage.removeItem(key);
    });
  } catch (error) {
    console.error("Lỗi khi xóa dữ liệu:", error);
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
