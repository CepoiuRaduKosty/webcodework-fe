

export interface RegisterPayload {
  username: string;
  password?: string; 
}

export interface LoginPayload {
  username: string;
  password?: string;
}


export interface AuthResponse {
  token: string;
  username: string;
  expiration: string; 
  profilePhotoUrl?: string | null;
  id: number;
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
    createdAt: string; 
}
