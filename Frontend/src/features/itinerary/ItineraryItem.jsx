/**
 * Component hiển thị chi tiết một hoạt động trong lịch trình.
 * Bao gồm thông tin thời gian, địa điểm, chi phí và các visual elements (timeline).
 */

import { formatTime, formatCurrency } from "../../utils/format.utils";

export default function ItineraryItem({ item, index, isLast, numPeople = 1, nextItem }) {
  if (!item) return null;

  return (
    // Container chính: Relative để định vị các thành phần tuyệt đối (Dot, Line)
    <div className="relative pl-8 md:pl-12 pb-12 last:pb-0 group">
      
      {/* --- 1. TIMELINE VISUALS (ĐƯỜNG KẺ & DẤU CHẤM) --- */}
      
      {/* Đường kẻ dọc nối các item (Ẩn ở item cuối cùng) */}
      {!isLast && (
        <div className="absolute left-[11px] md:left-[15px] top-8 bottom-0 w-[1px] bg-gray-200 group-hover:bg-accent-400 transition-colors duration-500"></div>
      )}

      {/* Dấu chấm tròn đánh số thứ tự */}
      <div className="absolute left-0 top-1.5 w-6 h-6 md:w-8 md:h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center z-10 shadow-sm group-hover:border-accent-500 group-hover:shadow-md transition-all duration-300">
        <span className="text-[10px] md:text-xs font-serif font-bold text-gray-500 group-hover:text-accent-700">
          {index + 1}
        </span>
      </div>

      {/* --- 2. CONTENT GRID (BỐ CỤC NỘI DUNG) --- */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8 items-start">
        
        {/* --- CỘT 1: THỜI GIAN --- */}
        <div className="md:col-span-2 pt-1.5">
          <div className="flex flex-row md:flex-col gap-2 md:gap-1 items-baseline md:items-start">
            <span className="text-base font-display font-medium text-gray-900">
              {formatTime(item.timeStart)}
            </span>
            <span className="text-xs text-gray-400 font-light tracking-wide">
              {formatTime(item.timeEnd)}
            </span>
          </div>
        </div>

        {/* --- CỘT 2: CHI TIẾT HOẠT ĐỘNG --- */}
        <div className="md:col-span-7">
          <div className="flex flex-col gap-2">
            {/* Tên địa điểm - Font Serif sang trọng */}
            <h4 className="text-lg md:text-xl font-display font-medium text-gray-900 group-hover:text-accent-700 transition-colors duration-300">
              {item.title}
            </h4>
            
            {/* Địa chỉ - Tinh tế, nhỏ gọn */}
            <p className="text-sm text-gray-500 font-light flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              <span>{item.address || "Đà Nẵng"}</span>
            </p>

            {/* Thông tin chi tiết (Thời lượng, Chi phí) - Minimalist */}
            <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
              
              {/* Thời lượng */}
              {item.type !== 'transport' && (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-gray-100 bg-white shadow-sm">
                  <svg className="w-3.5 h-3.5 text-accent-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  <span className="font-medium">
                    {(() => {
                      if (!item.duration) return '1h';
                      const hours = Math.floor(item.duration / 60);
                      const minutes = Math.round(item.duration % 60);
                      if (hours > 0 && minutes > 0) return `${hours}h ${minutes}p`;
                      if (hours > 0) return `${hours}h`;
                      return `${minutes}p`;
                    })()}
                  </span>
                </div>
              )}

              {/* Chi phí Vé / Lưu trú - CHỈ hiện khi có vé hoặc là khách sạn HOẶC là hoạt động tham quan (để hiện miễn phí) */}
              {(item.type === 'activity' || item.cost?.ticket > 0 || ((item.type === 'accommodation' || item.type === 'check-in') && item.details)) && (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-gray-100 bg-white shadow-sm">
                  <svg className="w-3.5 h-3.5 text-accent-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  {(item.type === 'accommodation' || item.type === 'check-in') ? (
                       // Logic hiển thị cho Khách sạn/Resort
                       <div className="flex flex-col items-start">
                         <span>
                           {item.cost.ticket > 0 ? formatCurrency(item.cost.ticket) : "Đã bao gồm"}
                         </span>
                         {/* Link Traveloka */}
                         <a 
                           href={`https://www.traveloka.com/vi-vn/hotel/search?keyword=${encodeURIComponent(item.title)}`}
                           target="_blank"
                           rel="noopener noreferrer"
                           className="text-[10px] text-accent-600 hover:underline mt-0.5 flex items-center gap-1 font-medium"
                         >
                           <span>Xem trên Traveloka</span>
                           <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                         </a>
                       </div>
                  ) : (
                       // Logic hiển thị cho Vé tham quan
                       <span>
                         {item.cost.ticket > 0 
                           ? `Vé: ${formatCurrency(item.cost.ticket / numPeople)}/người` 
                           : "Miễn phí vé tham quan"}
                       </span>
                  )}
                </div>
              )}

              {/* Chi phí Ăn uống - CHỈ hiện cho quán ăn có giá */}
              {(item.type === 'food' && item.cost?.food > 0) && (
                 <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-green-100 bg-green-50/50 shadow-sm">
                   <svg className="w-3.5 h-3.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                   <span className="text-green-700 font-medium">
                     ~{formatCurrency(item.cost.food / numPeople)}/người
                   </span>
                 </div>
              )}
            {/* Thông tin Di chuyển (Chi tiết) - CHỈ hiện khi là item Tranport */}
            {item.type === 'transport' && item.transport?.suggestion && (
               <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-blue-100 bg-blue-50/50 shadow-sm mt-2 w-fit">
                 <svg className="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                 <span className="text-blue-700 font-medium text-xs">
                   {item.transport.suggestion}
                 </span>
               </div>
            )}
            
            </div>

            {/* Thông tin Di chuyển (Đến đây) - Đã ẩn theo yêu cầu user */}
            {/* {item.transport?.mode && (
              <div className="mt-3 pt-3 border-t border-gray-100 w-full max-w-md">
                <div className="flex items-center gap-3 text-xs text-gray-500">
                   <span className="font-bold text-gray-800 uppercase tracking-wider text-[10px]">Đến đây: {item.transport.mode}</span>
                   <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                   <span>{Number(item.transport.distance).toFixed(1)} km</span>
                   <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                   <span>{item.transport.durationMin} phút</span>
                   <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                   <span className="font-medium text-gray-900">{formatCurrency(item.transport.cost)}</span>
                </div>
              </div>
            )} */}

            {/* Thông tin Di chuyển (Đi tiếp) - Theo yêu cầu user */}
            {nextItem?.transport?.mode && (
              <div className="mt-3 pt-3 border-t border-dashed border-gray-200 w-full max-w-md bg-gray-50/50 p-2 rounded-lg">
                <p className="text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-wider">
                   Di chuyển tới: <span className="text-accent-700">{nextItem.title}</span>
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                   <span className="font-bold text-gray-900">{nextItem.transport.mode}</span>
                   <span>•</span>
                   <span>{Number(nextItem.transport.distance).toFixed(1)} km</span>
                   <span>•</span>
                   <span>{nextItem.transport.durationMin} phút</span>
                   <span>•</span>
                   <span className="font-medium text-accent-600">{formatCurrency(nextItem.transport.cost)}</span>
                </div>
                {nextItem.transport.suggestion && (
                   <div className="text-[11px] text-accent-600 mt-1 font-medium flex items-center gap-1">
                     <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                     {nextItem.transport.suggestion}
                   </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* --- CỘT 3: TỔNG CHI PHÍ ITEM (Bên phải) --- */}
        <div className="md:col-span-3 md:text-right pt-2 hidden md:block">
          <div className="text-lg font-display font-bold text-gray-900">
            {formatCurrency(
              (item.cost?.ticket || 0) +
                (item.cost?.food || 0) +
                (item.cost?.other || 0) +
                (item.transport?.cost || 0)
            )}
          </div>
          <div className="text-xs text-gray-400 mt-1 uppercase tracking-widest font-light">
            {item.type === 'food' ? 'Ăn uống' : item.type === 'transport' ? 'Di chuyển' : (item.type === 'accommodation' || item.type === 'check-in') ? 'Tiền phòng' : item.type === 'rest' ? 'Nghỉ ngơi' : 'Vé tham quan'}
          </div>
        </div>
      </div>
    </div>
  );
}
