/**
 * HOME PAGE
 * 
 * Trang chủ của ứng dụng, nơi bắt đầu hành trình trải nghiệm của người dùng.
 * 
 * Chức năng chính:
 * 1. Giới thiệu (Hero Section): Gây ấn tượng với thiết kế tối giản, sang trọng.
 * 2. Kêu gọi hành động (CTA): Nút "Lên lịch trình" mở form nhập liệu.
 * 3. Form Modal: Hiển thị TripPlanningForm dưới dạng popup (modal).
 * 4. Xử lý logic tạo lịch trình: Gọi API và điều hướng sang trang kết quả.
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { TripPlanningForm } from "../features/trip-form";
import { generateItinerary } from "../services/api.service.js";
import { saveItinerary, saveUserRequest } from "../services/storage.service.js";

export default function Home() {
  const navigate = useNavigate();
  
  // State quản lý trạng thái tải, lỗi và hiển thị form
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);

  /**
   * Xử lý khi người dùng submit form tạo lịch trình.
   * 1. Gọi API generateItinerary.
   * 2. Lưu kết quả vào Storage.
   * 3. Chuyển hướng sang trang Results.
   */
  const handleSubmit = async (formData) => {
    setIsLoading(true);
    setError(null);
    try {
      // Gọi API Backend
      const itinerary = await generateItinerary(formData);
      
      // Lưu dữ liệu để dùng ở trang Results và Chat
      saveItinerary(itinerary);
      saveUserRequest(formData);
      
      // Chuyển trang
      navigate("/results");
    } catch (err) {
      setError(err.message || "Không thể tạo lịch trình. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full font-sans text-gray-900 bg-white selection:bg-gray-900 selection:text-white overflow-hidden">
      
      {/* 
        HERO SECTION - Phong cách Tạp chí (Editorial Style)
        Tập trung vào Typography, khoảng trắng và sự tối giản.
      */}
      <section className="relative h-full flex flex-col items-center justify-center px-6 md:px-10 lg:px-16 xl:px-24">
        
        {/* Hiệu ứng xuất hiện dần (Fade In + Slide Up) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="text-center w-full max-w-3xl mx-auto"
        >
          {/* Subheading */}
          <p className="text-[9px] font-semibold tracking-[0.35em] uppercase text-gray-400 mb-8">
            Khám Phá Đà Nẵng Theo Cách Của Bạn
          </p>
          
          {/* Main Heading */}
          <h1 className="font-display text-[56px] md:text-[72px] lg:text-[88px] font-medium tracking-[-0.02em] text-gray-900 leading-[0.92] mb-6">
            Đà Nẵng<br/>
            <span className="italic font-light text-gray-400">của riêng bạn</span>
          </h1>

          {/* Description */}
          <p className="text-[15px] md:text-[16px] text-gray-500 font-light max-w-md mx-auto leading-[1.75] tracking-[0.01em] mb-10">
            Bạn có ngân sách, chúng tôi có kế hoạch.<br/>
            Đơn giản vậy thôi!
          </p>

          {/* CTA Button */}
          <motion.button
            whileHover={{ opacity: 0.6 }}
            transition={{ duration: 0.3 }}
            onClick={() => setShowForm(true)}
            className="group"
          >
            <span className="inline-block text-[10px] font-bold tracking-[0.25em] uppercase text-gray-900 pb-1 transition-opacity duration-300 border-b-2 border-gray-900">
              Lên lịch trình
            </span>
          </motion.button>
        </motion.div>
      </section>

      {/* 
        MODAL FORM SECTION
        Hiển thị form nhập liệu trên nền mờ (Backdrop Blur).
      */}
      {showForm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          {/* Backdrop (Click để đóng) */}
          <div 
            className="absolute inset-0 bg-white/95 backdrop-blur-xl"
            onClick={() => setShowForm(false)}
          ></div>
          
          {/* Modal Content */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white w-full max-w-3xl relative z-10 px-6 md:px-10"
          >
            {/* Close Button */}
            <button 
              onClick={() => setShowForm(false)}
              className="absolute -top-12 right-0 md:-right-12 p-2 text-gray-400 hover:text-gray-900 transition-colors"
            >
              <span className="text-xs font-bold tracking-widest uppercase">Đóng</span>
            </button>

            <div className="py-8">
              <div className="text-center mb-12">
                <h2 className="font-display text-4xl font-medium text-gray-900 mb-2">Thiết Kế Hành Trình</h2>
                <p className="text-gray-400 font-light text-sm tracking-wide">HỖ TRỢ BỞI AI</p>
              </div>
              
              {/* Loading State */}
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-6">
                  <div className="w-px h-20 bg-gray-200 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1/2 bg-gray-900 animate-slide-down"></div>
                  </div>
                  <p className="text-xs font-bold tracking-[0.2em] uppercase text-gray-900">Đang Xử Lý</p>
                </div>
              ) : (
                /* Form Component */
                <TripPlanningForm onSubmit={handleSubmit} />
              )}

              {/* Error Message */}
              {error && (
                <div className="mt-8 text-center">
                  <p className="text-red-500 text-sm font-medium">{error}</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
}
