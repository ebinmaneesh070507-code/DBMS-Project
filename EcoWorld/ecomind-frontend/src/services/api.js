const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Strip the leading /api/uploads-relative path into a full backend URL,
// e.g. "/uploads/169...jpg" -> "http://localhost:5000/uploads/169...jpg"
export const resolveImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  const origin = BASE_URL.replace(/\/api\/?$/, '');
  return `${origin}${path}`;
};

async function request(path, options = {}) {
  const isFormData = options.body instanceof FormData;

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(options.headers || {}),
    },
  });

  const payload = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(payload.message || `API error ${res.status} on ${path}`);
  }

  return payload;
}

const get = (path) => request(path).then((r) => r.data);
const post = (path, body) =>
  request(path, {
    method: 'POST',
    body: body instanceof FormData ? body : JSON.stringify(body),
  }).then((r) => r.data);
const patch = (path, body) =>
  request(path, { method: 'PATCH', body: JSON.stringify(body) }).then((r) => r.data);
const del = (path) => request(path, { method: 'DELETE' }).then((r) => r.data);

export const api = {
  // --- Dashboard ---
  getDashboardStats: () => get('/dashboard/stats'),
  getDashboardCharts: () => get('/dashboard/charts'),
  getAiInsights: () => get('/dashboard/insights'),

  // --- Smart Bins ---
  getSmartBins: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return get(`/bins${qs ? `?${qs}` : ''}`);
  },
  getBinById: (id) => get(`/bins/${id}`),
  createBin: (payload) => post('/bins', payload),
  updateBin: (id, payload) => patch(`/bins/${id}`, payload),
  deleteBin: (id) => del(`/bins/${id}`),

  // --- Waste Prediction ---
  getPredictions: () => get('/predictions'),

  // --- Smart Collection ---
  getVehicles: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return get(`/collection/vehicles${qs ? `?${qs}` : ''}`);
  },
  updateVehicle: (id, payload) => patch(`/collection/vehicles/${id}`, payload),

  // --- Waste Reports (citizen reporting) ---
  // payload: { wasteType, description, zone, priority, image? (File) }
  submitWasteReport: (payload) => {
    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== undefined && value !== null) formData.append(key, value);
    });
    return post('/reports', formData);
  },
  getWasteReports: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return get(`/reports${qs ? `?${qs}` : ''}`);
  },
  updateReportStatus: (id, status) => patch(`/reports/${id}/status`, { status }),

  // --- Illegal Dumping Reports ---
  // payload: { zone, description, priority, image (File, required) }
  submitDumpingReport: (payload) => {
    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== undefined && value !== null) formData.append(key, value);
    });
    return post('/dumping-reports', formData);
  },
  getDumpingReports: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return get(`/dumping-reports${qs ? `?${qs}` : ''}`);
  },
  updateDumpingStatus: (id, status) => patch(`/dumping-reports/${id}/status`, { status }),

  // --- AI Waste Scanner ---
  analyzeWasteImage: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return post('/scanner/analyze', formData);
  },
  getScanHistory: () => get('/scanner/history'),
  getWasteCategories: () => get('/scanner/categories'),

  // --- AI Database Assistant ---
  askAssistant: (question) => post('/assistant/ask', { question }),

  // --- Auth (admin dashboard) ---
  login: (email, password) => request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (payload) => request('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
};