export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  lastSeenAt?: string;
}

export interface UpdateProfileRequest {
  name: string;
  email: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}
