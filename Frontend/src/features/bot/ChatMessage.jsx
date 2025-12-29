/**
 * Component hiển thị tin nhắn trong khung chat.
 * Hỗ trợ hiển thị tin nhắn của User (phải) và Bot (trái) cùng với các gợi ý (quick replies).
 */

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';

export default function ChatMessage({ message, onQuickReply }) {
  // Xác định người gửi là User hay Bot
  const isUser = message.sender === "user";

  return (
    // Container chính: Flexbox để căn chỉnh vị trí (Trái/Phải)
    <div className={`flex items-end gap-3 mb-6 ${isUser ? "justify-end" : "justify-start"}`}>
      
      {/* --- 1. AVATAR (CHỈ DÀNH CHO BOT) --- */}
      {!isUser && (
        <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center shadow-sm flex-shrink-0">
          <span className="text-xs font-bold text-white">AI</span>
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
        {/* Text Content: Hỗ trợ Markdown (Bold, Intalic, List, etc.) */}
        <div className="text-gray-700">
           {/* Nếu là User thì render text thường (để tránh lỗi), Bot thì render Markdown */}
           {isUser ? (
             <div className="whitespace-pre-line text-white">{message.text}</div>
           ) : (
             <ReactMarkdown 
               remarkPlugins={[remarkGfm, remarkBreaks]}
               components={{
                 // H3: Minimalist, Bold, Dark Gray (No flashy underline)
                 h3: ({node, ...props}) => <h3 className="text-base md:text-lg font-bold text-gray-900 mt-4 mb-2 tracking-tight" {...props} />,
                 
                 // UL: Classic indentation, subtle styling
                 ul: ({node, ...props}) => <ul className="list-disc pl-5 my-2 space-y-1 text-gray-700 marker:text-gray-400" {...props} />,
                 
                 // LI: Clean spacing
                 li: ({node, ...props}) => <li className="pl-1" {...props} />,
                 
                 // Strong: Crisp dark text
                 strong: ({node, ...props}) => <strong className="font-semibold text-gray-900" {...props} />,
                 
                 // P: Elegant readable type
                 p: ({node, ...props}) => <p className="mb-2 leading-relaxed text-gray-700" {...props} />
               }}
             >
               {message.text}
             </ReactMarkdown>
           )}
        </div>

        {/* --- 3. QUICK REPLIES (GỢI Ý TRẢ LỜI) --- */}
        {/* Chỉ hiển thị cho Bot và khi có danh sách gợi ý */}
        {!isUser && message.quickReplies && message.quickReplies.length > 0 && (
          <div className="mt-4 flex flex-col gap-2 w-full">
            {message.quickReplies.map((reply, index) => (
              <button
                key={index}
                onClick={() => onQuickReply && onQuickReply(reply)}
                className="w-full text-left px-5 py-3 rounded-xl border border-gray-200 bg-white text-sm font-bold text-gray-800 hover:bg-gray-50 hover:border-gray-900 transition-all duration-300 shadow-sm"
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
