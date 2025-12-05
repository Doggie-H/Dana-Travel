/**
 * Component Footer (Chân trang).
 * Hiển thị thông tin bản quyền và các liên kết phụ.
 */

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-gray-100 bg-white py-6">
      <div className="w-full px-4 md:px-6">
        <div className="max-w-screen-2xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            
            {/* Brand Info & Slogan */}
            <div>
              <h3 className="font-display text-[18px] font-medium tracking-[0.02em] text-gray-900 mb-1">
                Dana Travel
              </h3>
              <p className="text-[10px] text-gray-400 font-medium tracking-[0.15em] uppercase">
                Lên lịch du lịch dễ như ăn bánh
              </p>
            </div>

            {/* Footer Links */}
            <div className="flex gap-8 text-[10px] font-bold uppercase tracking-[0.15em]">
              <a href="#" className="text-gray-900 hover:text-gray-500 transition-colors duration-300">
                Về Chúng Tôi
              </a>
              <a href="#" className="text-gray-900 hover:text-gray-500 transition-colors duration-300">
                Liên Hệ
              </a>
              <a href="#" className="text-gray-900 hover:text-gray-500 transition-colors duration-300">
                Điều Khoản
              </a>
            </div>
            
          </div>
        </div>
      </div>
    </footer>
  );
}
