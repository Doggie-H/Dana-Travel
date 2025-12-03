/**
 * ITINERARY ITEM COMPONENT
 * 
 * Component hiển thị chi tiết một hoạt động (Activity) trong lịch trình.
 * Bao gồm: Thời gian, Tên địa điểm, Chi phí, Di chuyển, Ghi chú.
 * 
 * Thiết kế: Dạng Timeline (Dòng thời gian) với đường kẻ nối các hoạt động.
 */

import { formatTime, formatCurrency } from "../../utils/format.utils";

export default function ItineraryItem({ item, index, isLast, numPeople = 1 }) {
  return (
    // Container chính: Relative để định vị các thành phần tuyệt đối (Dot, Line)
    <div className="relative pl-8 md:pl-10 pb-10 last:pb-0 group">
      
      {/* --- 1. TIMELINE VISUALS (ĐƯỜNG KẺ & DẤU CHẤM) --- */}
      
      {/* Đường kẻ dọc nối các item (Ẩn ở item cuối cùng) */}
      {!isLast && (
        <div className="absolute left-[11px] md:left-[15px] top-8 bottom-0 w-[2px] bg-gray-100 group-hover:bg-gray-200 transition-colors"></div>
      )}

      {/* Dấu chấm tròn đánh số thứ tự */}
      <div className="absolute left-0 top-1.5 w-6 h-6 md:w-8 md:h-8 rounded-full bg-white border-2 border-accent-400 flex items-center justify-center z-10 shadow-sm group-hover:scale-110 transition-transform duration-300">
        <span className="text-[10px] md:text-xs font-bold text-accent-700">
          {index + 1}
        </span>
      </div>

      {/* --- 2. CONTENT GRID (BỐ CỤC NỘI DUNG) --- */}
      {/* Grid 12 cột: Thời gian (2) - Nội dung (7) - Tổng chi phí (3) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 items-start">
        
        {/* --- CỘT 1: THỜI GIAN --- */}
        <div className="md:col-span-2 pt-1">
          <div className="flex flex-row md:flex-col gap-2 md:gap-0 items-center md:items-start">
            <span className="text-sm font-bold text-gray-900">
              {formatTime(item.timeStart)}
            </span>
            {/* Hiển thị Responsive: Block trên Desktop, Inline trên Mobile */}
            <span className="text-xs text-gray-400 hidden md:block">
              đến {formatTime(item.timeEnd)}
            </span>
            <span className="text-xs text-gray-400 md:hidden">
              - {formatTime(item.timeEnd)}
            </span>
          </div>
        </div>

        {/* --- CỘT 2: CHI TIẾT HOẠT ĐỘNG --- */}
        <div className="md:col-span-7">
          <div className="flex gap-4 items-start">
            <div className="w-full">
              {/* Tên địa điểm */}
              <h4 className="text-base md:text-lg font-bold text-gray-900 mb-2 group-hover:text-accent-600 transition-colors">
                {item.title}
              </h4>
              
              {/* Địa chỉ */}
              <p className="text-sm text-gray-500 mb-3 flex items-start gap-1.5">
                <span>{item.address || "Đà Nẵng"}</span>
              </p>

              {/* Box thông tin chi tiết (Thời lượng, Chi phí vé, Ăn uống) */}
              <div className="flex flex-wrap gap-y-2 gap-x-4 text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100">
                
                {/* Thời lượng tham quan */}
                <div className="flex items-center gap-1.5">
                  <span className="font-medium">
                    {item.duration ? `${Math.floor(item.duration / 60)}h${item.duration % 60 > 0 ? ` ${item.duration % 60}p` : ''}` : '1h'}
                  </span>
                </div>

                {/* Chi phí Vé / Lưu trú */}
                {(item.cost?.ticket > 0 || (item.type === 'accommodation' && item.details)) && (
                  <div className="flex items-center gap-1.5">
                    {item.type === 'accommodation' ? (
                       // Logic hiển thị cho Khách sạn/Resort
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
                       // Logic hiển thị cho Vé tham quan
                       <span>Vé: <span className="font-bold">{formatCurrency(item.cost.ticket / numPeople)}/người</span></span>
                    )}
                  </div>
                )}

                {/* Chi phí Ăn uống */}
                {item.cost?.food > 0 && (
                  <div className="flex items-center gap-1.5">
                    <span>Ăn: <span className="font-bold">{formatCurrency(item.cost.food / numPeople)}/người</span></span>
                  </div>
                )}

                {/* Thông tin Di chuyển (Transport Info) */}
                {item.transport?.mode && (
                  <div className="w-full mt-3 pt-3 border-t border-gray-100 text-xs text-gray-600 bg-gray-50/50 p-2 rounded-md">
                    {/* Mode, Distance, Duration */}
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                       <span className="font-bold text-accent-700 bg-accent-50 px-1.5 py-0.5 rounded border border-accent-100">{item.transport.mode}</span>
                       <span className="text-gray-400">•</span>
                       <span className="font-medium">{Number(item.transport.distance).toFixed(1)} km</span>
                       <span className="text-gray-400">•</span>
                       <span>{item.transport.durationMin} phút</span>
                    </div>
                    
                    {/* Route & Cost */}
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

                    {/* Transport Recommendation (Gợi ý phương tiện) */}
                    {item.transport.recommendation && (
                      <div className="mt-2 pt-2 border-t border-gray-100 text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                        <span>Gợi ý:</span>
                        <span>{item.transport.recommendation}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* --- CỘT 3: TỔNG CHI PHÍ ITEM --- */}
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
