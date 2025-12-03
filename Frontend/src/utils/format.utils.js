/**
 * FORMAT UTILITIES (FRONTEND)
 * 
 * Bộ công cụ định dạng dữ liệu hiển thị cho phía Client.
 * Đảm bảo tính nhất quán trong việc hiển thị tiền tệ, ngày tháng và thời gian.
 */

/**
 * Định dạng số tiền sang chuẩn Việt Nam Đồng (VND).
 * Ví dụ: 1500000 -> "1.500.000 ₫"
 * 
 * @param {number} amount - Số tiền cần định dạng.
 * @returns {string} - Chuỗi tiền tệ đã định dạng.
 */
export function formatCurrency(amount) {
  if (typeof amount !== "number" || isNaN(amount)) {
    return "0 ₫";
  }
  return amount.toLocaleString("vi-VN") + " ₫";
}

/**
 * Định dạng ngày tháng sang chuẩn Việt Nam (dd/MM/yyyy).
 * Ví dụ: 2023-11-20 -> "20/11/2023"
 * 
 * @param {Date|string} date - Đối tượng Date hoặc chuỗi ngày tháng.
 * @returns {string} - Chuỗi ngày tháng đã định dạng.
 */
export function formatDate(date) {
  const d = date instanceof Date ? date : new Date(date);
  // Kiểm tra tính hợp lệ của ngày
  if (isNaN(d.getTime())) {
    return "Invalid date";
  }

  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0"); // Tháng bắt đầu từ 0
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Định dạng thời gian sang chuẩn 24h (HH:mm).
 * Ví dụ: 14:05
 * 
 * @param {Date|string} time - Đối tượng Date hoặc chuỗi thời gian.
 * @returns {string} - Chuỗi thời gian đã định dạng.
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
 * Định dạng ngày giờ chuẩn ISO cho input type="datetime-local".
 * Định dạng yêu cầu: YYYY-MM-DDTHH:mm
 * Ví dụ: "2025-11-15T08:00"
 * 
 * @param {Date|string} datetime - Đối tượng Date hoặc chuỗi thời gian.
 * @returns {string} - Chuỗi dùng cho thuộc tính value của input.
 */
export function formatDateTimeLocal(datetime) {
  const d = datetime instanceof Date ? datetime : new Date(datetime);
  if (isNaN(d.getTime())) {
    return "";
  }

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/**
 * Lấy chuỗi ngày giờ hiện tại đã định dạng cho input.
 * Thường dùng để set giá trị mặc định (Default Value).
 * 
 * @returns {string} - Chuỗi ngày giờ hiện tại.
 */
export function getTodayDateTime() {
  return formatDateTimeLocal(new Date());
}

/**
 * Lấy chuỗi ngày giờ của ngày mai đã định dạng cho input.
 * Thường dùng cho ngày về (Return Date) mặc định.
 * 
 * @returns {string} - Chuỗi ngày giờ ngày mai.
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
