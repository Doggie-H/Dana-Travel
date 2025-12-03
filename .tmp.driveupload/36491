// file: frontend/src/features/itinerary/ItineraryCard.jsx

/**
 * ItineraryCard Component
 * 
 * Vai trò: Hiển thị danh sách các hoạt động trong MỘT ngày.
 * Cấu trúc: Header (Ngày/Tháng) + Body (Danh sách ItineraryItem)
 */

import { formatCurrency, formatDate } from "../../utils/format.utils";
import ItineraryItem from "./ItineraryItem";

export default function ItineraryCard({ day, numPeople = 1 }) {
  // Nếu không có dữ liệu ngày, không hiển thị gì cả
  if (!day) return null;

  return (
    // Container chính: Card màu trắng, bo góc, có đổ bóng nhẹ
    <div className="bg-white rounded-2xl shadow-soft border border-gray-100 mb-8 overflow-hidden transition-all duration-300 hover:shadow-medium">
      
      {/* --- Header của Card: Hiển thị số ngày và ngày tháng --- */}
      <div className="flex justify-between items-center px-6 py-4 bg-gray-50/50 border-b border-gray-100">
        <div className="flex items-center gap-3">
          {/* Số ngày (ví dụ: 1, 2, 3) */}
          <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center text-white font-bold shadow-sm">
            {day.dayNumber}
          </div>
          <h5 className="text-lg font-bold text-gray-900">
            Ngày {day.dayNumber}
          </h5>
        </div>
        {/* Ngày tháng (ví dụ: 20/11/2023) */}
        <span className="px-4 py-1.5 rounded-full bg-white border border-gray-200 text-sm font-medium text-gray-600 shadow-sm">
          {formatDate(day.date)}
        </span>
      </div>

      {/* --- Body của Card: Danh sách các hoạt động --- */}
      <div className="p-6 md:p-8">
        {day.items && day.items.length > 0 ? (
          <div className="space-y-0">
            {/* Lặp qua từng hoạt động và hiển thị ItineraryItem */}
            {day.items.map((item, idx) => (
              <ItineraryItem 
                key={idx} 
                item={item} 
                index={idx} 
                isLast={idx === day.items.length - 1}
                numPeople={numPeople}
              />
            ))}
          </div>
        ) : (
          // Trạng thái trống (Empty State)
          <div className="py-12 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            </div>
            <p className="text-gray-500 font-medium">Không có hoạt động trong ngày này.</p>
          </div>
        )}
      </div>
    </div>
  );
}
