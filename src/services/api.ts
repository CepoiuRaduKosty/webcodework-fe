import axios from 'axios';
import { AuthResponse } from '../types/auth.ts'; 

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000', 
  headers: {
    'Content-Type': 'application/json',
  },
});


api.interceptors.request.use(
  (config) => {
    const tokenDataString = localStorage.getItem('authTokenData');
    if (tokenDataString) {
      const tokenData: AuthResponse = JSON.parse(tokenDataString); 
      
      if (tokenData.token && new Date(tokenData.expiration) > new Date()) {
         config.headers.Authorization = `Bearer ${tokenData.token}`;
      } else {
        
        localStorage.removeItem('authTokenData');
        
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;