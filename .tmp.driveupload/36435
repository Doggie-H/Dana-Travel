// file: frontend/src/pages/Chat.jsx

/**
 * Chat Page - chatbot interface
 *
 * Vai trò: phối ghép ChatMessage + input + call API
 * Flow: user input → sendChatMessage API → update messages
 */

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ChatMessage } from "../features/bot";
import { sendChatMessage } from "../services/api.service.js";
import {
  loadItinerary,
  loadUserRequest,
  saveChatHistory,
  loadChatHistory,
} from "../services/storage.service.js";
import Loading from "../components/Loading";

export default function Chat() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [context, setContext] = useState({});
  const messagesEndRef = useRef(null);

  // Load itinerary & chat history on mount
  useEffect(() => {
    const itinerary = loadItinerary();
    const userRequest = loadUserRequest();
    let history = loadChatHistory();

    setContext({ itinerary, userRequest });

    // Check if history contains old robotic messages and clear if necessary
    const isRobotic = history.some(msg => msg.text.includes("Xin chào! Tôi có thể giúp bạn"));
    if (isRobotic) {
      history = [];
      localStorage.removeItem("chatHistory"); // Force clear from storage
    }

    if (history.length > 0) {
      setMessages(history);
    } else {
      // Initial welcome message - Consultant Style
      setMessages([
        {
          sender: "bot",
          text:
            "Chào bạn, mình là trợ lý du lịch riêng của bạn tại Đà Nẵng.\n\n" +
            "Mình ở đây để giúp chuyến đi của bạn trở nên hoàn hảo nhất. Bạn đang băn khoăn điều gì không?\n\n" +
            "• Bạn muốn tìm quán cafe đẹp hay nhà hàng chuẩn vị?\n" +
            "• Cần phương án dự phòng khi trời mưa?\n" +
            "• Hay muốn thay đổi lịch trình cho phù hợp hơn?\n\n" +
            "Cứ thoải mái chia sẻ với mình nhé!",
          timestamp: new Date().toISOString(),
          quickReplies: [
            "Gợi ý quán ăn ngon",
            "Chỗ chơi khi trời mưa",
            "Điều chỉnh lịch trình",
          ],
        },
      ]);
    }
  }, []);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Save chat history
  useEffect(() => {
    if (messages.length > 0) {
      saveChatHistory(messages);
    }
  }, [messages]);

  // Send message
  const handleSend = async (text) => {
    if (!text.trim() || isLoading) return;

    const userMessage = {
      sender: "user",
      text: text.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsLoading(true);

    try {
      // Call API
      const response = await sendChatMessage(text, context);

      // Add bot response
      const botMessage = {
        sender: "bot",
        text: response.reply,
        timestamp: new Date().toISOString(),
        quickReplies: response.quickReplies || [],
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = {
        sender: "bot",
        text: "Xin lỗi, mình đang gặp chút trục trặc. Bạn thử lại giúp mình nhé.",
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, errorMessage]);
      console.error("Chat error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    handleSend(inputText);
  };

  // Handle quick reply
  const handleQuickReply = (text) => {
    handleSend(text);
  };

  return (
    <div className="min-h-screen bg-white pt-24 pb-10 px-6 lg:px-12 flex flex-col items-center">
      <div className="w-full container mx-auto max-w-screen-lg flex-1 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-6">
          <div>
            <h2 className="font-display text-3xl text-gray-900">Trợ Lý Du Lịch</h2>
            <p className="text-sm text-gray-500 font-light mt-1">Luôn sẵn sàng hỗ trợ 24/7</p>
          </div>
          <button
            className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-colors"
            onClick={() => navigate("/results")}
          >
            Quay Lại
          </button>
        </div>

        {/* Chat Container - Clean & Minimal */}
        <div className="flex-1 bg-gray-50 border border-gray-100 flex flex-col relative overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-6">
            {messages.map((msg, index) => (
              <ChatMessage
                key={index}
                message={msg}
                onQuickReply={handleQuickReply}
              />
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-100 px-6 py-4 rounded-tr-2xl rounded-br-2xl rounded-bl-2xl shadow-sm">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area - Refined */}
          <div className="p-6 bg-white border-t border-gray-100">
            <form onSubmit={handleSubmit} className="relative">
              <input
                type="text"
                className="w-full pl-6 pr-16 py-4 bg-gray-50 border-none focus:ring-1 focus:ring-gray-200 text-gray-900 placeholder-gray-400 font-light transition-all"
                placeholder="Nhập câu hỏi của bạn..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={isLoading}
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-900 transition-colors disabled:opacity-50"
                disabled={isLoading || !inputText.trim()}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
              </button>
            </form>
          </div>
        </div>

        {/* Tips - Minimal */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-400 font-light tracking-wide">
            <span className="font-bold text-gray-600 uppercase tracking-wider mr-2">Gợi ý:</span> 
            Hỏi về địa điểm tránh mưa, quán ăn ngon, hoặc thay đổi lịch trình.
          </p>
        </div>
      </div>
    </div>
  );
}
