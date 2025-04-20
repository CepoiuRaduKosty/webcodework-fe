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
    expiration: string; // Store as ISO string from backend
  }
  
  // Represents the user state stored in context
  export interface User {
      username: string;
      // Add other user details if needed, fetched separately or included in token claims
  }