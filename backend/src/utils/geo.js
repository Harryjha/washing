/**
 * Geospatial Utility Functions
 * Uses the Haversine formula to calculate distance between two (lat, lng) points on Earth.
 */

// Earth radius in kilometers
const EARTH_RADIUS_KM = 6371;

/**
 * Calculates Haversine distance in kilometers between two coordinates.
 */
function getHaversineDistance(lat1, lon1, lat2, lon2) {
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

function toRad(degrees) {
  return (degrees * Math.PI) / 180;
}

/**
 * Finds the nearest store out of an array of stores for a customer's location.
 * @param {number} customerLat - Customer's latitude
 * @param {number} customerLng - Customer's longitude
 * @param {Array} stores - List of Store objects with latitude & longitude fields
 * @param {number} maxDistanceKm - Maximum allowed service boundary in km (default: 15km)
 */
function findNearestStore(customerLat, customerLng, stores, maxDistanceKm = 15) {
  if (!stores || stores.length === 0) return null;

  let nearestStore = null;
  let minDistance = Infinity;

  for (const store of stores) {
    const dist = getHaversineDistance(customerLat, customerLng, store.latitude, store.longitude);
    if (dist < minDistance) {
      minDistance = dist;
      nearestStore = store;
    }
  }

  const roundedDistance = Math.round(minDistance * 100) / 100; // 2 decimal places

  return {
    store: nearestStore,
    distanceKm: roundedDistance,
    isWithinBoundary: roundedDistance <= maxDistanceKm,
  };
}

module.exports = {
  getHaversineDistance,
  findNearestStore,
};
