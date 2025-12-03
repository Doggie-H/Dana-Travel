// file: frontend/src/features/itinerary/ItineraryItem.jsx

/**
 * ItineraryItem Component
 * 
 * Vai trò: Hiển thị chi tiết một hoạt động trong lịch trình.
 * Mục tiêu: Tách nhỏ code để dễ đọc và dễ quản lý hơn.
 */

import { formatTime, formatCurrency } from "../../utils/format.utils";

export default function ItineraryItem({ item, index, isLast, numPeople = 1 }) {
  return (
    // Container chính của một item, dùng relative để định vị đường kẻ dọc (timeline line)
    <div className="relative pl-8 md:pl-10 pb-10 last:pb-0 group">
      
      {/* --- 1. Đường kẻ dọc (Timeline Line) --- */}
      {/* Chỉ hiển thị nếu không phải là item cuối cùng */}
      {!isLast && (
        <div className="absolute left-[11px] md:left-[15px] top-8 bottom-0 w-[2px] bg-gray-100 group-hover:bg-gray-200 transition-colors"></div>
      )}

      {/* --- 2. Dấu chấm tròn (Timeline Dot) --- */}
      {/* Dùng absolute để neo vào bên trái */}
      <div className="absolute left-0 top-1.5 w-6 h-6 md:w-8 md:h-8 rounded-full bg-white border-2 border-accent-400 flex items-center justify-center z-10 shadow-sm group-hover:scale-110 transition-transform duration-300">
        <span className="text-[10px] md:text-xs font-bold text-accent-700">
          {index + 1}
        </span>
      </div>

      {/* --- 3. Nội dung chính (Grid Layout) --- */}
      {/* Chia làm 12 cột: Thời gian (2) - Nội dung (7) - Chi phí (3) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 items-start">
        
        {/* Cột 1: Thời gian */}
        <div className="md:col-span-2 pt-1">
          <div className="flex flex-row md:flex-col gap-2 md:gap-0 items-center md:items-start">
            <span className="text-sm font-bold text-gray-900">
              {formatTime(item.timeStart)}
            </span>
            {/* Hiển thị khác nhau trên Mobile và Desktop */}
            <span className="text-xs text-gray-400 hidden md:block">
              đến {formatTime(item.timeEnd)}
            </span>
            <span className="text-xs text-gray-400 md:hidden">
              - {formatTime(item.timeEnd)}
            </span>
          </div>
        </div>

        {/* Cột 2: Thông tin chi tiết (Hình ảnh + Tên + Note) */}
        <div className="md:col-span-7">
          <div className="flex gap-4 items-start">
            
            {/* Thông tin text */}
            <div className="w-full">
              <h4 className="text-base md:text-lg font-bold text-gray-900 mb-2 group-hover:text-accent-600 transition-colors">
                {item.title}
              </h4>
              
              {/* Địa chỉ */}
              <p className="text-sm text-gray-500 mb-3 flex items-start gap-1.5">
                <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                <span>{item.address || "Đà Nẵng"}</span>
              </p>

              {/* Thông tin chi tiết: Thời gian & Chi phí */}
              <div className="flex flex-wrap gap-y-2 gap-x-4 text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100">
                {/* Thời gian tham quan */}
                <div className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  <span className="font-medium">
                    {item.duration ? `${Math.floor(item.duration / 60)}h${item.duration % 60 > 0 ? ` ${item.duration % 60}p` : ''}` : '1h'}
                  </span>
                </div>

                {/* Chi phí vé */}
                {/* Chi phí vé */}
                {/* Chi phí vé */}
                {(item.cost?.ticket > 0 || (item.type === 'accommodation' && item.details)) && (
                  <div className="flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"></path></svg>
                    {item.type === 'accommodation' ? (
                       item.details ? (
                           <span>
                             Phòng ({item.details.numPeople} người) / {item.details.numNights} đêm: 
                             <span className="font-bold ml-1">
                               {item.cost.ticket > 0 ? formatCurrency(item.cost.ticket) : "Đã bao gồm"}
                             </span>
                           </span>
                       ) : (
                           <span>Chi phí phòng: <span className="font-bold">{formatCurrency(item.cost.ticket)}</span></span>
                       )
                    ) : (
                       <span>Vé: <span className="font-bold">{formatCurrency(item.cost.ticket / numPeople)}/người</span></span>
                    )}
                  </div>
                )}

                {/* Chi phí ăn uống */}
                {item.cost?.food > 0 && (
                  <div className="flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                    <span>Ăn: <span className="font-bold">{formatCurrency(item.cost.food / numPeople)}/người</span></span>
                  </div>
                )}

                {/* Chi tiết di chuyển */}
                {item.transport?.mode && (
                  <div className="w-full mt-3 pt-3 border-t border-gray-100 text-xs text-gray-600 bg-gray-50/50 p-2 rounded-md">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                       <span className="font-bold text-accent-700 bg-accent-50 px-1.5 py-0.5 rounded border border-accent-100">{item.transport.mode}</span>
                       <span className="text-gray-400">•</span>
                       <span className="font-medium">{Number(item.transport.distance).toFixed(1)} km</span>
                       <span className="text-gray-400">•</span>
                       <span>{item.transport.durationMin} phút</span>
                    </div>
                    <div className="flex justify-between items-start gap-2">
                       <div className="flex flex-col">
                         <span className="text-gray-500 text-[10px] uppercase tracking-wider">Di chuyển từ</span>
                         <span className="font-medium text-gray-800 line-clamp-1">{item.transport.from}</span>
                       </div>
                       <div className="flex flex-col items-end min-w-[80px]">
                         <span className="text-gray-500 text-[10px] uppercase tracking-wider">Chi phí</span>
                         <span className="font-bold text-gray-900">{formatCurrency(item.transport.cost)}</span>
                       </div>
                    </div>
                    {item.transport.recommendation && (
                      <div className="mt-2 pt-2 border-t border-gray-100 text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                        <span>💡</span>
                        <span>{item.transport.recommendation}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Cột 3: Chi phí */}
        <div className="md:col-span-3 md:text-right pt-1">
          <div className="text-base font-bold text-accent-600">
            {formatCurrency(
              (item.cost?.ticket || 0) +
                (item.cost?.food || 0) +
                (item.cost?.other || 0) +
                (item.transport?.cost || 0)
            )}
          </div>
          <div className="text-xs text-gray-400 mt-1 capitalize">
            {item.type}
          </div>
        </div>
      </div>
    </div>
  );
}
