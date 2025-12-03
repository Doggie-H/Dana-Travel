// file: frontend/src/utils/formatUtils.js

/**
 * Format Utilities - frontend version
 *
 * Vai trò: format tiền, ngày giờ cho display
 */

/**
 * Format số tiền VND
 * @param {number} amount
 * @returns {string} - "1.500.000 ₫"
 */
export function formatCurrency(amount) {
  if (typeof amount !== "number" || isNaN(amount)) {
    return "0 ₫";
  }
  return amount.toLocaleString("vi-VN") + " ₫";
}

/**
 * Format ngày dd/MM/yyyy
 * @param {Date|string} date
 * @returns {string}
 */
export function formatDate(date) {
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) {
    return "Invalid date";
  }

  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Format thời gian HH:mm
 * @param {Date|string} time
 * @returns {string}
 */
export function formatTime(time) {
  const t = time instanceof Date ? time : new Date(time);
  if (isNaN(t.getTime())) {
    return "Invalid time";
  }

  const hours = String(t.getHours()).padStart(2, "0");
  const minutes = String(t.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

/**
 * Format datetime cho input datetime-local
 * @param {Date|string} datetime
 * @returns {string} - "2025-11-15T08:00"
 */
export function formatDateTimeLocal(datetime) {
  const d = datetime instanceof Date ? datetime : new Date(datetime);
  if (isNaN(d.getTime())) {
    return "";
  }

  // Format: YYYY-MM-DDTHH:mm
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/**
 * Get today datetime string cho default input value
 * @returns {string}
 */
export function getTodayDateTime() {
  return formatDateTimeLocal(new Date());
}

/**
 * Get tomorrow datetime string
 * @returns {string}
 */
export function getTomorrowDateTime() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return formatDateTimeLocal(tomorrow);
}

export default {
  formatCurrency,
  formatDate,
  formatTime,
  formatDateTimeLocal,
  getTodayDateTime,
  getTomorrowDateTime,
};
