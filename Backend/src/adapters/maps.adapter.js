// file: backend/adapters/mapsAdapter.js

/**
 * Google Maps Adapter - tích hợp Google Maps APIs
 *
 * Vai trò: adapter cho Geocoding, Directions, Distance Matrix
 * NOTE: Cần GOOGLE_MAPS_API_KEY trong .env
 */

/**
 * Get directions between locations
 * @param {Array} waypoints - [{lat, lng}]
 * @returns {Promise<Object>} - directions data
 */
export async function getDirections(waypoints) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!apiKey || waypoints.length < 2) {
    return null;
  }

  const origin = `${waypoints[0].lat},${waypoints[0].lng}`;
  const destination = `${waypoints[waypoints.length - 1].lat},${
    waypoints[waypoints.length - 1].lng
  }`;

  const waypointsParam = waypoints
    .slice(1, -1)
    .map((w) => `${w.lat},${w.lng}`)
    .join("|");

  const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}${
    waypointsParam ? "&waypoints=" + waypointsParam : ""
  }&key=${apiKey}`;

  try {
    const response = await fetch(url);
    if (!response.ok) return null;

    const data = await response.json();
    return data.routes?.[0] || null;
  } catch (error) {
    console.error("Maps Directions error:", error);
    return null;
  }
}

/**
 * Calculate distance matrix
 * @param {Array} origins - [{lat, lng}]
 * @param {Array} destinations - [{lat, lng}]
 * @returns {Promise<Object>}
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
    console.error("Distance Matrix error:", error);
    return null;
  }
}

export default {
  getDirections,
  getDistanceMatrix,
};
