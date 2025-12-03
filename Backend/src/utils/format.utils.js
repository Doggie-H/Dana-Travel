/**
 * FORMAT UTILITIES
 * 
 * Bộ công cụ tiện ích dùng để định dạng dữ liệu (Tiền tệ, Ngày giờ, Số liệu).
 * Giúp đảm bảo tính nhất quán trong việc hiển thị dữ liệu trên toàn hệ thống.
 */

/**
 * Định dạng số tiền sang kiểu Việt Nam Đồng (VND).
 * Ví dụ: 1500000 -> "1.500.000 ₫"
 * 
 * @param {number} amount - Số tiền cần format.
 * @returns {string} - Chuỗi đã định dạng.
 */
export function formatCurrency(amount) {
  if (typeof amount !== "number" || isNaN(amount)) {
    return "0 ₫";
  }
  return amount.toLocaleString("vi-VN") + " ₫";
}

/**
 * Định dạng ngày tháng theo chuẩn Việt Nam (dd/MM/yyyy).
 * Ví dụ: 2025-11-15 -> "15/11/2025"
 * 
 * @param {Date|string} date - Đối tượng Date hoặc chuỗi ISO.
 * @returns {string} - Chuỗi ngày đã định dạng.
 */
export function formatDate(date) {
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) {
    return "Ngày không hợp lệ";
  }
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Định dạng giờ phút (HH:mm).
 * Ví dụ: 08:30
 * 
 * @param {Date|string} time - Đối tượng Date hoặc chuỗi ISO.
 * @returns {string} - Chuỗi giờ đã định dạng.
 */
export function formatTime(time) {
  const t = time instanceof Date ? time : new Date(time);
  if (isNaN(t.getTime())) {
    return "--:--";
  }
  const hours = String(t.getHours()).padStart(2, "0");
  const minutes = String(t.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

/**
 * Tính khoảng cách số ngày giữa 2 mốc thời gian.
 * Kết quả luôn được làm tròn lên và tối thiểu là 1 ngày.
 * 
 * @param {Date|string} start - Ngày bắt đầu.
 * @param {Date|string} end - Ngày kết thúc.
 * @returns {number} - Số ngày.
 */
export function getDaysBetween(start, end) {
  const startDate = start instanceof Date ? start : new Date(start);
  const endDate = end instanceof Date ? end : new Date(end);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    return 0;
  }

  const diffMs = endDate - startDate;
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return Math.max(diffDays, 1); // Tối thiểu 1 ngày
}

/**
 * Tạo số ngẫu nhiên trong khoảng [min, max].
 * Dùng để tạo dữ liệu giả lập hoặc variance cho ngân sách.
 * 
 * @param {number} min - Giá trị nhỏ nhất.
 * @param {number} max - Giá trị lớn nhất.
 * @returns {number} - Số ngẫu nhiên.
 */
export function randomInRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Làm tròn số tiền đến bội số gần nhất (VD: làm tròn đến hàng chục nghìn).
 * Giúp số liệu đẹp hơn và dễ đọc hơn.
 * 
 * @param {number} amount - Số tiền gốc.
 * @param {number} step - Bước làm tròn (mặc định 10.000).
 * @returns {number} - Số tiền đã làm tròn.
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
