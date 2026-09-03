// ---------------------------------------------------------------------------
// api.js
//
// Placeholder data-access layer. Every page currently imports fixtures
// straight from src/data/mockData.js. Once the Express backend exists,
// re-point these functions at real endpoints (they already return promises
// so call sites won't need to change) and swap the mockData imports in
// pages for these instead.
// ---------------------------------------------------------------------------

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`API error ${res.status} on ${path}`);
  return res.json();
}

export const api = {
  getDashboardStats: () => request('/dashboard/stats'),
  getSmartBins: () => request('/bins'),
  getVehicles: () => request('/collection/vehicles'),
  getDumpingReports: () => request('/reports/dumping'),
  submitWasteReport: (payload) =>
    request('/reports/waste', { method: 'POST', body: JSON.stringify(payload) }),
  getPredictions: () => request('/predictions'),
};
