import axios from 'axios';
import { AuthResponse, User, Room, Message, Call } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3082/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  register: (data: {
    username: string;
    email: string;
    password: string;
    publicKey?: string;
  }) => api.post<AuthResponse>('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    api.post<AuthResponse>('/auth/login', data),
};

export const userApi = {
  getProfile: () => api.get<User>('/users/profile'),
  
  updateProfile: (data: {
    username?: string;
    avatar?: string;
    publicKey?: string;
  }) => api.put<User>('/users/profile', data),

  searchUsers: (query: string) =>
    api.get<User[]>(`/users/search?q=${encodeURIComponent(query)}`),
};

export const roomApi = {
  createRoom: (data: {
    name: string;
    description?: string;
    isPrivate?: boolean;
  }) => api.post<Room>('/rooms', data),

  getRooms: () => api.get<Room[]>('/rooms'),

  joinRoom: (roomId: string) => api.post<Room>(`/rooms/${roomId}/join`),

  getMessages: (roomId: string, page = 1, limit = 50) =>
    api.get<Message[]>(`/rooms/${roomId}/messages?page=${page}&limit=${limit}`),
};

export const callApi = {
  getCallHistory: () => api.get<Call[]>('/calls/history'),
};

export default api;