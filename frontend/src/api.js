import axios from 'axios';

const API = axios.create({
  baseURL: '/api', // instead of 'http://localhost:3001/api'
  withCredentials: true, // Include cookies for CSRF
});

// Add token to requests automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  /*
  Migrar de localStorage para cookies com flag HttpOnly e Secure, usando Set-Cookie no login.
  */
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('Authorization header set:', config.headers.Authorization.substring(0, 30) + '...');
  }
  return config;
});

// Handle token expiration
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.reload(); // adicionar aviso de login com sucesso!
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const login = (credentials) => API.post('/auth/login', credentials);
export const register = (userData) => API.post('/auth/register', userData);

// User management API calls (admin only)
export const fetchUsers = () => API.get('/auth/users');
export const deleteUser = (id) => API.delete(`/auth/users/${id}`);
export const updateUserRole = (id, role) => API.put(`/auth/users/${id}/role`, { role });

// Complaints API calls
export const fetchComplaints = () => API.get('/complaints');
export const postComplaint = (data) => API.post('/complaints', data);
export const deleteComplaint = (id) => API.delete(`/complaints/${id}`);
