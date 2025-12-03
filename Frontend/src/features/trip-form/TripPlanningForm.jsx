// file: frontend/src/features/trip-form/TripPlanningForm.jsx

/**
 * TripPlanningForm Component
 * 
 * Đây là form chính để người dùng nhập thông tin lập kế hoạch du lịch.
 * Được thiết kế theo dạng Multi-step Wizard (Từng bước một) để nâng cao trải nghiệm người dùng.
 * 
 * Các chức năng chính:
 * 1. Thu thập thông tin: Ngân sách, Số người, Thời gian, Phương tiện, Sở thích.
 * 2. Validate dữ liệu: Kiểm tra tính hợp lệ trước khi chuyển bước.
 * 3. Gợi ý thông minh: Tự động gợi ý ngân sách, tính toán thời lượng chuyến đi.
 * 4. Quản lý trạng thái: Sử dụng React State để lưu trữ dữ liệu tạm thời.
 */

import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function TripPlanningForm({ onSubmit, defaultValues = {} }) {
  // --- STATE MANAGEMENT (QUẢN LÝ TRẠNG THÁI) ---

  // Quản lý bước hiện tại của Wizard (1 -> 5)
  const [step, setStep] = useState(1);

  // Quản lý toàn bộ dữ liệu form
  const [formData, setFormData] = useState({
    budgetTotal: defaultValues.budgetTotal || "",
    numPeople: defaultValues.numPeople || "",
    arriveDateTime: defaultValues.arriveDateTime || "",
    leaveDateTime: defaultValues.leaveDateTime || "",
    transport: defaultValues.transport || "own",
    accommodation: defaultValues.accommodation || "free",
    preferences: defaultValues.preferences || [],
  });

  // Quản lý lỗi validation (để hiển thị thông báo đỏ)
  const [errors, setErrors] = useState({});

  // Quản lý danh sách gợi ý ngân sách (khi người dùng nhập số)
  const [budgetSuggestions, setBudgetSuggestions] = useState([]);

  // Chuỗi hiển thị thời lượng chuyến đi (VD: "3 ngày 2 đêm")
  const [durationString, setDurationString] = useState("");

  // --- LOGIC ĐIỀU HƯỚNG & VALIDATION ---

  /**
   * Chuyển đổi giữa các bước (Next/Prev).
   * @param {number} delta - Số bước cần nhảy (+1 hoặc -1).
   */
  const goto = (delta) => {
    setStep((s) => Math.min(5, Math.max(1, s + delta)));
  };

  /**
   * Kiểm tra tính hợp lệ của dữ liệu trong bước hiện tại.
   * @returns {boolean} - True nếu hợp lệ, False nếu có lỗi.
   */
  const validateStep = () => {
    const newErrors = {};
    
    // Bước 1: Kiểm tra Ngân sách & Số người
    if (step === 1) {
      if (!formData.budgetTotal || formData.budgetTotal <= 0)
        newErrors.budgetTotal = "Vui lòng nhập ngân sách dự kiến";
      if (!formData.numPeople || formData.numPeople < 1)
        newErrors.numPeople = "Vui lòng nhập số lượng người";
    }

    // Bước 2: Kiểm tra Thời gian
    if (step === 2) {
      if (!formData.arriveDateTime) newErrors.arriveDateTime = "Vui lòng chọn ngày giờ đến";
      if (!formData.leaveDateTime) newErrors.leaveDateTime = "Vui lòng chọn ngày giờ về";
      
      // Kiểm tra logic: Ngày về phải sau ngày đến
      if (formData.arriveDateTime && formData.leaveDateTime) {
        const a = new Date(formData.arriveDateTime);
        const l = new Date(formData.leaveDateTime);
        if (l <= a) newErrors.leaveDateTime = "Ngày về phải sau ngày đến";
      }
    }

    // Bước 3 & 4: Không bắt buộc (có giá trị mặc định)
    
    setErrors(newErrors);
    // Trả về true nếu object lỗi rỗng
    return Object.keys(newErrors).length === 0;
  };

  // Xử lý sự kiện bấm nút "Tiếp tục"
  const handleNext = (e) => {
    e.preventDefault();
    if (validateStep()) goto(1);
  };

  // Xử lý sự kiện bấm nút "Quay lại"
  const handlePrev = (e) => {
    e.preventDefault();
    goto(-1);
  };

  // Xử lý sự kiện Submit form ở bước cuối
  const handleSubmit = (e) => {
    e.preventDefault();
    const allOk = validateStep();
    if (allOk) onSubmit(formData);
  };

  // --- HELPER FUNCTIONS (CÁC HÀM HỖ TRỢ) ---

  const cleanNumber = (value) => value.replace(/\D/g, "").replace(/^0+/, "") || "";
  const formatNumber = (num) => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  /**
   * Xử lý khi nhập ngân sách.
   * Tự động tạo các gợi ý số tiền chẵn (VD: nhập 5 -> gợi ý 500k, 5tr...).
   */
  const handleBudgetChange = (e) => {
    const raw = e.target.value;
    const cleaned = cleanNumber(raw);
    const numVal = cleaned ? Number(cleaned) : "";
    
    setFormData((p) => ({ ...p, budgetTotal: numVal }));
    if (errors.budgetTotal) setErrors((p) => ({ ...p, budgetTotal: null }));

    // Logic gợi ý thông minh
    if (cleaned && cleaned.length > 0 && cleaned.length < 9) {
      const base = Number(cleaned);
      const suggestions = [
        base * 1000,      // VD: 123 -> 123.000
        base * 10000,     // VD: 123 -> 1.230.000
        base * 100000,    // VD: 2 -> 200.000
        base * 1000000,   // VD: 2 -> 2.000.000
        base * 10000000,  // VD: 2 -> 20.000.000
      ].filter(val => val >= 100000 && val < 1000000000); // Chỉ hiển thị gợi ý từ 100k trở lên
      
      // Loại bỏ trùng lặp và sắp xếp tăng dần
      const uniqueSuggestions = [...new Set(suggestions)].sort((a, b) => a - b);
      setBudgetSuggestions(uniqueSuggestions);
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

  // Tự động tính toán chuỗi thời lượng (Duration String) khi ngày thay đổi
  useEffect(() => {
    if (formData.arriveDateTime && formData.leaveDateTime) {
      const start = new Date(formData.arriveDateTime);
      const end = new Date(formData.leaveDateTime);
      
      if (end > start) {
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        
        // Kiểm tra xem có phải đi về trong ngày không
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
    } else {
      setDurationString("");
    }
  }, [formData.arriveDateTime, formData.leaveDateTime]);

  const handlePreferenceChange = (e) => {
    const { value, checked } = e.target;
    setFormData((p) => ({
      ...p,
      preferences: checked
        ? [...p.preferences, value]
        : p.preferences.filter((x) => x !== value),
    }));
  };

  // Danh sách các tùy chọn sở thích cố định
  const preferencesOptions = [
    { value: "nature", label: "Thiên nhiên" },
    { value: "beach", label: "Biển" },
    { value: "culture", label: "Văn hóa" },
    { value: "food", label: "Ẩm thực" },
    { value: "theme-park", label: "Vui chơi giải trí" },
    { value: "nightlife", label: "Cuộc sống đêm" },
    { value: "family", label: "Gia đình" },
  ];

  // Component hiển thị thanh tiến trình (Progress Bar)
  const Progress = () => (
    <div className="flex items-center gap-2 justify-center mb-6">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className={`h-1.5 rounded-full transition-all duration-300 ${
            i === step ? "bg-accent-500 w-12" : "bg-gray-200 w-6"
          }`}
        />
      ))}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Progress />
      
      {/* --- BƯỚC 1: NGÂN SÁCH & SỐ NGƯỜI --- */}
      {step === 1 && (
        <div className="space-y-5">
          <div className="grid md:grid-cols-2 gap-5">
            <div className="relative">
              <label className="block text-sm font-bold text-gray-700 mb-2">Tổng ngân sách (VND) *</label>
              <input
                type="text"
                value={formData.budgetTotal ? formatNumber(formData.budgetTotal) : ""}
                onChange={handleBudgetChange}
                className={`w-full px-4 py-3 rounded-xl border-2 bg-white transition-all ${
                  errors.budgetTotal 
                    ? "border-red-300 focus:border-red-500 focus:ring-red-100" 
                    : "border-gray-100 focus:border-accent-500 focus:ring-accent-100"
                } focus:ring-4 outline-none text-gray-900 font-medium placeholder-gray-300`}
                placeholder="VD: 5.000.000"
              />
              {/* Dropdown gợi ý ngân sách */}
              {budgetSuggestions.length > 0 && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-100 rounded-xl shadow-lg p-2 flex flex-wrap gap-2 animate-fadeIn">
                  {budgetSuggestions.map((amount) => (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => selectBudgetSuggestion(amount)}
                      className="px-3 py-1.5 bg-accent-50 text-accent-700 text-xs font-bold rounded-lg hover:bg-accent-100 transition-colors"
                    >
                      {formatNumber(amount)} đ
                    </button>
                  ))}
                </div>
              )}
              {errors.budgetTotal && (
                <p className="text-xs font-bold text-red-500 mt-1.5 ml-1">{errors.budgetTotal}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Số người *</label>
              <input
                type="text"
                value={formData.numPeople || ""}
                onChange={handleNumPeopleChange}
                className={`w-full px-4 py-3 rounded-xl border-2 bg-white transition-all ${
                  errors.numPeople 
                    ? "border-red-300 focus:border-red-500 focus:ring-red-100" 
                    : "border-gray-100 focus:border-accent-500 focus:ring-accent-100"
                } focus:ring-4 outline-none text-gray-900 font-medium placeholder-gray-300`}
                placeholder="VD: 4"
              />
              {errors.numPeople && (
                <p className="text-xs font-bold text-red-500 mt-1.5 ml-1">{errors.numPeople}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- BƯỚC 2: THỜI GIAN --- */}
      {step === 2 && (
        <div className="space-y-5">
          {/* Bộ chọn ngày (Date Range Picker) */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Ngày đi - Ngày về *</label>
            <DatePicker
              selected={formData.arriveDateTime ? new Date(formData.arriveDateTime) : null}
              onChange={(dates) => {
                const [start, end] = dates;
                
                if (start) {
                  const existingStartTime = formData.arriveDateTime ? new Date(formData.arriveDateTime) : new Date();
                  start.setHours(existingStartTime.getHours() || 8, existingStartTime.getMinutes() || 0);
                  handleChange({ target: { name: 'arriveDateTime', value: start.toISOString().slice(0, 16) } });
                }
                
                if (end) {
                  const existingEndTime = formData.leaveDateTime ? new Date(formData.leaveDateTime) : new Date();
                  end.setHours(existingEndTime.getHours() || 18, existingEndTime.getMinutes() || 0);
                  handleChange({ target: { name: 'leaveDateTime', value: end.toISOString().slice(0, 16) } });
                } else if (start && !end) {
                  handleChange({ target: { name: 'leaveDateTime', value: '' } });
                }
              }}
              startDate={formData.arriveDateTime ? new Date(formData.arriveDateTime) : null}
              endDate={formData.leaveDateTime ? new Date(formData.leaveDateTime) : null}
              selectsRange
              minDate={new Date()}
              monthsShown={2}
              dateFormat="dd/MM/yyyy"
              placeholderText="Chọn ngày đến và ngày rời đi"
              className={`w-full px-4 py-3 rounded-xl border-2 bg-white transition-all ${
                errors.arriveDateTime || errors.leaveDateTime
                  ? "border-red-300 focus:border-red-500 focus:ring-red-100" 
                  : "border-gray-100 focus:border-accent-500 focus:ring-accent-100"
              } focus:ring-4 outline-none text-gray-900 font-medium placeholder-gray-300`}
            />
            {(errors.arriveDateTime || errors.leaveDateTime) && (
              <p className="text-xs font-bold text-red-500 mt-1.5 ml-1">
                {errors.arriveDateTime || errors.leaveDateTime}
              </p>
            )}
          </div>

          {/* Bộ chọn giờ nhanh (Quick Time Selection) */}
          {formData.arriveDateTime && formData.leaveDateTime && (
            <div className="grid md:grid-cols-2 gap-5 animate-fadeIn">
              {/* Giờ đến */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  Giờ đến Đà Nẵng
                  <span className="block text-xs font-normal text-gray-500 mt-1">
                    (Thời gian bạn có mặt tại Đà Nẵng để bắt đầu lịch trình)
                  </span>
                </label>
                <div className="space-y-2">
                  <div className="grid grid-cols-4 gap-2">
                    {['06:00', '08:00', '12:00', '14:00', '18:00', '20:00', '22:00'].map((time) => {
                      const [hours, minutes] = time.split(':');
                      const currentDate = formData.arriveDateTime ? new Date(formData.arriveDateTime) : null;
                      const isSelected = currentDate && 
                        currentDate.getHours() === parseInt(hours) && 
                        currentDate.getMinutes() === parseInt(minutes);
                      
                      return (
                        <button
                          key={time}
                          type="button"
                          onClick={() => {
                            if (formData.arriveDateTime) {
                              const dateStr = formData.arriveDateTime.split('T')[0];
                              const newDateTime = `${dateStr}T${time}`;
                              handleChange({ target: { name: 'arriveDateTime', value: newDateTime } });
                            }
                          }}
                          className={`px-3 py-2 rounded-lg border-2 font-medium text-sm transition-all ${
                            isSelected
                              ? 'bg-gray-900 text-white border-gray-900'
                              : 'bg-white text-gray-700 border-gray-200 hover:border-gray-900 hover:bg-gray-50'
                          }`}
                        >
                          {time}
                        </button>
                      );
                    })}
                    
                    <input
                      type="time"
                      value={formData.arriveDateTime ? formData.arriveDateTime.split('T')[1] : '08:00'}
                      onChange={(e) => {
                        if (formData.arriveDateTime && e.target.value) {
                          const dateStr = formData.arriveDateTime.split('T')[0];
                          const newDateTime = `${dateStr}T${e.target.value}`;
                          handleChange({ target: { name: 'arriveDateTime', value: newDateTime } });
                        }
                      }}
                      className="px-3 py-2 rounded-lg border-2 border-gray-200 hover:border-gray-900 focus:border-gray-900 focus:ring-4 focus:ring-gray-100 outline-none text-gray-900 font-medium text-sm text-center transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Giờ về */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  Giờ rời Đà Nẵng
                  <span className="block text-xs font-normal text-gray-500 mt-1">
                    (Thời gian bạn lên xe/máy bay để kết thúc lịch trình)
                  </span>
                </label>
                <div className="space-y-2">
                  <div className="grid grid-cols-4 gap-2">
                    {['06:00', '08:00', '12:00', '14:00', '18:00', '20:00', '22:00'].map((time) => {
                      const [hours, minutes] = time.split(':');
                      const currentDate = formData.leaveDateTime ? new Date(formData.leaveDateTime) : null;
                      const isSelected = currentDate && 
                        currentDate.getHours() === parseInt(hours) && 
                        currentDate.getMinutes() === parseInt(minutes);
                      
                      return (
                        <button
                          key={time}
                          type="button"
                          onClick={() => {
                            if (formData.leaveDateTime) {
                              const dateStr = formData.leaveDateTime.split('T')[0];
                              const newDateTime = `${dateStr}T${time}`;
                              handleChange({ target: { name: 'leaveDateTime', value: newDateTime } });
                            }
                          }}
                          className={`px-3 py-2 rounded-lg border-2 font-medium text-sm transition-all ${
                            isSelected
                              ? 'bg-gray-900 text-white border-gray-900'
                              : 'bg-white text-gray-700 border-gray-200 hover:border-gray-900 hover:bg-gray-50'
                          }`}
                        >
                          {time}
                        </button>
                      );
                    })}
                    
                    <input
                      type="time"
                      value={formData.leaveDateTime ? formData.leaveDateTime.split('T')[1] : '18:00'}
                      onChange={(e) => {
                        if (formData.leaveDateTime && e.target.value) {
                          const dateStr = formData.leaveDateTime.split('T')[0];
                          const newDateTime = `${dateStr}T${e.target.value}`;
                          handleChange({ target: { name: 'leaveDateTime', value: newDateTime } });
                        }
                      }}
                      className="px-3 py-2 rounded-lg border-2 border-gray-200 hover:border-gray-900 focus:border-gray-900 focus:ring-4 focus:ring-gray-100 outline-none text-gray-900 font-medium text-sm text-center transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Hiển thị tổng thời gian chuyến đi */}
          {durationString && (
            <div className="flex items-center justify-center p-3 bg-blue-50 text-blue-700 rounded-xl border border-blue-100 animate-fadeIn">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <span className="font-bold text-sm">Thời lượng: {durationString}</span>
            </div>
          )}
        </div>
      )}

      {/* --- BƯỚC 3: PHƯƠNG TIỆN & LƯU TRÚ --- */}
      {step === 3 && (
        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Phương tiện di chuyển
            </label>
            <div className="relative">
              <select
                name="transport"
                value={formData.transport}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 bg-white focus:border-accent-500 focus:ring-4 focus:ring-accent-100 outline-none appearance-none font-medium text-gray-900"
              >
                <option value="own">Xe riêng</option>
                <option value="grab-bike">Grab/XanhSM Bike</option>
                <option value="grab-car">Grab/XanhSM Car</option>
                <option value="taxi">Taxi Truyền thống</option>
                <option value="public">Xe buýt công cộng</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Nơi nghỉ ngơi</label>
            <div className="relative">
              <select
                name="accommodation"
                value={formData.accommodation}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 bg-white focus:border-accent-500 focus:ring-4 focus:ring-accent-100 outline-none appearance-none font-medium text-gray-900"
              >
                <option value="free">Nhà người quen / Đã có chỗ</option>
                <option value="hotel">Khách sạn</option>
                <option value="homestay">Homestay</option>
                <option value="resort">Resort nghỉ dưỡng</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- BƯỚC 4: SỞ THÍCH --- */}
      {step === 4 && (
        <div className="space-y-4">
          <label className="block text-sm font-bold text-gray-700">Bạn thích trải nghiệm gì?</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {preferencesOptions.map((opt) => (
              <label
                key={opt.value}
                className={`flex items-center gap-3 rounded-xl border-2 px-4 py-3 text-sm font-bold cursor-pointer select-none transition-all duration-200 ${
                  formData.preferences.includes(opt.value)
                    ? "bg-accent-50 border-accent-500 text-accent-800 shadow-sm"
                    : "bg-white border-gray-100 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <input
                  type="checkbox"
                  value={opt.value}
                  checked={formData.preferences.includes(opt.value)}
                  onChange={handlePreferenceChange}
                  className="accent-accent-600 w-4 h-4"
                />
                {opt.label}
              </label>
            ))}
          </div>
        </div>
      )}

      {/* --- BƯỚC 5: XÁC NHẬN --- */}
      {step === 5 && (
        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 text-center">
          <h4 className="text-lg font-bold text-gray-900 mb-4">Xác nhận thông tin</h4>
          <div className="space-y-2 text-sm text-gray-600">
            <p><span className="font-semibold text-gray-800">Ngân sách:</span> {formData.budgetTotal ? formatNumber(formData.budgetTotal) : "-"} đ</p>
            <p><span className="font-semibold text-gray-800">Số người:</span> {formData.numPeople || "-"}</p>
            <p>
              <span className="font-semibold text-gray-800">Thời gian:</span> {formData.arriveDateTime || "-"} <span className="text-gray-400">→</span> {formData.leaveDateTime || "-"}
            </p>
            <p className="text-accent-600 font-bold">{durationString}</p>
            <p><span className="font-semibold text-gray-800">Phương tiện:</span> {formData.transport}</p>
            <p><span className="font-semibold text-gray-800">Nơi nghỉ:</span> {formData.accommodation}</p>
            <p>
              <span className="font-semibold text-gray-800">Sở thích:</span>{" "}
              {formData.preferences.length
                ? formData.preferences.map(p => preferencesOptions.find(o => o.value === p)?.label).join(", ")
                : "Không có"}
            </p>
          </div>
        </div>
      )}

      {/* --- CÁC NÚT ĐIỀU HƯỚNG --- */}
      <div className="flex justify-between items-center pt-4 border-t border-gray-50">
        {step > 1 ? (
          <button
            onClick={handlePrev}
            className="px-6 py-2.5 rounded-xl text-gray-500 font-bold hover:bg-gray-100 hover:text-gray-900 transition-colors"
            type="button"
          >
            Quay lại
          </button>
        ) : (
          <span />
        )}
        
        {step < 5 ? (
          <button
            onClick={handleNext}
            className="px-8 py-3 rounded-xl bg-gray-900 text-white font-bold shadow-lg shadow-gray-200 hover:bg-gray-800 hover:scale-105 active:scale-95 transition-all duration-200"
            type="button"
          >
            Tiếp tục
          </button>
        ) : (
          <button
            className="px-10 py-3 rounded-xl bg-accent-500 text-white font-bold shadow-lg shadow-accent-200 hover:bg-accent-600 hover:scale-105 active:scale-95 transition-all duration-200"
            type="submit"
          >
            Tạo Lịch Trình
          </button>
        )}
      </div>
    </form>
  );
}
