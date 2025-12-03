// file: frontend/src/pages/Results.jsx

/**
 * Results Page - hiển thị lịch trình đã tạo
 *
 * Vai trò: phối ghép ItineraryCard + ItinerarySummary + action buttons
 * Actions: In, Mở Maps, Tải JSON, Chat
 */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ItineraryCard, ItinerarySummary } from "../features/itinerary";
import { loadItinerary, loadUserRequest } from "../services/storage.service.js";
import Notification from "../components/Notification";

export default function Results() {
  const navigate = useNavigate();
  const [itinerary, setItinerary] = useState(null);
  const [userRequest, setUserRequest] = useState(null);

  useEffect(() => {
    // Load from storage
    const savedItinerary = loadItinerary();
    const savedRequest = loadUserRequest();

    if (!savedItinerary) {
      // Redirect to home if no itinerary
      navigate("/");
      return;
    }

    setItinerary(savedItinerary);
    setUserRequest(savedRequest);
  }, [navigate]);

  if (!itinerary) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium">Đang tải lịch trình...</p>
          <button 
            onClick={() => navigate('/')}
            className="mt-4 text-sm text-gray-900 underline hover:text-gray-600"
          >
            Quay lại trang chủ
          </button>
        </div>
      </div>
    );
  }

  // Actions
  const handlePrint = () => {
    window.print();
  };

  const handleOpenDayMap = (day) => {
    // Tạo lộ trình Google Maps cho một ngày
    const locations = day.items
      .filter((item) => item.lat && item.lng)
      .map((item) => `${item.lat},${item.lng}`);

    if (locations.length === 0) {
      alert("Không có tọa độ địa điểm để tạo lộ trình");
      return;
    }

    // Google Maps Directions URL với waypoints
    const origin = locations[0];
    const destination = locations[locations.length - 1];
    const waypoints = locations.slice(1, -1).join("|");

    let mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;

    if (waypoints) {
      mapsUrl += `&waypoints=${waypoints}`;
    }

    window.open(mapsUrl, "_blank");
  };

  const handleDownloadJSON = () => {
    const dataStr = JSON.stringify(itinerary, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `danang-itinerary-${Date.now()}.json`;
    link.click();

    URL.revokeObjectURL(url);
  };

  const handleGoToChat = () => {
    navigate("/chat");
  };

  return (
    <div className="min-h-screen bg-white pt-24 pb-20 px-6 lg:px-12">
      <div className="container mx-auto max-w-screen-xl">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-16 border-b border-gray-100 pb-8">
          <div>
            <h1 className="font-display text-4xl md:text-5xl font-medium text-gray-900 mb-4">
              Lịch Trình Của Bạn
            </h1>
            <div className="flex flex-wrap gap-6 text-sm font-medium text-gray-500 uppercase tracking-widest">
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                {itinerary.city}
              </span>
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                {itinerary.days.length} Ngày
              </span>
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                {userRequest?.numPeople || 0} Khách
              </span>
              {userRequest?.budgetTotal && (
                <span className="flex items-center gap-2 text-gray-900">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-900"></span>
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(userRequest.budgetTotal)}
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons - Minimalist */}
          <div className="flex gap-4 no-print">
            <button
              className="px-6 py-3 text-sm font-bold uppercase tracking-wider text-gray-500 hover:text-gray-900 transition-colors"
              onClick={handlePrint}
            >
              In Lịch Trình
            </button>
            <button
              className="px-6 py-3 bg-gray-900 text-white text-sm font-bold uppercase tracking-wider hover:bg-gray-800 transition-all"
              onClick={handleDownloadJSON}
            >
              Tải Về
            </button>
          </div>
        </div>

        {/* Summary Section */}
        <div className="mb-16">
          <ItinerarySummary summary={itinerary.summary} />
        </div>

        {/* Days Detail */}
        <div className="space-y-16">
          <div className="flex items-center gap-4 mb-8">
            <h2 className="font-display text-3xl text-gray-900">Chi Tiết Hành Trình</h2>
            <div className="h-px flex-1 bg-gray-100"></div>
          </div>
          
          {itinerary.days.map((day, index) => (
            <div key={index} className="relative pl-8 md:pl-0">
              {/* Timeline Line for Mobile */}
              <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-100 md:hidden"></div>
              
              <div className="mb-8">
                <ItineraryCard day={day} numPeople={userRequest?.numPeople || 1} />
                <div className="mt-6 flex justify-end no-print">
                  <button
                    className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-gray-900 flex items-center gap-2 transition-colors"
                    onClick={() => handleOpenDayMap(day)}
                  >
                    <span>Xem Bản Đồ Ngày {day.dayNumber}</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Chat CTA - Elegant */}
        <div className="mt-24 bg-gray-50 p-12 text-center border border-gray-100 no-print">
          <h3 className="font-display text-3xl text-gray-900 mb-4">Cần Điều Chỉnh?</h3>
          <p className="text-gray-500 font-light mb-8 max-w-lg mx-auto">
            Trợ lý du lịch của chúng tôi sẵn sàng giúp bạn thay đổi địa điểm, tìm quán ăn hoặc tối ưu chi phí.
          </p>
          <button
            className="inline-flex items-center gap-3 px-8 py-4 border border-gray-900 text-gray-900 text-sm font-bold uppercase tracking-widest hover:bg-gray-900 hover:text-white transition-all duration-300"
            onClick={handleGoToChat}
          >
            <span>Trò Chuyện Với Trợ Lý</span>
          </button>
        </div>
      </div>
    </div>
  );
}
