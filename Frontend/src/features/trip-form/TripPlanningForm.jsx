/**
 * Form tạo lịch trình du lịch.
 * Thu thập thông tin: Ngân sách, Số người, Thời gian, Phương tiện, Sở thích.
 */

import { useState, useEffect } from "react";


// --- ICONS (SVG Components) ---
const Icons = {
  Car: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>,
  OwnCar: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" /></svg>,
  Bike: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>,
  Taxi: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Home: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
  Hotel: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
  Bed: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2v-7m20 0a2 2 0 00-2-2H5a2 2 0 00-2 2m20 0V9a2 2 0 00-2-2h-1a2 2 0 00-2 2v3m-14 0V9a2 2 0 00-2-2H3a2 2 0 00-2 2v3" /></svg>,
  CarSolid: () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2a2 2 0 0 0 4 0h6a2 2 0 0 0 4 0h0zM5.5 16a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm12 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" /></svg>,
  BikeSolid: () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M5 20.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7zm14 0a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7zM15 7l-5 4H8a1 1 0 0 0 0 2h3l4-3.2V13h7v-2h-3l-2-4z"/></svg>,
  TaxiSolid: () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/></svg>,
  Guesthouse: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 21h18M5 21V7l8-4 8 4v14M8 11h4v10H8z" /></svg>,
};

