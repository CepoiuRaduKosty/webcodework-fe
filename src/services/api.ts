import axios from 'axios';
import { AuthResponse } from '../types/auth.ts'; // We'll create this type soon

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000', // Fallback URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// Axios interceptor to add JWT token to requests
api.interceptors.request.use(
  (config) => {
    const tokenDataString = localStorage.getItem('authTokenData');
    if (tokenDataString) {
      const tokenData: AuthResponse = JSON.parse(tokenDataString); // Assuming AuthResponse has the token
      // Optional: Check token expiration here before sending
      if (tokenData.token && new Date(tokenData.expiration) > new Date()) {
         config.headers.Authorization = `Bearer ${tokenData.token}`;
      } else {
        // Token expired or invalid, potentially clear storage and logout
        localStorage.removeItem('authTokenData');
        // Optionally redirect to login here or let AuthContext handle it
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;