import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:3001/api',
});

// Add token to requests automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API calls
export const login = (credentials) => API.post('/auth/login', credentials);
export const register = (userData) => API.post('/auth/register', userData);

// Complaints API calls
export const fetchComplaints = () => API.get('/complaints');
export const postComplaint = (data) => API.post('/complaints', data);
export const deleteComplaint = (id) => API.delete(`/complaints/${id}`);

// User management API calls (admin only)
export const fetchUsers = () => API.get('/auth/users');
export const deleteUser = (id) => API.delete(`/auth/users/${id}`);
export const updateUserRole = (id, role) => API.put(`/auth/users/${id}/role`, { role });
