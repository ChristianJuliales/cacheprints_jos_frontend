import { create } from 'zustand';
import apiClient from '../utils/apiClient';

export const useAuthStore = create((set, get) => ({
  user:            null,
  userRole:        null,
  isAuthenticated: false,
  isLoading:       true,

  // ── Bootstrap ─────────────────────────────────────────────────────────────
  init: async () => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      try {
        set({ 
          user: JSON.parse(savedUser), 
          isAuthenticated: true, 
          userRole: JSON.parse(savedUser).role?.toLowerCase(),
          isLoading: false 
        });
      } catch (e) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({ isLoading: false });
      }
    } else {
      set({ isLoading: false });
    }
  },

  // ── Register ──────────────────────────────────────────────────────────────
  register: async (email, password, name) => {
    try {
      set({ isLoading: true });
      const response = await apiClient.post('/jos/auth/register', { email, password, name });
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      set({
        user,
        userRole:        user.role?.toLowerCase(),
        isAuthenticated: true,
        isLoading:       false,
      });
      return user;
    } catch (error) {
      set({ isLoading: false });
      throw error.response?.data?.error || error.message;
    }
  },

  // ── Login ─────────────────────────────────────────────────────────────────
  login: async (email, password) => {
    try {
      set({ isLoading: true });
      const response = await apiClient.post('/jos/auth/login', { email, password });
      const { token, user } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      set({
        user,
        userRole:        user.role?.toLowerCase(),
        isAuthenticated: true,
        isLoading:       false,
      });

      return user;
    } catch (error) {
      set({ isLoading: false });
      throw error.response?.data?.error || error.message;
    }
  },

  // ── Forgot password ───────────────────────────────────────────────────────
  forgotPassword: async (email) => {
    // Implement with your MongoDB backend API
    try {
      const response = await apiClient.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || error.message;
    }
  },

  // ── Logout ────────────────────────────────────────────────────────────────
  logout: async () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, userRole: null, isAuthenticated: false, isLoading: false });
  },
}));