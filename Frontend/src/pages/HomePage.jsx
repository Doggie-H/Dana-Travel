/**
 * =================================================================================================
 * HOME PAGE
 * =================================================================================================
 * 
 * Trang chủ ứng dụng với phong cách "Editorial" (Tạp chí).
 * Bao gồm:
 * 1. Hero Section: Thông điệp chính.
 * 2. Trip Form Modal: Form nhập yêu cầu.
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

// Services & Actions
import { generateItinerary } from "../services/api-service.js";
import { saveItinerary, saveUserRequest } from "../services/storage-service.js";

// Components
import TripPlanningForm from "../features/trip-form/TripPlanningForm";

/**
 * =================================================================================================
 * MAIN COMPONENT
 * =================================================================================================
 */
export default function Home() {
  const navigate = useNavigate();
  
  // --- STATE ---
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // --- ACTIONS ---
  const handleSubmit = async (formData) => {
    setIsLoading(true);
    setError(null);
    try {
      // 1. Call API
      const itinerary = await generateItinerary(formData);
      
      // 2. Save Session
      saveItinerary(itinerary);
      saveUserRequest(formData);
      
      // 3. Redirect
      navigate("/results");
    } catch (err) {
      setError(err.message || "Không thể tạo lịch trình. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- RENDER ---
  return (
    <div className="h-full font-sans text-gray-900 bg-white selection:bg-gray-900 selection:text-white overflow-hidden">
      
      {/* 1. HERO SECTION */}
      <section className="relative h-full flex flex-col items-center justify-center px-6 md:px-10 lg:px-16 xl:px-24">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="text-center w-full max-w-3xl mx-auto"
        >
          <p className="text-[9px] font-semibold tracking-[0.35em] uppercase text-gray-400 mb-8">
            Khám Phá Đà Nẵng Theo Cách Của Bạn
          </p>
          
          <h1 className="font-display text-[56px] md:text-[72px] lg:text-[88px] font-medium tracking-[-0.02em] text-gray-900 leading-[0.92] mb-6">
            Đà Nẵng<br/>
            <span className="italic font-light text-gray-400">của riêng bạn</span>
          </h1>

          <p className="text-[15px] md:text-[16px] text-gray-500 font-light max-w-md mx-auto leading-[1.75] tracking-[0.01em] mb-10">
            Bạn có ngân sách, chúng tôi có kế hoạch.<br/>
            Đơn giản vậy thôi!
          </p>

          <motion.button
            whileHover={{ opacity: 0.6 }}
            transition={{ duration: 0.3 }}
            onClick={() => setShowForm(true)}
            className="group"
          >
            <span className="inline-block text-[10px] font-bold tracking-[0.25em] uppercase text-gray-900 pb-1 border-b-2 border-gray-900">
              Lên lịch trình
            </span>
          </motion.button>
        </motion.div>
      </section>

      {/* 2. MODAL FORM SECTION */}
      {showForm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-white/95 backdrop-blur-xl" onClick={() => setShowForm(false)} />
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full max-w-3xl relative z-10 px-6 md:px-10 max-h-[90vh] overflow-y-auto rounded-3xl scrollbar-hide shadow-2xl"
          >
            <button onClick={() => setShowForm(false)} className="absolute -top-12 right-0 md:-right-12 p-2 text-gray-400 hover:text-gray-900">
              <span className="text-xs font-bold tracking-widest uppercase">Đóng</span>
            </button>

            <div className="py-8">
              <div className="text-center mb-12">
                <h2 className="font-display text-4xl font-medium text-gray-900 mb-2">Thiết Kế Hành Trình</h2>
                <p className="text-gray-400 font-light text-sm tracking-wide">HỖ TRỢ BỞI AI</p>
              </div>
              
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-6">
                  <div className="w-px h-20 bg-gray-200 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1/2 bg-gray-900 animate-slide-down"></div>
                  </div>
                  <p className="text-xs font-bold tracking-[0.2em] uppercase text-gray-900">Đang Xử Lý</p>
                </div>
              ) : (
                <TripPlanningForm onSubmit={handleSubmit} />
              )}

              {error && <div className="mt-8 text-center text-red-500 text-sm font-medium">{error}</div>}
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
}
