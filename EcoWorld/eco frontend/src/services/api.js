// ---------------------------------------------------------------------------
// api.js
//
// Single data-access layer for the whole app. Every function here talks to
// the real Express backend — nothing in this file returns mock/fake data.
// Auth token handling (attach + 401 handling) lives here so pages never
// touch localStorage or fetch() directly.
// ---------------------------------------------------------------------------

export const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
export const API_ORIGIN = BASE_URL.replace(/\/api\/?$/, '');

const TOKEN_KEY = 'ecomind_token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

// Turns a backend-relative path like "/uploads/xyz.jpg" into a full URL.
export function resolveImageUrl(path) {
  if (!path) return null;
  if (/^https?:\/\//.test(path)) return path;
  return `${API_ORIGIN}${path}`;
}

class ApiRequestError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

async function request(path, { method = 'GET', body, isMultipart = false, auth = true } = {}) {
  const headers = {};
  if (!isMultipart) headers['Content-Type'] = 'application/json';
  if (auth) {
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: isMultipart ? body : body ? JSON.stringify(body) : undefined,
  });

  let payload = null;
  try {
    payload = await res.json();
  } catch {
    // non-JSON response (rare — e.g. a proxy error page)
  }

  if (!res.ok) {
    if (res.status === 401) setToken(null);
    throw new ApiRequestError(payload?.message || `Request failed (${res.status})`, res.status);
  }
  return payload;
}

export const api = {
  // --- Auth -----------------------------------------------------------
  register: (name, email, password) =>
    request('/auth/register', { method: 'POST', body: { name, email, password }, auth: false }),
  login: (email, password) => request('/auth/login', { method: 'POST', body: { email, password }, auth: false }),
  getMe: () => request('/auth/me'),

  // --- Reports (core citizen flow: photo + location -> AI -> dispatch) --
  submitReport: (formData) => request('/reports', { method: 'POST', body: formData, isMultipart: true }),
  getMyReports: () => request('/reports/mine'),
  getMyImpact: () => request('/reports/my-impact'),
  getAllReports: (params = {}) => {
    const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v && v !== 'All')).toString();
    return request(`/reports${qs ? `?${qs}` : ''}`);
  },
  updateReportStatus: (id, status) => request(`/reports/${id}/status`, { method: 'PATCH', body: { status } }),

  // --- AI Waste Scanner (identify only, no report/dispatch) -----------
  analyzeWaste: (formData) => request('/scanner/analyze', { method: 'POST', body: formData, isMultipart: true }),
  getScanCategories: () => request('/scanner/categories', { auth: false }),

  // --- Dashboard analytics (any signed-in user) ------------------------
  getDashboardStats: () => request('/dashboard/stats'),
  getDashboardCharts: () => request('/dashboard/charts'),
  getDashboardInsights: () => request('/dashboard/insights'),

  // --- Smart Bins -------------------------------------------------------
  getBins: (params = {}) => {
    const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v && v !== 'All')).toString();
    return request(`/bins${qs ? `?${qs}` : ''}`);
  },

  // --- Predictions --------------------------------------------------------
  getPredictions: () => request('/predictions'),

  // --- Collection / fleet -------------------------------------------------
  getVehicles: () => request('/collection/vehicles'),

  // --- Illegal dumping ------------------------------------------------------
  submitDumpingReport: (formData) => request('/dumping-reports', { method: 'POST', body: formData, isMultipart: true }),
  getMyDumpingReports: () => request('/dumping-reports/mine'),
  getAllDumpingReports: (params = {}) => {
    const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v && v !== 'All')).toString();
    return request(`/dumping-reports${qs ? `?${qs}` : ''}`);
  },
  updateDumpingStatus: (id, status) => request(`/dumping-reports/${id}/status`, { method: 'PATCH', body: { status } }),

  // --- AI Database Assistant (admin/staff only, server-enforced) --------
  askAssistant: (question) => request('/assistant/ask', { method: 'POST', body: { question } }),
};

export { ApiRequestError };
