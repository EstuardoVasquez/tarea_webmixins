import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api/',
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const getTasks = (params = {}) => API.get('tasks/', { params });

export const createTask = (task) => API.post('tasks/', task);

export const deleteTask = (id) => API.delete(`tasks/${id}/`);

export default API;
