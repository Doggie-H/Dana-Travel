// file: backend/utils/timeUtils.js

/**
 * Utilities xử lý thời gian cho lịch trình
 *
 * Vai trò: parse time string, tính toán khung giờ, add duration
 * Input: time strings (HH:mm), duration (minutes)
 * Output: Date objects hoặc formatted strings
 */

/**
 * Parse time string "HH:mm" thành Date object cho ngày cụ thể
 * @param {Date|string} date - ngày cần gắn time
 * @param {string} timeStr - "08:00"
 * @returns {Date}
 */
export function parseTimeOnDate(date, timeStr) {
  const baseDate = date instanceof Date ? date : new Date(date);
  const [hours, minutes] = timeStr.split(":").map(Number);

  const result = new Date(baseDate);
  result.setHours(hours, minutes, 0, 0);
  return result;
}

/**
 * Add duration (minutes) vào time
 * @param {Date} time - thời gian ban đầu
 * @param {number} durationMin - số phút cần thêm
 * @returns {Date}
 */
export function addMinutes(time, durationMin) {
  const result = new Date(time);
  result.setMinutes(result.getMinutes() + durationMin);
  return result;
}

/**
 * Format Date thành "HH:mm"
 * @param {Date} date
 * @returns {string}
 */
export function toTimeString(date) {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

/**
 * Tạo array các ngày từ startDate đến endDate
 * @param {Date|string} startDate
 * @param {Date|string} endDate
 * @returns {Date[]} - array các Date objects
 */
export function generateDateRange(startDate, endDate) {
  const start = startDate instanceof Date ? startDate : new Date(startDate);
  const end = endDate instanceof Date ? endDate : new Date(endDate);

  const dates = [];
  const current = new Date(start);
  current.setHours(0, 0, 0, 0);

  const endDay = new Date(end);
  endDay.setHours(0, 0, 0, 0);

  while (current <= endDay) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

/**
 * Check xem time có trong time slot không
 * @param {string} timeStr - "14:30"
 * @param {Object} slot - {start: "14:00", end: "18:00"}
 * @returns {boolean}
 */
export function isInTimeSlot(timeStr, slot) {
  const [h, m] = timeStr.split(":").map(Number);
  const [sh, sm] = slot.start.split(":").map(Number);
  const [eh, em] = slot.end.split(":").map(Number);

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
