import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: `${API_BASE}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (data: any) => api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
};

// Restaurants
export const restaurantAPI = {
  list: (city = 'Mumbai') => api.get(`/restaurants?city=${city}`),
  get: (id: number) => api.get(`/restaurants/${id}`),
};

// NGOs
export const ngoAPI = {
  list: (city = 'Mumbai') => api.get(`/ngos?city=${city}`),
};

// Drivers
export const driverAPI = {
  list: (city = 'Mumbai', availableOnly = false) =>
    api.get(`/drivers?city=${city}&available_only=${availableOnly}`),
};

// Surplus Requests
export const surplusAPI = {
  create: (data: any) => api.post('/surplus', data),
  list: (status?: string, limit = 50) =>
    api.get(`/surplus?limit=${limit}${status ? `&status=${status}` : ''}`),
  get: (id: number) => api.get(`/surplus/${id}`),
  updateStatus: (id: number, status: string) =>
    api.patch(`/surplus/${id}/status?new_status=${status}`),
};

// ML
export const mlAPI = {
  predictSurplus: (data: any) => api.post('/ml/predict-surplus', data),
  optimizeRoute: (data: any) => api.post('/ml/optimize-route', data),
  classifyFood: (description: string) =>
    api.post('/ml/classify-food', { description }),
};

// Impact
export const impactAPI = {
  dashboard: () => api.get('/impact/dashboard'),
  history: (days = 30) => api.get(`/impact/history?days=${days}`),
  leaderboard: (entity = 'restaurant', limit = 5) =>
    api.get(`/impact/leaderboard?entity=${entity}&limit=${limit}`),
};

// Tracking
export const trackingAPI = {
  activeJobs: () => api.get('/tracking/active-jobs'),
  allLocations: () => api.get('/tracking/all-locations'),
};

export default api;
