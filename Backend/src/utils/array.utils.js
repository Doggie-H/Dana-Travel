/**
 * ARRAY UTILITIES
 * 
 * Bộ công cụ tiện ích xử lý mảng.
 * Cung cấp các hàm helper để thao tác với dữ liệu danh sách một cách hiệu quả.
 * 
 * Các chức năng chính:
 * 1. Chọn ngẫu nhiên (Random Pick).
 * 2. Trộn ngẫu nhiên (Shuffle).
 * 3. Lọc trùng lặp (Unique).
 */

/**
 * Chọn ngẫu nhiên N phần tử từ mảng (Không trùng lặp).
 * Sử dụng thuật toán sort ngẫu nhiên.
 * 
 * @param {Array} array - Mảng nguồn.
 * @param {number} count - Số lượng phần tử cần lấy.
 * @returns {Array} - Mảng con chứa các phần tử ngẫu nhiên.
 *
 * @example
 * pickRandom([1, 2, 3, 4, 5], 2) => [3, 1]
 */
export function pickRandom(array, count) {
  if (!Array.isArray(array) || array.length === 0) {
    return [];
  }

  // Đảm bảo không lấy quá số lượng phần tử có trong mảng
  const n = Math.min(count, array.length);
  
  // Tạo bản sao và shuffle để không ảnh hưởng mảng gốc
  const shuffled = [...array].sort(() => Math.random() - 0.5);
  
  return shuffled.slice(0, n);
}

/**
 * Trộn ngẫu nhiên thứ tự các phần tử trong mảng.
 * Sử dụng thuật toán Fisher-Yates (Knuth) Shuffle để đảm bảo độ ngẫu nhiên đều.
 * 
 * @param {Array} array - Mảng nguồn.
 * @returns {Array} - Mảng mới đã được trộn.
 */
export function shuffle(array) {
  if (!Array.isArray(array)) {
    return [];
  }

  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    // Chọn một vị trí ngẫu nhiên từ 0 đến i
    const j = Math.floor(Math.random() * (i + 1));
    // Hoán đổi vị trí
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Chọn duy nhất 1 phần tử ngẫu nhiên từ mảng.
 * 
 * @param {Array} array - Mảng nguồn.
 * @returns {*} - Phần tử được chọn hoặc undefined nếu mảng rỗng.
 */
export function pickOne(array) {
  if (!Array.isArray(array) || array.length === 0) {
    return undefined;
  }
  const index = Math.floor(Math.random() * array.length);
  return array[index];
}

/**
 * Lọc bỏ các phần tử trùng lặp trong mảng dựa trên một thuộc tính (key).
 * Hữu ích khi xử lý danh sách đối tượng (Object Array).
 * 
 * @param {Array} array - Mảng nguồn.
 * @param {string} key - Tên thuộc tính dùng để so sánh (ví dụ: 'id').
 * @returns {Array} - Mảng mới chỉ chứa các phần tử duy nhất.
 *
 * @example
 * uniqueBy([{id:1}, {id:2}, {id:1}], 'id') => [{id:1}, {id:2}]
 */
export function uniqueBy(array, key) {
  if (!Array.isArray(array)) {
    return [];
  }

  const seen = new Set();
  return array.filter((item) => {
    const val = item[key];
    if (seen.has(val)) {
      return false; // Đã tồn tại -> Bỏ qua
    }
    seen.add(val); // Đánh dấu đã thấy
    return true; // Giữ lại
  });
}

export default {
  pickRandom,
  shuffle,
  pickOne,
  uniqueBy,
};
