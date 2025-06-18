import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:3001/api',
});

export const fetchComplaints = () => API.get('/complaints');
export const postComplaint = (data) => API.post('/complaints', data);