export default function TripPlanningForm({ onSubmit, defaultValues = {} }) {
  // --- STATE MANAGEMENT ---
  const [formData, setFormData] = useState({
    budgetTotal: defaultValues.budgetTotal || "",
    numPeople: defaultValues.numPeople || "",
    arriveDateTime: defaultValues.arriveDateTime || "",
    leaveDateTime: defaultValues.leaveDateTime || "",
    transport: defaultValues.transport || "own",
    accommodation: defaultValues.accommodation || "free",
    preferences: defaultValues.preferences || [],
  });
  // ... rest of component


  const [errors, setErrors] = useState({});
  const [budgetSuggestions, setBudgetSuggestions] = useState([]);
  const [durationString, setDurationString] = useState("");

  // --- VALIDATION ---
  const validateForm = () => {
    const newErrors = {};
    
    // 1. Budget & People
    if (!formData.budgetTotal || formData.budgetTotal <= 0)
      newErrors.budgetTotal = "Vui lòng nhập ngân sách dự kiến";
    if (!formData.numPeople || formData.numPeople < 1)
      newErrors.numPeople = "Vui lòng nhập số lượng người";

    // 2. Time
    if (!formData.arriveDateTime) {
      newErrors.arriveDateTime = "Vui lòng chọn ngày giờ đến";
    } else {
      const arriveDate = new Date(formData.arriveDateTime);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const arriveDateCheck = new Date(arriveDate);
      arriveDateCheck.setHours(0,0,0,0);
      if (arriveDateCheck.getTime() < today.getTime()) {
        newErrors.arriveDateTime = "Ngày đến không được ở trong quá khứ";
      }
    }

    if (!formData.leaveDateTime) newErrors.leaveDateTime = "Vui lòng chọn ngày giờ về";
    if (formData.arriveDateTime && formData.leaveDateTime) {
      const a = new Date(formData.arriveDateTime);
      const l = new Date(formData.leaveDateTime);
      if (l.getTime() <= a.getTime()) newErrors.leaveDateTime = "Ngày giờ về phải sau ngày giờ đến";
    }

    // 3. Preferences (Min 1, Max 3)
    if (formData.preferences.length < 1) {
      newErrors.preferences = "Vui lòng chọn ít nhất 1 sở thích";
    } else if (formData.preferences.length > 3) {
      newErrors.preferences = "Vui lòng chọn tối đa 3 sở thích để lịch trình tối ưu nhất";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) onSubmit(formData);
  };

  // --- HELPER FUNCTIONS ---
  const getTodayString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const cleanNumber = (value) => value.replace(/\D/g, "").replace(/^0+/, "") || "";
  const formatNumber = (num) => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  const handleBudgetChange = (e) => {
    const raw = e.target.value;
    const cleaned = cleanNumber(raw);
    const numVal = cleaned ? Number(cleaned) : "";
    
    setFormData((p) => ({ ...p, budgetTotal: numVal }));
    if (errors.budgetTotal) setErrors((p) => ({ ...p, budgetTotal: null }));

    if (cleaned && cleaned.length > 0 && cleaned.length < 9) {
      const base = Number(cleaned);
      const suggestions = [
        base * 1000, base * 10000, base * 100000, base * 1000000, base * 10000000,
      ].filter(val => val >= 100000 && val < 1000000000);
      setBudgetSuggestions([...new Set(suggestions)].sort((a, b) => a - b));
    } else {
      setBudgetSuggestions([]);
    }
  };

  const selectBudgetSuggestion = (amount) => {
    setFormData((p) => ({ ...p, budgetTotal: amount }));
    setBudgetSuggestions([]);
  };

  const handleNumPeopleChange = (e) => {
    const cleaned = cleanNumber(e.target.value);
    setFormData((p) => ({ ...p, numPeople: cleaned ? Number(cleaned) : "" }));
    if (errors.numPeople) setErrors((p) => ({ ...p, numPeople: null }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: null }));
  };

  useEffect(() => {
    if (formData.arriveDateTime && formData.leaveDateTime) {
      const start = new Date(formData.arriveDateTime);
      const end = new Date(formData.leaveDateTime);
      if (end > start) {
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        const isSameDay = start.getDate() === end.getDate() && 
                          start.getMonth() === end.getMonth() && 
                          start.getFullYear() === end.getFullYear();
        if (isSameDay) {
          setDurationString("Đi về trong ngày");
        } else {
          const nights = diffDays - 1;
          setDurationString(`${diffDays} ngày ${nights > 0 ? nights + " đêm" : ""}`);
        }
      } else {
        setDurationString("");
      }
    } else setDurationString("");
  }, [formData.arriveDateTime, formData.leaveDateTime]);

  const handlePreferenceChange = (e) => {
    const { value, checked } = e.target;
    setFormData((p) => ({
      ...p,
      preferences: checked ? [...p.preferences, value] : p.preferences.filter((x) => x !== value),
    }));
  };

  const preferencesOptions = [
    { value: "beach", label: "Biển", icon: "🏖️" },
    { value: "culture", label: "Văn hóa", icon: "🛕" },
    { value: "food", label: "Ẩm thực", icon: "🍜" },
    { value: "theme-park", label: "Vui chơi", icon: "🎢" },
    { value: "nightlife", label: "Nightlife", icon: "🍸" },
    { value: "family", label: "Gia đình", icon: "👨‍👩‍👧‍👦" },
  ];



  return (
    <form onSubmit={handleSubmit} className="space-y-10 animate-fade-in pb-8">
      
      {/* SECTION 1: CƠ BẢN */}
      <div className="space-y-6">
        <h3 className="text-xl font-display font-medium text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-3">
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-accent-600 text-white text-xs font-bold font-sans">1</span>
          Ngân sách & Số người
        </h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Ngân sách */}
          <div className="group relative">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2 group-focus-within:text-accent-600 transition-colors">
              Ngân sách dự kiến
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.budgetTotal ? formatNumber(formData.budgetTotal) : ""}
                onChange={handleBudgetChange}
                className={`w-full pl-4 pr-12 py-3.5 rounded-xl bg-gray-50 border transition-all font-display text-lg
                  ${errors.budgetTotal 
                    ? "border-red-200 bg-red-50/10 focus:border-red-400" 
                    : "border-gray-200 hover:border-gray-300 focus:bg-white focus:border-accent-500 focus:ring-4 focus:ring-accent-50"
                  } outline-none placeholder:text-gray-300 placeholder:font-sans`}
                placeholder="VD: 5.000.000"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-sans text-xs font-bold pointer-events-none">VND</span>
            </div>

            {/* Suggestions - Gọn gàng hơn */}
            {budgetSuggestions.length > 0 && (
              <div className="absolute z-20 mt-2 w-full bg-white border border-gray-100 rounded-xl shadow-xl p-2 flex flex-wrap gap-2 animate-slide-up">
                {budgetSuggestions.map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => selectBudgetSuggestion(amount)}
                    className="px-3 py-1.5 bg-gray-50 text-gray-600 hover:bg-accent-50 hover:text-accent-700 text-xs font-bold rounded-lg transition-all border border-transparent hover:border-accent-200"
                  >
                    {formatNumber(amount)}
                  </button>
                ))}
              </div>
            )}
            {errors.budgetTotal && <p className="text-xs font-medium text-red-500 mt-2 ml-1">{errors.budgetTotal}</p>}
          </div>

          {/* Số người */}
          <div className="group">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2 group-focus-within:text-accent-600 transition-colors">
              Số lượng
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.numPeople || ""}
                onChange={handleNumPeopleChange}
                className={`w-full pl-4 pr-12 py-3.5 rounded-xl bg-gray-50 border transition-all font-display text-lg
                  ${errors.numPeople 
                    ? "border-red-200 bg-red-50/10 focus:border-red-400" 
                    : "border-gray-200 hover:border-gray-300 focus:bg-white focus:border-accent-500 focus:ring-4 focus:ring-accent-50"
                  } outline-none placeholder:text-gray-300 placeholder:font-sans`}
                placeholder="VD: 2"
              />
               <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-sans text-xs font-bold pointer-events-none">NGƯỜI</span>
            </div>
            {errors.numPeople && <p className="text-xs font-medium text-red-500 mt-2 ml-1">{errors.numPeople}</p>}
          </div>
        </div>
      </div>

      {/* SECTION 2: THỜI GIAN */}
      <div className="space-y-6">
        <h3 className="text-xl font-display font-medium text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-3">
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-accent-600 text-white text-xs font-bold font-sans">2</span>
          Thời gian tham quan
        </h3>

        <div className="grid md:grid-cols-2 gap-6">
           {/* Ngày đến */}
           <div className="space-y-2">
             <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">Bắt đầu</label>
             <div className="flex gap-2">
               <input
                 type="date"
                 value={formData.arriveDateTime ? formData.arriveDateTime.split('T')[0] : ""}
                 min={getTodayString()}
                 onChange={(e) => {
                   const date = e.target.value;
                   const time = formData.arriveDateTime ? formData.arriveDateTime.split('T')[1] : "08:00";
                   handleChange({ target: { name: 'arriveDateTime', value: date ? `${date}T${time}` : "" } });
                 }}
                 className={`flex-1 px-4 py-3.5 h-[54px] rounded-xl bg-gray-50 border font-sans text-gray-800 text-sm outline-none transition-all
                   ${errors.arriveDateTime ? "border-red-200" : "border-gray-200 focus:bg-white focus:border-accent-500 focus:ring-4 focus:ring-accent-50"}`}
               />
               <input
                 type="time"
                 value={formData.arriveDateTime ? formData.arriveDateTime.split('T')[1] : "08:00"}
                 onChange={(e) => {
                   const time = e.target.value;
                   const date = formData.arriveDateTime ? formData.arriveDateTime.split('T')[0] : getTodayString();
                   handleChange({ target: { name: 'arriveDateTime', value: `${date}T${time}` } });
                 }}
                 className="w-36 px-2 py-3.5 h-[54px] rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-accent-500 outline-none font-sans text-gray-800 text-center text-sm"
               />
             </div>
             {errors.arriveDateTime && <p className="text-xs font-medium text-red-500 ml-1">{errors.arriveDateTime}</p>}
           </div>

          {/* Ngày về */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">Kết thúc</label>
            <div className="flex gap-2">
              <input
                type="date"
                value={formData.leaveDateTime ? formData.leaveDateTime.split('T')[0] : ""}
                min={formData.arriveDateTime ? formData.arriveDateTime.split('T')[0] : getTodayString()}
                onChange={(e) => {
                  const date = e.target.value;
                  const time = formData.leaveDateTime ? formData.leaveDateTime.split('T')[1] : "18:00";
                  handleChange({ target: { name: 'leaveDateTime', value: date ? `${date}T${time}` : "" } });
                }}
                className={`flex-1 px-4 py-3.5 h-[54px] rounded-xl bg-gray-50 border font-sans text-gray-800 text-sm outline-none transition-all
                  ${errors.leaveDateTime ? "border-red-200" : "border-gray-200 focus:bg-white focus:border-accent-500 focus:ring-4 focus:ring-accent-50"}`}
              />
              <input
                type="time"
                value={formData.leaveDateTime ? formData.leaveDateTime.split('T')[1] : "18:00"}
                onChange={(e) => {
                  const time = e.target.value;
                  const date = formData.leaveDateTime ? formData.leaveDateTime.split('T')[0] : (formData.arriveDateTime ? formData.arriveDateTime.split('T')[0] : getTodayString());
                  handleChange({ target: { name: 'leaveDateTime', value: `${date}T${time}` } });
                }}
                className="w-36 px-2 py-3.5 h-[54px] rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-accent-500 outline-none font-sans text-gray-800 text-center text-sm"
              />
            </div>
            {errors.leaveDateTime && <p className="text-xs font-medium text-red-500 ml-1">{errors.leaveDateTime}</p>}
          </div>
        </div>
        
        {/* Duration Flag */}
        {durationString && (
          <div className="flex items-center gap-2 text-accent-700 bg-accent-50/50 border border-accent-100 px-4 py-2 rounded-lg w-fit animate-fade-in mt-2 ml-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <span className="text-sm font-bold font-display tracking-wide">{durationString}</span>
          </div>
        )}
      </div>

      {/* SECTION 3: TIỆN ÍCH (Cards Selection) */}
      <div className="space-y-6">
        <h3 className="text-xl font-display font-medium text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-3">
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-accent-600 text-white text-xs font-bold font-sans">3</span>
          Tiện ích chuyến đi
        </h3>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* Transport */}
          <div className="space-y-3">
             <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">Phương tiện</label>
             <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'own', label: 'Xe riêng', icon: <Icons.CarSolid /> },
                  { id: 'grab-bike', label: 'Grab Bike', icon: <Icons.BikeSolid /> },
                  { id: 'grab-car', label: 'Grab Car', icon: <Icons.TaxiSolid /> }
                ].map((opt) => (
                  <label 
                     key={opt.id}
                     className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200
                       ${formData.transport === opt.id 
                         ? "border-accent-500 bg-accent-50 text-accent-800 shadow-sm" 
                         : "border-gray-100 bg-white hover:border-gray-200 text-gray-500"}`}
                  >
                    <input type="radio" name="transport" value={opt.id} checked={formData.transport === opt.id} onChange={handleChange} className="hidden" />
                    <span className={`transition-colors ${formData.transport === opt.id ? "text-accent-600" : "text-gray-400"}`}>{opt.icon}</span>
                    <span className="font-bold text-xs">{opt.label}</span>
                  </label>
                ))}
             </div>
          </div>

          {/* Accommodation */}
          <div className="space-y-3">
             <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">Nơi nghỉ ngơi</label>
             <div className="grid grid-cols-2 gap-3">
               {[
                  { id: 'free', label: 'Nhà người quen', icon: <Icons.Home /> },
                  { id: 'hotel', label: 'Khách sạn', icon: <Icons.Hotel /> },
                  { id: 'guesthouse', label: 'Nhà nghỉ', icon: <Icons.Guesthouse /> },
                 { id: 'homestay', label: 'Homestay', icon: <Icons.Home /> }, // Reusing home 
               ].map((opt) => (
                 <label 
                   key={opt.id}
                   className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200
                     ${formData.accommodation === opt.id 
                       ? "border-accent-500 bg-accent-50 text-accent-800 shadow-sm" 
                       : "border-gray-100 bg-white hover:border-gray-200 text-gray-500"}`}
                 >
                   <input type="radio" name="accommodation" value={opt.id} checked={formData.accommodation === opt.id} onChange={handleChange} className="hidden" />
                   <span className={`transition-colors ${formData.accommodation === opt.id ? "text-accent-600" : "text-gray-400"}`}>{opt.icon}</span>
                   <span className="font-bold text-xs text-center">{opt.label}</span>
                 </label>
               ))}
             </div>
          </div>
        </div>
      </div>

      {/* SECTION 4: SỞ THÍCH */}
      <div className="space-y-6">
        <h3 className="text-xl font-display font-medium text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-3">
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-accent-600 text-white text-xs font-bold font-sans">4</span>
          Sở thích (Chọn 1-3)
        </h3>
        
        <div className="grid grid-cols-3 gap-3">
          {preferencesOptions.map((opt) => (
            <label
              key={opt.value}
              className={`relative flex flex-col items-center justify-center gap-1.5 h-20 rounded-xl border-2 cursor-pointer transition-all duration-200 group
                ${formData.preferences.includes(opt.value)
                  ? "border-accent-500 bg-accent-500 text-white shadow-soft"
                  : "border-gray-100 bg-white text-gray-500 hover:border-accent-200 hover:text-accent-600"
                }`}
            >
              <input
                type="checkbox"
                value={opt.value}
                checked={formData.preferences.includes(opt.value)}
                onChange={handlePreferenceChange}
                className="hidden"
              />
              <span className="text-lg">{opt.icon}</span>
              <span className="font-bold text-xs tracking-wide">{opt.label}</span>
            </label>
          ))}
        </div>
        {errors.preferences && <p className="text-sm font-bold text-red-500 text-center animate-pulse">{errors.preferences}</p>}
      </div>

      {/* ACTIONS */}
      <div className="pt-6 mt-6 border-t border-gray-100">
        <button
          className="group w-full py-4 rounded-2xl bg-gradient-to-r from-gray-900 to-gray-800 text-white text-lg font-display font-bold shadow-strong shadow-gray-200/50 hover:shadow-gray-400 hover:scale-[1.01] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-3"
          type="submit"
        >
          <span>✨ Tạo Lịch Trình</span>
          <svg className="w-5 h-5 text-accent-400 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
        </button>
      </div>
    </form>
  );
}
