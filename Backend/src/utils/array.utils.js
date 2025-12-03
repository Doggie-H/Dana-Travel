// file: backend/utils/arrayUtils.js

/**
 * Utilities cho xử lý mảng (pick random, shuffle)
 *
 * Vai trò: tái sử dụng logic chọn ngẫu nhiên địa điểm/items
 * Input: array
 * Output: array con hoặc shuffled array
 */

/**
 * Chọn ngẫu nhiên N phần tử từ array (không trùng)
 * @param {Array} array - mảng nguồn
 * @param {number} count - số phần tử cần chọn
 * @returns {Array} - mảng con
 *
 * @example
 * pickRandom([1,2,3,4,5], 2) => [3, 1]
 */
export function pickRandom(array, count) {
  if (!Array.isArray(array) || array.length === 0) {
    return [];
  }

  const n = Math.min(count, array.length);
  const shuffled = [...array].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

/**
 * Shuffle mảng (Fisher-Yates algorithm)
 * @param {Array} array
 * @returns {Array} - mảng đã shuffle (copy)
 */
export function shuffle(array) {
  if (!Array.isArray(array)) {
    return [];
  }

  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Chọn 1 phần tử ngẫu nhiên từ array
 * @param {Array} array
 * @returns {*} - phần tử hoặc undefined
 */
export function pickOne(array) {
  if (!Array.isArray(array) || array.length === 0) {
    return undefined;
  }
  const index = Math.floor(Math.random() * array.length);
  return array[index];
}

/**
 * Lọc mảng loại bỏ duplicates theo key
 * @param {Array} array
 * @param {string} key - tên property để so sánh
 * @returns {Array}
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
      return false;
    }
    seen.add(val);
    return true;
  });
}

export default {
  pickRandom,
  shuffle,
  pickOne,
  uniqueBy,
};
