import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { AuthState, AuthUser, LoginRequest, LoginResponseData } from '../types/auth';
import { api, setTokens, clearTokens, getRefreshToken } from '../lib/api';
import { Role } from '../lib/enums';
import type { ApiResponse } from '../lib/api';

interface AuthContextType extends AuthState {
  login: (credentials: LoginRequest) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  redirectToPortal: (role: Role) => string;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Check for existing session on mount
  useEffect(() => {
    const storedUser = sessionStorage.getItem('edubrain_user');
    const storedToken = sessionStorage.getItem('edubrain_access');
    const storedRefresh = sessionStorage.getItem('edubrain_refresh');
    const storedExpiry = sessionStorage.getItem('edubrain_expiry');

    if (storedUser && storedToken && storedRefresh && storedExpiry) {
      const user = JSON.parse(storedUser) as AuthUser;
      const expiresIn = Math.max(0, (parseInt(storedExpiry, 10) - Date.now()) / 1000);
      setTokens(storedToken, storedRefresh, expiresIn);
      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
    } else {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, []);

  // Listen for auth logout events
  useEffect(() => {
    const handleLogout = () => {
      clearTokens();
      sessionStorage.removeItem('edubrain_user');
      sessionStorage.removeItem('edubrain_access');
      sessionStorage.removeItem('edubrain_refresh');
      sessionStorage.removeItem('edubrain_expiry');
      setState({ user: null, isAuthenticated: false, isLoading: false });
    };

    window.addEventListener('auth:logout', handleLogout);
    return () => window.removeEventListener('auth:logout', handleLogout);
  }, []);

  const login = useCallback(async (credentials: LoginRequest): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await api.post<ApiResponse<LoginResponseData>>('/auth/login', credentials);
      const result = response.data;

      if (result.isSuccess && result.hasData && result.data) {
        const data = result.data;
        const user: AuthUser = {
          id: data.id,
          email: data.email,
          name: data.name,
          role: data.role,
        };

        setTokens(data.token, data.refreshToken, data.expiresIn);

        // Store in sessionStorage for page reloads
        sessionStorage.setItem('edubrain_user', JSON.stringify(user));
        sessionStorage.setItem('edubrain_access', data.token);
        sessionStorage.setItem('edubrain_refresh', data.refreshToken);
        sessionStorage.setItem('edubrain_expiry', String(Date.now() + data.expiresIn * 1000));

        setState({
          user,
          isAuthenticated: true,
          isLoading: false,
        });

        return { success: true };
      }

      return {
        success: false,
        error: result.error?.description || 'Login failed. Please check your credentials.',
      };
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: ApiResponse<unknown> } };
      const desc = axiosErr.response?.data?.error?.description;
      return { success: false, error: desc || 'Network error. Please try again.' };
    }
  }, []);

  const logout = useCallback(async () => {
    const refresh = getRefreshToken();
    if (refresh) {
      try {
        await api.post('/auth/revoke-refresh-token', { refreshToken: refresh });
      } catch {
        // Best effort — continue with local cleanup
      }
    }
    clearTokens();
    sessionStorage.removeItem('edubrain_user');
    sessionStorage.removeItem('edubrain_access');
    sessionStorage.removeItem('edubrain_refresh');
    sessionStorage.removeItem('edubrain_expiry');
    setState({ user: null, isAuthenticated: false, isLoading: false });
  }, []);

  const redirectToPortal = useCallback((role: Role): string => {
    switch (role) {
      case Role.Admin:
        return '/admin/dashboard';
      case Role.Student:
        return '/student/dashboard';
      case Role.Doctor:
        return '/doctor/dashboard';
      case Role.AcademicAdvisor:
        return '/advisor/dashboard';
      default:
        return '/';
    }
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout, redirectToPortal }}>
      {children}
    </AuthContext.Provider>
  );
}