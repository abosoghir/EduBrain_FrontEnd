import { Role } from '../lib/enums';

// The logged-in user stored in session
export interface AuthUser {
  id: number;
  email: string;
  name: string;
  role: Role;
}

// Auth slice of application state
export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Login request payload
export interface LoginRequest {
  email: string;
  password: string;
  role?: number;
}

// Shape of data.data from the login API response
export interface LoginResponseData {
  id: number;
  email: string;
  name: string;
  role: Role;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  code?: string;
  email: string;
  password: string;
  confirmPassword: string;
}
