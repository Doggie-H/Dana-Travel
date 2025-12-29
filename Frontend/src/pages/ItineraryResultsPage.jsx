/**
 * =================================================================================================
 * ITINERARY RESULTS PAGE
 * =================================================================================================
 * 
 * Trang hiển thị chi tiết lịch trình du lịch.
 * Gồm: Header, Summary, Timeline (Days), và Actions (In, Download, Map).
 */

import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ItineraryCard from "../features/itinerary/ItineraryCard";
import ItinerarySummary from "../features/itinerary/ItinerarySummary";
import { loadItinerary, loadUserRequest } from "../services/storage-service.js";

/**
 * =================================================================================================
 * MAIN COMPONENT
 * =================================================================================================
 */
export default function ItineraryResultsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // --- STATE ---
  const [itinerary, setItinerary] = useState(null);
  const [userRequest, setUserRequest] = useState(null);

  // --- INITIALIZATION ---
  useEffect(() => {
    const savedItinerary = loadItinerary();
    const savedRequest = loadUserRequest();

    if (!savedItinerary) {
      navigate("/"); // Redirect if no data
      return;
    }

    setItinerary(savedItinerary);
    setUserRequest(savedRequest);
  }, [navigate]);

  // --- AUTO PRINT (From Chatbot) ---
  useEffect(() => {
    if (location.state?.autoPrint) {
      const timer = setTimeout(() => window.print(), 1000);
      return () => clearTimeout(timer);
    }
  }, [location.state]);


  // --- ACTIONS ---

  const handlePrint = () => window.print();

  const handleDownloadJSON = () => {
    const dataStr = JSON.stringify(itinerary, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `danang-itinerary-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleOpenDayMap = (day) => {
    const coords = day.items
      .filter(item => item.location?.lat && item.location?.lng)
      .map(item => `${item.location.lat},${item.location.lng}`);

    if (coords.length === 0) {
      alert("Không có tọa độ địa điểm để tạo lộ trình");
      return;
    }

    const origin = coords[0];
    const destination = coords[coords.length - 1];
    const waypoints = coords.slice(1, -1).join("|");
    
    let url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;
    if (waypoints) url += `&waypoints=${waypoints}`;
    
    window.open(url, "_blank");
  };


  // --- RENDER ---

  if (!itinerary) {
    return <LoadingState onCancel={() => navigate('/')} />;
  }

  return (
    <div className="min-h-screen bg-white pt-24 pb-20 px-6 lg:px-12">
      <div className="container mx-auto max-w-screen-xl">
        
        {/* 1. HEADER */}
        <HeaderSection 
          itinerary={itinerary} 
          userRequest={userRequest} 
          onPrint={handlePrint} 
          onDownload={handleDownloadJSON} 
        />

        {/* 2. SUMMARY */}
        <div className="mb-16">
          <ItinerarySummary summary={itinerary.summary} />
        </div>

        {/* 3. DAYS TIMELINE */}
        <div className="space-y-16">
          <div className="flex items-center gap-4 mb-8">
            <h2 className="font-display text-3xl text-gray-900">Chi Tiết Hành Trình</h2>
            <div className="h-px flex-1 bg-gray-100" />
          </div>
          
          {itinerary.days.map((day, idx) => (
            <div key={idx} className="relative pl-8 md:pl-0">
              <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-100 md:hidden" />
              <div className="mb-8">
                <ItineraryCard day={day} numPeople={userRequest?.numPeople || 1} />
                <MapButton onClick={() => handleOpenDayMap(day)} dayNumber={day.dayNumber} />
              </div>
            </div>
          ))}
        </div>

        {/* 4. CTA */}
        <CTASection onChat={() => navigate("/chat")} />

      </div>
    </div>
  );
}

/**
 * =================================================================================================
 * SUB-COMPONENTS (Clean Rendering)
 * =================================================================================================
 */

function LoadingState({ onCancel }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500 font-medium">Đang tải lịch trình...</p>
        <button onClick={onCancel} className="mt-4 text-sm text-gray-900 underline hover:text-gray-600">
          Quay lại trang chủ
        </button>
      </div>
    </div>
  );
}

function HeaderSection({ itinerary, userRequest, onPrint, onDownload }) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-16 border-b border-gray-100 pb-8">
      <div>
        <h1 className="font-display text-4xl md:text-5xl font-medium text-gray-900 mb-4">
          Lịch Trình Của Bạn
        </h1>
        <div className="flex flex-wrap gap-6 text-sm font-medium text-gray-500 uppercase tracking-widest">
          <Badge text={itinerary.city} />
          <Badge text={`${itinerary.days.length} Ngày`} />
          <Badge text={`${userRequest?.numPeople || 0} Khách`} />
          {userRequest?.budgetTotal && (
            <Badge 
              text={new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(userRequest.budgetTotal)} 
              dark 
            />
          )}
        </div>
      </div>

      <div className="flex gap-4 no-print">
        <button className="px-6 py-3 text-sm font-bold uppercase tracking-wider text-gray-500 hover:text-gray-900" onClick={onPrint}>
          In Lịch Trình
        </button>
        <button className="px-6 py-3 bg-gray-900 text-white text-sm font-bold uppercase tracking-wider hover:bg-gray-800" onClick={onDownload}>
          Tải Về
        </button>
      </div>
    </div>
  );
}

function MapButton({ onClick, dayNumber }) {
  return (
    <div className="mt-6 flex justify-end no-print">
      <button onClick={onClick} className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-gray-900 flex items-center gap-2">
        <span>Xem Bản Đồ Ngày {dayNumber}</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
      </button>
    </div>
  );
}

function CTASection({ onChat }) {
  return (
    <div className="mt-24 bg-gray-50 p-12 text-center border border-gray-100 no-print">
      <h3 className="font-display text-3xl text-gray-900 mb-4">Cần Điều Chỉnh?</h3>
      <p className="text-gray-500 font-light mb-8 max-w-lg mx-auto">
        Trợ lý du lịch của chúng tôi sẵn sàng giúp bạn thay đổi địa điểm, tìm quán ăn hoặc tối ưu chi phí.
      </p>
      <button onClick={onChat} className="inline-flex items-center gap-3 px-8 py-4 border border-gray-900 text-gray-900 text-sm font-bold uppercase tracking-widest hover:bg-gray-900 hover:text-white transition-all">
        <span>Trò Chuyện Với Trợ Lý</span>
      </button>
    </div>
  );
}

function Badge({ text, dark }) {
  return (
    <span className={`flex items-center gap-2 ${dark ? "text-gray-900" : ""}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dark ? "bg-gray-900" : "bg-gray-300"}`} />
      {text}
    </span>
  );
}
