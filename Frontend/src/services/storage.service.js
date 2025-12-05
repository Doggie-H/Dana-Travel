/**
 * =================================================================================================
 * FILE: storage.service.js
 * MỤC ĐÍCH: Lưu trữ dữ liệu tạm thời trên trình duyệt.
 * NGƯỜI TẠO: Team DanaTravel (AI Support)
 * 
 * MÔ TẢ CHI TIẾT (BEGINNER GUIDE):
 * Đây là "Chiếc nén bạc" của người dùng.
 * 1. Giữ đồ: Khi bạn tạo lịch trình xong, nó sẽ lưu vào Session Storage (bộ nhớ tạm).
 * 2. Tiện lợi: Để khi bạn F5 (tải lại trang) hoặc chuyển qua lại giữa các trang, dữ liệu không bị mất.
 * 3. An toàn: Tắt trình duyệt là mất (Session), không sợ lộ thông tin nếu dùng máy công cộng.
 * =================================================================================================
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
