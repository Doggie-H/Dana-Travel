/**
 * =================================================================================================
 * FILE: format.utils.js
 * MỤC ĐÍCH: Bộ công cụ định dạng dữ liệu hiển thị (Tiền, Ngày, Giờ).
 * NGƯỜI TẠO: Team DanaTravel (AI Support)
 * 
 * MÔ TẢ CHI TIẾT (BEGINNER GUIDE):
 * File này chứa các hàm "Makeup" cho dữ liệu.
 * Dữ liệu thô (ví dụ: 100000) nhìn rất xấu và khó đọc.
 * Hàm ở đây sẽ biến nó thành đẹp đẽ (ví dụ: "100.000 vnđ") trước khi đưa lên màn hình.
 * =================================================================================================
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
  // Nếu đã là chuỗi HH:mm (VD: "08:00", "14:30"), trả về nguyên vẹn
  if (typeof time === "string" && /^\d{1,2}:\d{2}$/.test(time)) {
    return time;
  }

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

export default {
  formatCurrency,
  formatDate,
  formatTime,
  formatDateTimeLocal,
};
