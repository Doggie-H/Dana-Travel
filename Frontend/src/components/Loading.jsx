/**
 * =================================================================================================
 * FILE: Loading.jsx
 * MỤC ĐÍCH: Hiển thị trạng thái đang tải (Loading Spinner).
 * NGƯỜI TẠO: Team DanaTravel (AI Support)
 * 
 * MÔ TẢ CHI TIẾT (BEGINNER GUIDE):
 * Đây là "Màn hình chờ" khi hệ thống đang bận suy nghĩ.
 * 1. Spinner: Cái vòng tròn xoay xoay để báo hiệu "Tôi đang làm việc đây, đừng tắt máy".
 * 2. Thông báo: Dòng chữ nhỏ (VD: Đang tải...) để người dùng đỡ sốt ruột.
 * =================================================================================================
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
