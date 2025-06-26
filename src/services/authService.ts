
import api from './api';
import { LoginPayload, RegisterPayload, AuthResponse } from '../types/auth.ts'; 

const API_BASE_AUTH = `${import.meta.env.VITE_API_BASE_AUTH}`

export const loginUser = async (credentials: LoginPayload): Promise<AuthResponse> => {
  try {
    const response = await api.post<AuthResponse>(`${API_BASE_AUTH}/login`, credentials);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || new Error('Login failed');
  }
};

export const registerUser = async (userData: RegisterPayload): Promise<{ message: string }> => {
  try {
    const response = await api.post<{ message: string }>(`${API_BASE_AUTH}/register`, userData);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || new Error('Registration failed');
  }
};