/**
 * geoService.js
 * -------------------------------------------------------------------------
 * Turns a citizen's raw GPS coordinates into a human-readable address and a
 * "zone" the rest of the app (bins, vehicles, dashboards) already groups
 * data by.
 *
 * With a GOOGLE_MAPS_API_KEY (Geocoding API enabled), this calls Google's
 * reverse geocoding endpoint and derives the zone from the neighbourhood /
 * sublocality Google returns.
 *
 * Without a key, it falls back to a deterministic grid so the app still
 * works end-to-end in development: the world is sliced into ~0.01 degree
 * cells and each cell is hashed onto one of the known zones. It's not
 * geographically meaningful, but it's stable (the same coordinates always
 * resolve to the same zone) and requires no external dependency.
 * -------------------------------------------------------------------------
 */

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
const isGeocodingEnabled = !!GOOGLE_MAPS_API_KEY;

const FALLBACK_ZONES = ["Zone A", "Zone B", "Zone C", "Zone D"];

function fallbackZoneFromCoords(lat, lng) {
  if (typeof lat !== "number" || typeof lng !== "number") return FALLBACK_ZONES[0];
  // Simple, stable hash of the coordinates onto the known zone list.
  const cellX = Math.floor(lat * 100);
  const cellY = Math.floor(lng * 100);
  const hash = Math.abs(cellX * 73856093 + cellY * 19349663) % FALLBACK_ZONES.length;
  return FALLBACK_ZONES[hash];
}

/**
 * @param {number} lat
 * @param {number} lng
 * @returns {Promise<{zone: string, address: string|null, source: "google"|"fallback"}>}
 */
async function reverseGeocode(lat, lng) {
  if (!isGeocodingEnabled || typeof lat !== "number" || typeof lng !== "number") {
    return { zone: fallbackZoneFromCoords(lat, lng), address: null, source: "fallback" };
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Geocoding HTTP ${res.status}`);
    const data = await res.json();
    if (data.status !== "OK" || !data.results?.length) throw new Error(`Geocoding status ${data.status}`);

    const result = data.results[0];
    const address = result.formatted_address;

    // Prefer a neighbourhood/sublocality component as the "zone" label;
    // fall back to locality, then the deterministic grid.
    const component =
      result.address_components.find((c) => c.types.includes("sublocality") || c.types.includes("neighborhood")) ||
      result.address_components.find((c) => c.types.includes("locality"));

    const zone = component ? component.long_name : fallbackZoneFromCoords(lat, lng);

    return { zone, address, source: "google" };
  } catch (err) {
    console.error("[geoService] reverseGeocode failed, using fallback grid:", err.message);
    return { zone: fallbackZoneFromCoords(lat, lng), address: null, source: "fallback" };
  }
}

module.exports = { isGeocodingEnabled, reverseGeocode, FALLBACK_ZONES };
