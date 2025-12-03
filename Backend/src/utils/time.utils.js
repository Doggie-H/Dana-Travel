/**
 * TIME UTILITIES
 * 
 * Bộ công cụ xử lý thời gian chuyên dụng cho việc lập lịch trình.
 * Hỗ trợ các thao tác phức tạp như tính toán khung giờ, cộng trừ thời gian, tạo dải ngày.
 */

/**
 * Tạo đối tượng Date từ một ngày gốc và chuỗi giờ (HH:mm).
 * Ví dụ: 2025-11-15 + "08:30" -> Date(2025-11-15T08:30:00)
 * 
 * @param {Date|string} date - Ngày gốc.
 * @param {string} timeStr - Chuỗi giờ phút (VD: "08:00").
 * @returns {Date} - Đối tượng Date hoàn chỉnh.
 */
export function parseTimeOnDate(date, timeStr) {
  const baseDate = date instanceof Date ? date : new Date(date);
  const [hours, minutes] = timeStr.split(":").map(Number);

  const result = new Date(baseDate);
  result.setHours(hours, minutes, 0, 0);
  return result;
}

/**
 * Cộng thêm số phút vào một mốc thời gian.
 * Tự động xử lý việc chuyển sang giờ tiếp theo hoặc ngày tiếp theo.
 * 
 * @param {Date} time - Mốc thời gian ban đầu.
 * @param {number} durationMin - Số phút cần cộng thêm.
 * @returns {Date} - Mốc thời gian mới.
 */
export function addMinutes(time, durationMin) {
  const result = new Date(time);
  result.setMinutes(result.getMinutes() + durationMin);
  return result;
}

/**
 * Chuyển đổi Date thành chuỗi giờ phút "HH:mm".
 * Dùng để hiển thị trên giao diện hoặc so sánh.
 * 
 * @param {Date} date - Đối tượng Date.
 * @returns {string} - Chuỗi "HH:mm" (VD: "14:05").
 */
export function toTimeString(date) {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

/**
 * Tạo danh sách các ngày liên tiếp trong một khoảng thời gian.
 * Hữu ích để tạo khung lịch trình cho chuyến đi nhiều ngày.
 * 
 * @param {Date|string} startDate - Ngày bắt đầu.
 * @param {Date|string} endDate - Ngày kết thúc.
 * @returns {Date[]} - Mảng chứa các đối tượng Date.
 */
export function generateDateRange(startDate, endDate) {
  const start = startDate instanceof Date ? startDate : new Date(startDate);
  const end = endDate instanceof Date ? endDate : new Date(endDate);

  const dates = [];
  const current = new Date(start);
  // Reset về đầu ngày để tránh lỗi so sánh giờ
  current.setHours(0, 0, 0, 0);

  const endDay = new Date(end);
  endDay.setHours(0, 0, 0, 0);

  while (current <= endDay) {
    dates.push(new Date(current));
    // Tăng thêm 1 ngày
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

/**
 * Kiểm tra xem một mốc giờ có nằm trong khung giờ quy định hay không.
 * 
 * @param {string} timeStr - Giờ cần kiểm tra (VD: "14:30").
 * @param {Object} slot - Khung giờ {start: "14:00", end: "18:00"}.
 * @returns {boolean} - True nếu nằm trong khung giờ.
 */
export function isInTimeSlot(timeStr, slot) {
  const [h, m] = timeStr.split(":").map(Number);
  const [sh, sm] = slot.start.split(":").map(Number);
  const [eh, em] = slot.end.split(":").map(Number);

  // Chuyển đổi tất cả ra phút để so sánh dễ dàng
  const minutes = h * 60 + m;
  const startMin = sh * 60 + sm;
  const endMin = eh * 60 + em;

  return minutes >= startMin && minutes < endMin;
}

export default {
  parseTimeOnDate,
  addMinutes,
  toTimeString,
  generateDateRange,
  isInTimeSlot,
};
