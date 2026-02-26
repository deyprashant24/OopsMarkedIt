import axios from 'axios';

const API_URL = "https://oopsmarked-backend.onrender.com/api"; // Aapka updated port

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Cookies (JWT) send karne ke liye zaroori hai
});

export const authService = {
  register: (userData) => api.post('/auth/register', userData),
  login: (userData) => api.post('/auth/login', userData),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
};

export default api;