/**
 * Form tạo lịch trình du lịch.
 * Thu thập thông tin: Ngân sách, Số người, Thời gian, Phương tiện, Sở thích.
 */

import { useState, useEffect } from "react";


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

    // Bước 3: Không bắt buộc (có giá trị mặc định)

    // Bước 4: Kiểm tra Sở thích (Min 1, Max 4)
    if (step === 4) {
      if (formData.preferences.length < 1) {
        newErrors.preferences = "Vui lòng chọn ít nhất 1 sở thích";
      } else if (formData.preferences.length > 3) {
        newErrors.preferences = "Vui lòng chọn tối đa 3 sở thích để lịch trình tối ưu nhất";
      }
    }
    
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
          {/* Ngày đến */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-bold text-gray-700 mb-2">Ngày đến *</label>
              <input
                type="date"
                value={formData.arriveDateTime ? formData.arriveDateTime.split('T')[0] : ""}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => {
                  const date = e.target.value;
                  const time = formData.arriveDateTime ? formData.arriveDateTime.split('T')[1] : "08:00";
                  handleChange({ target: { name: 'arriveDateTime', value: date ? `${date}T${time}` : "" } });
                }}
                className={`w-full px-4 py-3 rounded-xl border-2 bg-white transition-all ${
                  errors.arriveDateTime 
                    ? "border-red-300 focus:border-red-500 focus:ring-red-100" 
                    : "border-gray-100 focus:border-accent-500 focus:ring-accent-100"
                } focus:ring-4 outline-none text-gray-900 font-medium placeholder-gray-300`}
              />
            </div>
            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-bold text-gray-700 mb-2">Giờ đến</label>
              <input
                type="time"
                value={formData.arriveDateTime ? formData.arriveDateTime.split('T')[1] : "08:00"}
                onChange={(e) => {
                  const time = e.target.value;
                  const date = formData.arriveDateTime ? formData.arriveDateTime.split('T')[0] : new Date().toISOString().split('T')[0];
                  handleChange({ target: { name: 'arriveDateTime', value: `${date}T${time}` } });
                }}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 bg-white focus:border-accent-500 focus:ring-4 focus:ring-accent-100 outline-none text-gray-900 font-medium"
              />
            </div>
            {errors.arriveDateTime && (
              <p className="col-span-2 text-xs font-bold text-red-500 ml-1">{errors.arriveDateTime}</p>
            )}
          </div>

          {/* Ngày về */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-bold text-gray-700 mb-2">Ngày về *</label>
              <input
                type="date"
                value={formData.leaveDateTime ? formData.leaveDateTime.split('T')[0] : ""}
                min={formData.arriveDateTime ? formData.arriveDateTime.split('T')[0] : new Date().toISOString().split('T')[0]}
                onChange={(e) => {
                  const date = e.target.value;
                  const time = formData.leaveDateTime ? formData.leaveDateTime.split('T')[1] : "18:00";
                  handleChange({ target: { name: 'leaveDateTime', value: date ? `${date}T${time}` : "" } });
                }}
                className={`w-full px-4 py-3 rounded-xl border-2 bg-white transition-all ${
                  errors.leaveDateTime 
                    ? "border-red-300 focus:border-red-500 focus:ring-red-100" 
                    : "border-gray-100 focus:border-accent-500 focus:ring-accent-100"
                } focus:ring-4 outline-none text-gray-900 font-medium placeholder-gray-300`}
              />
            </div>
            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-bold text-gray-700 mb-2">Giờ về</label>
              <input
                type="time"
                value={formData.leaveDateTime ? formData.leaveDateTime.split('T')[1] : "18:00"}
                onChange={(e) => {
                  const time = e.target.value;
                  const date = formData.leaveDateTime ? formData.leaveDateTime.split('T')[0] : (formData.arriveDateTime ? formData.arriveDateTime.split('T')[0] : new Date().toISOString().split('T')[0]);
                  handleChange({ target: { name: 'leaveDateTime', value: `${date}T${time}` } });
                }}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 bg-white focus:border-accent-500 focus:ring-4 focus:ring-accent-100 outline-none text-gray-900 font-medium"
              />
            </div>
            {errors.leaveDateTime && (
              <p className="col-span-2 text-xs font-bold text-red-500 ml-1">{errors.leaveDateTime}</p>
            )}
          </div>
          
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
                <option value="guesthouse">Nhà nghỉ (Guesthouse)</option>
                <option value="homestay">Homestay</option>
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
          {errors.preferences && (
            <p className="text-sm font-bold text-red-500 mt-2 animate-fadeIn">
              {errors.preferences}
            </p>
          )}
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
