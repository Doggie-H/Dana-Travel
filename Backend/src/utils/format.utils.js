// file: backend/utils/formatUtils.js

/**
 * Utilities cho format tiền, ngày giờ
 *
 * Vai trò: tập trung logic format để tái sử dụng, dễ maintain
 * Input: raw values (number, Date, string)
 * Output: formatted strings hoặc processed values
 */

/**
 * Format số tiền VND
 * @param {number} amount - số tiền
 * @returns {string} - vd: "1.500.000 ₫"
 */
export function formatCurrency(amount) {
  if (typeof amount !== "number" || isNaN(amount)) {
    return "0 ₫";
  }
  return amount.toLocaleString("vi-VN") + " ₫";
}

/**
 * Format ngày theo dd/MM/yyyy
 * @param {Date|string} date - Date object hoặc ISO string
 * @returns {string} - vd: "15/11/2025"
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
 * @param {Date|string} time - Date object hoặc ISO string
 * @returns {string} - vd: "08:30"
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
 * Tính số ngày giữa 2 datetime
 * @param {Date|string} start
 * @param {Date|string} end
 * @returns {number} - số ngày (làm tròn lên)
 */
export function getDaysBetween(start, end) {
  const startDate = start instanceof Date ? start : new Date(start);
  const endDate = end instanceof Date ? end : new Date(end);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    return 0;
  }

  const diffMs = endDate - startDate;
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return Math.max(diffDays, 1); // tối thiểu 1 ngày
}

/**
 * Random số trong khoảng [min, max]
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function randomInRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Làm tròn số tiền đến bội số của step
 * @param {number} amount
 * @param {number} step - vd: 10000 (làm tròn đến chục nghìn)
 * @returns {number}
 */
export function roundToStep(amount, step = 10000) {
  return Math.round(amount / step) * step;
}

export default {
  formatCurrency,
  formatDate,
  formatTime,
  getDaysBetween,
  randomInRange,
  roundToStep,
};
