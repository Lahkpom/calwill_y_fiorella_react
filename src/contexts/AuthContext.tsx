import type { ReactNode } from 'react';
import { createContext, useEffect, useState } from 'react';
import type {
  AuthResponse,
  AuthState,
  LoginCredentials,
  RegisterRequest,
  UserResponse,
  UserRole,
} from '../types/auth';
import {
  apiRequest,
  clearStoredTokens,
  getStoredRefreshToken,
  getStoredToken,
  setStoredRefreshToken,
  setStoredToken,
} from '../services/api';

type AuthResult<T> = { data: T | null; error: Error | null };
type ProfileUpdates = Partial<Pick<UserResponse, 'userName' | 'userPhone' | 'taxIdType' | 'taxIdNumber'>>;

interface AuthContextValue extends AuthState {
  profile: UserResponse | null;
  role: UserRole | null;
  isAdmin: boolean;
  isCustomer: boolean;
  isWholesaler: boolean;
  login: (credentials: LoginCredentials) => Promise<AuthResult<AuthResponse>>;
  signIn: (email: string, password: string) => Promise<AuthResult<AuthResponse>>;
  logout: () => Promise<void>;
  signOut: () => Promise<void>;
  register: (request: RegisterRequest) => Promise<AuthResult<UserResponse>>;
  updateProfile: (updates: ProfileUpdates) => Promise<AuthResult<UserResponse>>;
}

const initialAuthState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
};

const AuthContext = createContext<AuthContextValue | null>(null);

const getError = (error: unknown, fallback: string): Error =>
  error instanceof Error ? error : new Error(fallback);

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>(initialAuthState);
  const [profile, setProfile] = useState<UserResponse | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);

  const clearSession = () => {
    setAuthState({ ...initialAuthState, isLoading: false });
    setProfile(null);
    setRole(null);
    clearStoredTokens();
  };

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const user = await apiRequest<UserResponse>('/auth/me');
        setAuthState({
          user,
          token: getStoredToken(),
          isAuthenticated: true,
          isLoading: false,
        });
        setProfile(user);
        setRole(user.userRole);
      } catch (error) {
        console.error('Error validating session:', error);
        clearSession();
      }
    };

    if (getStoredToken()) {
      void restoreSession();
    } else {
      setAuthState({ ...initialAuthState, isLoading: false });
    }
  }, []);

  const login = async (credentials: LoginCredentials): Promise<AuthResult<AuthResponse>> => {
    try {
      const data = await apiRequest<AuthResponse>('/auth/login', {
        method: 'POST',
        body: credentials,
      });

      setStoredToken(data.accessToken);
      setStoredRefreshToken(data.refreshToken);
      setAuthState({
        user: data.user,
        token: data.accessToken,
        isAuthenticated: true,
        isLoading: false,
      });
      setProfile(data.user);
      setRole(data.user.userRole);

      return { data, error: null };
    } catch (error) {
      return { data: null, error: getError(error, 'Error de autenticación') };
    }
  };

  const signIn = (email: string, password: string) => login({ email, password });

  const logout = async (): Promise<void> => {
    const refreshToken = getStoredRefreshToken();
    try {
      if (refreshToken) {
        await apiRequest<void>('/auth/logout', {
          method: 'POST',
          body: { refreshToken },
        });
      }
    } finally {
      clearSession();
      if (typeof window !== 'undefined') {
        window.location.href = '/iniciar_sesion';
      }
    }
  };

  const register = async (request: RegisterRequest): Promise<AuthResult<UserResponse>> => {
    try {
      const data = await apiRequest<UserResponse>('/auth/register', {
        method: 'POST',
        body: request,
      });
      return { data, error: null };
    } catch (error) {
      return { data: null, error: getError(error, 'Error en registro') };
    }
  };

  const updateProfile = async (updates: ProfileUpdates): Promise<AuthResult<UserResponse>> => {
    if (!authState.user) {
      return { data: null, error: new Error('No hay usuario autenticado') };
    }

    try {
      const data = await apiRequest<UserResponse>(`/users/${encodeURIComponent(authState.user.userId)}`, {
        method: 'PUT',
        body: {
          name: updates.userName ?? authState.user.userName,
          phone: updates.userPhone ?? authState.user.userPhone,
          taxIdType: updates.taxIdType ?? authState.user.taxIdType,
          taxIdNumber: updates.taxIdNumber ?? authState.user.taxIdNumber,
        },
      });
      setAuthState((current) => ({ ...current, user: data }));
      setProfile(data);
      setRole(data.userRole);
      return { data, error: null };
    } catch (error) {
      return { data: null, error: getError(error, 'Error actualizando perfil') };
    }
  };

  const isAdmin = ['ADMIN', 'OPERATOR'].includes(role ?? '');
  const isCustomer = role === 'CUSTOMER';
  const isWholesaler = role === 'WHOLESALER';
  const signOut = logout;

  const value: AuthContextValue = {
    user: authState.user,
    token: authState.token,
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading,
    profile,
    role,
    isAdmin,
    isCustomer,
    isWholesaler,
    login,
    signIn,
    logout,
    signOut,
    register,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export { AuthContext, AuthProvider };
