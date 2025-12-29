/**
 * =================================================================================================
 * FORMAT UTILS - TIỆN ÍCH ĐỊNH DẠNG
 * =================================================================================================
 * 
 * Bộ công cụ pure function giúp chuẩn hóa hiển thị dữ liệu (Tiền, Ngày, Giờ).
 * Không chứa business logic, chỉ format.
 */

// 1. FORMAT TIỀN TỆ (VND)
export function formatCurrency(amount) {
  if (typeof amount !== "number" || isNaN(amount)) return "0 ₫";
  return amount.toLocaleString("vi-VN") + " ₫";
}

// 2. FORMAT NGÀY THÁNG (DD/MM/YYYY)
export function formatDate(date) {
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return "Ngày không hợp lệ";

  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

// 3. FORMAT GIỜ PHÚT (HH:MM)
export function formatTime(time) {
  const t = time instanceof Date ? time : new Date(time);
  if (isNaN(t.getTime())) return "--:--";

  const hours = String(t.getHours()).padStart(2, "0");
  const minutes = String(t.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

// 4. FORMAT DECIMAL TIME (8.5 -> 08:30)
export function formatDecimalTime(decimalTime) {
  const hours = Math.floor(decimalTime) % 24;
  const minutes = Math.round((decimalTime - Math.floor(decimalTime)) * 60);
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
}

// 5. HELPER: TÍNH KHOẢNG CÁCH NGÀY
export function getDaysBetween(start, end) {
  const startDate = start instanceof Date ? start : new Date(start);
  const endDate = end instanceof Date ? end : new Date(end);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return 0;

  // Reset về 00:00:00 để tính chênh lệch theo ngày lịch
  const startMidnight = new Date(startDate);
  startMidnight.setHours(0, 0, 0, 0);

  const endMidnight = new Date(endDate);
  endMidnight.setHours(0, 0, 0, 0);

  const diffMs = endMidnight - startMidnight;
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  return Math.abs(diffDays);
}

// 6. HELPER: LÀM TRÒN SỐ
export function roundToStep(amount, step = 10000) {
  return Math.round(amount / step) * step;
}

export default {
  formatCurrency,
  formatDate,
  formatTime,
  formatDecimalTime,
  getDaysBetween,
  roundToStep,
};
