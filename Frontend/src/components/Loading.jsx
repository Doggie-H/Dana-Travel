/**
 * LOADING COMPONENT
 * 
 * Component hiển thị trạng thái đang tải (Loading Spinner).
 * Dùng khi đang fetch dữ liệu hoặc xử lý tác vụ nặng.
 * 
 * Props:
 * - message (string): Thông báo hiển thị kèm theo (Mặc định: "Đang tải...").
 */

export default function Loading({ message = "Đang tải..." }) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      {/* Spinner Animation: Vòng tròn xoay */}
      <div className="w-12 h-12 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mb-4"></div>
      
      {/* Loading Message */}
      <p className="text-gray-500 text-sm font-light tracking-wide">{message}</p>
    </div>
  );
}
