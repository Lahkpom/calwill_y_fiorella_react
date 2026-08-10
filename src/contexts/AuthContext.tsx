import type { ReactNode } from 'react';
import { createContext, useState, useEffect } from 'react';
import type { AuthResponse, AuthState, LoginCredentials, User } from '../types/auth';
import { apiRequest, getStoredToken, setStoredToken } from '../services/api';

interface AuthContextValue extends AuthState {
  profile: Record<string, unknown> | null;
  role: string | null;
  isAdmin: boolean;
  isCustomer: boolean;
  isWholesaler: boolean;
  isSuperAdmin: boolean;
  login: (credentials: LoginCredentials) => Promise<{ data: AuthResponse | null; error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ data: AuthResponse | null; error: Error | null }>;
  logout: () => void;
  signOut: () => void;
  signUp: (email: string, password: string, metadata?: Record<string, unknown>) => Promise<{ data: unknown | null; error: Error | null }>;
  signInWithGoogle: () => Promise<{ data: unknown | null; error: Error | null }>;
  updateProfile: (updates: Record<string, unknown>) => Promise<{ data: unknown | null; error: Error | null }>;
}

const initialAuthState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
};

const AuthContext = createContext<AuthContextValue | null>(null);

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>(initialAuthState);
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
  const [role, setRole] = useState<string | null>(null);

  const clearSession = () => {
    setAuthState({ ...initialAuthState, isLoading: false });
    setProfile(null);
    setRole(null);
    setStoredToken(null);
  };

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const response = await apiRequest<AuthResponse>('/auth/me');
        setAuthState({
          user: response.user,
          token: getStoredToken(),
          isAuthenticated: true,
          isLoading: false,
        });
        setProfile(response.user as Record<string, unknown>);
        setRole((response.user as User).rol ?? null);
      } catch (error) {
        console.error('Error validating session:', error);
        clearSession();
      }
    };

    const token = getStoredToken();
    if (token) {
      restoreSession();
    } else {
      setAuthState({ ...initialAuthState, isLoading: false });
    }
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      const data = await apiRequest<AuthResponse>('/auth/login', {
        method: 'POST',
        body: credentials,
      });

      setStoredToken(data.token);
      setAuthState({
        user: data.user,
        token: data.token,
        isAuthenticated: true,
        isLoading: false,
      });
      setProfile(data.user as Record<string, unknown>);
      setRole(data.user.rol ?? null);

      return { data, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error : new Error('Error de autenticación') };
    }
  };

  const logout = () => {
    clearSession();
    if (typeof window !== 'undefined') {
      window.location.href = '/iniciar_sesion';
    }
  };

  const signUp = async (email: string, password: string, metadata: Record<string, unknown> = {}) => {
    try {
      const data = await apiRequest('/auth/signup', {
        method: 'POST',
        body: { email, password, metadata },
      });
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error : new Error('Error en registro') };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const data = await apiRequest('/auth/oauth/google', {
        method: 'GET',
      });
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error : new Error('Error OAuth') };
    }
  };

  const updateProfile = async (updates: Record<string, unknown>) => {
    if (!authState.user) {
      return { data: null, error: new Error('No hay usuario autenticado') };
    }

    try {
      const data = await apiRequest(`/users/${encodeURIComponent(authState.user.id)}/profile`, {
        method: 'PATCH',
        body: updates,
      });
      setProfile(data as Record<string, unknown>);
      setRole((data as { roles?: { name?: string } }).roles?.name ?? null);
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error : new Error('Error actualizando perfil') };
    }
  };

  const isAdmin = ['admin', 'superadmin'].includes(role ?? '');
  const isCustomer = role === 'customer';
  const isWholesaler = role === 'wholesaler';
  const isSuperAdmin = role === 'superadmin';

  const signIn = login;
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
    isSuperAdmin,
    login,
    signIn,
    signOut,
    logout,
    signUp,
    signInWithGoogle,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export { AuthContext, AuthProvider };
