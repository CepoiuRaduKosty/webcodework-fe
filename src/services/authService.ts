// src/services/authService.ts
import api from './api';
import { LoginPayload, RegisterPayload, AuthResponse } from '../types/auth.ts'; // We'll create these types

export const loginUser = async (credentials: LoginPayload): Promise<AuthResponse> => {
  try {
    const response = await api.post<AuthResponse>('/api/auth/login', credentials);
    return response.data;
  } catch (error: any) {
    // Rethrow or handle specific axios errors
    throw error.response?.data || new Error('Login failed');
  }
};

export const registerUser = async (userData: RegisterPayload): Promise<{ message: string }> => {
  try {
     // Assuming the backend returns { message: "User registered successfully." } on 201 Created
    const response = await api.post<{ message: string }>('/api/auth/register', userData);
    return response.data;
  } catch (error: any) {
    // Rethrow with a more specific error message if possible
    throw error.response?.data || new Error('Registration failed');
  }
};