// ---------------------------------------------------------------------------
// api.js
//
// Data-access layer for the EcoMind backend. Every function returns the
// backend's `data` field directly. The JWT issued at Google Sign-In is
// stored in localStorage and attached to every request automatically.
// ---------------------------------------------------------------------------

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const TOKEN_KEY = 'ecomind_token';

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

// "/uploads/169....jpg" -> "http://localhost:5000/uploads/169....jpg"
export const resolveImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  const origin = BASE_URL.replace(/\/api\/?$/, '');
  return `${origin}${path}`;
};

async function request(path, options = {}) {
  const isFormData = options.body instanceof FormData;
  const token = tokenStore.get();

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const payload = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = new Error(payload.message || `API error ${res.status} on ${path}`);
    err.status = res.status;
    throw err;
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

const qs = (params = {}) => {
  const clean = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ''));
  const s = new URLSearchParams(clean).toString();
  return s ? `?${s}` : '';
};

export const api = {
  // --- Auth ---
  googleLogin: (credential) => request('/auth/google', { method: 'POST', body: JSON.stringify({ credential }) }),
  getMe: () => get('/auth/me'),
  setMyRole: (role) => patch('/auth/role', { role }),

  // --- Zones ---
  getZones: () => get('/zones'),
  createZone: (name) => post('/zones', { name }),
  updateZone: (id, name) => patch(`/zones/${id}`, { name }),
  deleteZone: (id) => del(`/zones/${id}`),

  // --- AI Waste Scanner (single item) ---
  analyzeWasteImage: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return post('/scanner/analyze', formData);
  },
  getScanHistory: () => get('/scanner/history'),
  getWasteCategories: () => get('/scanner/categories'),

  // --- Incidents (area reports + responder dispatch) ---
  reportIncident: ({ zone, citizenNote, image }) => {
    const formData = new FormData();
    formData.append('zone', zone);
    if (citizenNote) formData.append('citizenNote', citizenNote);
    formData.append('image', image);
    return post('/incidents', formData);
  },
  getIncidents: (params = {}) => get(`/incidents${qs(params)}`),
  getOpenIncidents: () => get('/incidents/open'),
  getIncidentById: (id) => get(`/incidents/${id}`),
  respondToIncident: (id) => post(`/incidents/${id}/respond`, {}),
  updateIncidentStatus: (id, status, resolutionNote) => patch(`/incidents/${id}/status`, { status, resolutionNote }),

  // --- Predictions ---
  getPredictions: () => get('/predictions'),

  // --- Teams (admin) ---
  getTeams: () => get('/teams'),

  // --- Dashboard ---
  getDashboardStats: () => get('/dashboard/stats'),
  getDashboardCharts: () => get('/dashboard/charts'),
  getAiInsights: () => get('/dashboard/insights'),
  getMyStats: () => get('/dashboard/my-stats'),

  // --- AI Database Assistant ---
  askAssistant: (question) => post('/assistant/ask', { question }),
};
