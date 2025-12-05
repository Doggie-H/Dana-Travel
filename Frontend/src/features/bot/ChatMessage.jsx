/**
 * =================================================================================================
 * FILE: ChatMessage.jsx
 * MỤC ĐÍCH: Hiển thị một tin nhắn trong khung Chat.
 * NGƯỜI TẠO: Team DanaTravel (AI Support)
 * 
 * MÔ TẢ CHI TIẾT (BEGINNER GUIDE):
 * Đây là "Cái bong bóng tin nhắn" mà bạn hay thấy trên Zalo/Messenger.
 * 1. Phân biệt: Tin của mình (User) thì nằm bên phải màu đen. Tin của Bot thì nằm bên trái màu trắng.
 * 2. Avatar: Chỉ Bot mới có ảnh đại diện cho chuyên nghiệp.
 * 3. Gợi ý: Đôi khi Bot sẽ đưa ra các nút bấm nhanh (Quick Replies) để bạn đỡ phải gõ phím.
 * =================================================================================================
 */

export default function ChatMessage({ message, onQuickReply }) {
  // Xác định người gửi là User hay Bot
  const isUser = message.sender === "user";

  return (
    // Container chính: Flexbox để căn chỉnh vị trí (Trái/Phải)
    <div className={`flex items-end gap-3 mb-6 ${isUser ? "justify-end" : "justify-start"}`}>
      
      {/* --- 1. AVATAR (CHỈ DÀNH CHO BOT) --- */}
      {!isUser && (
        <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center shadow-sm flex-shrink-0">
          {/* Bot Icon (SVG) */}
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path>
          </svg>
        </div>
      )}

      {/* --- 2. CHAT BUBBLE (NỘI DUNG TIN NHẮN) --- */}
      <div
        className={`relative max-w-[85%] md:max-w-[70%] px-5 py-3.5 rounded-2xl shadow-sm text-sm leading-relaxed ${
          isUser
            ? "bg-gray-900 text-white rounded-br-none" // Style User: Nền tối, bo góc đặc biệt
            : "bg-white text-gray-800 border border-gray-100 rounded-bl-none" // Style Bot: Nền trắng, viền nhẹ
        }`}
      >
        {/* Text Content: Hỗ trợ xuống dòng (whitespace-pre-line) */}
        <div className="whitespace-pre-line">{message.text}</div>

        {/* --- 3. QUICK REPLIES (GỢI Ý TRẢ LỜI) --- */}
        {/* Chỉ hiển thị cho Bot và khi có danh sách gợi ý */}
        {!isUser && message.quickReplies && message.quickReplies.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {message.quickReplies.map((reply, index) => (
              <button
                key={index}
                onClick={() => onQuickReply && onQuickReply(reply)}
                className="px-3 py-1.5 rounded-lg border border-accent-200 text-accent-700 bg-accent-50/50 hover:bg-accent-100 hover:border-accent-300 text-xs font-medium transition-all duration-200"
              >
                {reply}
              </button>
            ))}
          </div>
        )}

        {/* --- 4. TIMESTAMP (THỜI GIAN) --- */}
        <div className={`text-[10px] mt-2 font-medium ${isUser ? "text-gray-400" : "text-gray-400"}`}>
          {new Date(message.timestamp).toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>
    </div>
  );
}
