
import api from './api';
import { LoginPayload, RegisterPayload, AuthResponse } from '../types/auth.ts'; 

export const loginUser = async (credentials: LoginPayload): Promise<AuthResponse> => {
  try {
    const response = await api.post<AuthResponse>('/api/auth/login', credentials);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || new Error('Login failed');
  }
};

export const registerUser = async (userData: RegisterPayload): Promise<{ message: string }> => {
  try {
    const response = await api.post<{ message: string }>('/api/auth/register', userData);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || new Error('Registration failed');
  }
};