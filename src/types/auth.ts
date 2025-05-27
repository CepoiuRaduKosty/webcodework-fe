// src/types/auth.ts

export interface RegisterPayload {
  username: string;
  password?: string; // Make password optional here if you handle confirmation separately
}

export interface LoginPayload {
  username: string;
  password?: string;
}

// Matches the DTO returned from the backend login endpoint
export interface AuthResponse {
  token: string;
  username: string;
  expiration: string; 
  profilePhotoUrl?: string | null;
  id?: number;
}

export interface User {
  id?: number;
  username: string;
  profilePhotoUrl?: string | null;
}

export interface UserProfileDto {
    id: number;
    username: string;
    profilePhotoUrl?: string | null;
    createdAt: string; // ISO Date string
}
