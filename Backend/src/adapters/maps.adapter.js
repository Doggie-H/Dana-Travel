/**
 * GOOGLE MAPS ADAPTER
 * 
 * Module chịu trách nhiệm giao tiếp với Google Maps Platform.
 * Cung cấp các chức năng: Chỉ đường (Directions), Tính khoảng cách (Distance Matrix).
 * 
 * Yêu cầu:
 * - Cần có GOOGLE_MAPS_API_KEY trong biến môi trường (.env).
 * - Nếu không có Key, các hàm sẽ trả về null (Graceful degradation).
 */

/**
 * Lấy lộ trình di chuyển giữa các điểm.
 * Sử dụng Directions API.
 * 
 * @param {Array} waypoints - Danh sách các điểm [{lat, lng}].
 * Điểm đầu là origin, điểm cuối là destination, các điểm giữa là waypoints.
 * @returns {Promise<Object|null>} - Dữ liệu lộ trình hoặc null nếu lỗi.
 */
export async function getDirections(waypoints) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  // Kiểm tra điều kiện tiên quyết
  if (!apiKey || waypoints.length < 2) {
    return null;
  }

  // Định dạng điểm đi và điểm đến
  const origin = `${waypoints[0].lat},${waypoints[0].lng}`;
  const destination = `${waypoints[waypoints.length - 1].lat},${
    waypoints[waypoints.length - 1].lng
  }`;

  // Định dạng các điểm trung gian (nếu có)
  const waypointsParam = waypoints
    .slice(1, -1)
    .map((w) => `${w.lat},${w.lng}`)
    .join("|");

  // Xây dựng URL request
  const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}${
    waypointsParam ? "&waypoints=" + waypointsParam : ""
  }&key=${apiKey}`;

  try {
    const response = await fetch(url);
    if (!response.ok) return null;

    const data = await response.json();
    // Trả về route đầu tiên tìm thấy
    return data.routes?.[0] || null;
  } catch (error) {
    console.error("Lỗi khi gọi Google Maps Directions:", error);
    return null;
  }
}

/**
 * Tính ma trận khoảng cách giữa các điểm.
 * Sử dụng Distance Matrix API.
 * Hữu ích để tối ưu hóa lộ trình hoặc tính chi phí di chuyển.
 * 
 * @param {Array} origins - Danh sách điểm xuất phát [{lat, lng}].
 * @param {Array} destinations - Danh sách điểm đến [{lat, lng}].
 * @returns {Promise<Object|null>} - Dữ liệu ma trận khoảng cách.
 */
export async function getDistanceMatrix(origins, destinations) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!apiKey || origins.length === 0 || destinations.length === 0) {
    return null;
  }

  const originsParam = origins.map((o) => `${o.lat},${o.lng}`).join("|");
  const destParam = destinations.map((d) => `${d.lat},${d.lng}`).join("|");

  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${originsParam}&destinations=${destParam}&key=${apiKey}`;

  try {
    const response = await fetch(url);
    if (!response.ok) return null;

    return await response.json();
  } catch (error) {
    console.error("Lỗi khi gọi Google Maps Distance Matrix:", error);
    return null;
  }
}

export default {
  getDirections,
  getDistanceMatrix,
};
