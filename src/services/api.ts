const BASE_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
export const AUTH_TOKEN_KEY = 'calwill_fiorella_access_token';
const LOGIN_ROUTE = '/iniciar_sesion';

const getStoredToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(AUTH_TOKEN_KEY);
};

export const setStoredToken = (token: string | null): void => {
  if (typeof window === 'undefined') return;
  if (token) localStorage.setItem(AUTH_TOKEN_KEY, token);
  else localStorage.removeItem(AUTH_TOKEN_KEY);
};

const buildUrl = (path: string): string => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${BASE_API_URL}${normalizedPath}`;
};

const parseJsonResponse = async (response: Response): Promise<unknown> => {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

const handleUnauthorized = (): void => {
  setStoredToken(null);
  if (typeof window !== 'undefined') {
    window.location.href = LOGIN_ROUTE;
  }
};

export const apiRequest = async <T = unknown>(path: string, options: RequestInit = {}): Promise<T> => {
  const token = getStoredToken();
  const headers = new Headers(options.headers ?? {});

  if (options.body && typeof options.body !== 'string') {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(buildUrl(path), {
    credentials: 'include',
    ...options,
    headers,
    body: options.body && typeof options.body !== 'string' ? JSON.stringify(options.body) : options.body,
  });

  const data = await parseJsonResponse(response);

  if (response.status === 401) {
    handleUnauthorized();
    const message = typeof data === 'object' && data !== null ? (data as any).message ?? (data as any).error : String(data);
    throw new Error(message || 'Sesión expirada. Iniciá sesión de nuevo.');
  }

  if (!response.ok) {
    const message = typeof data === 'object' && data !== null ? (data as any).message ?? (data as any).error : String(data);
    throw new Error(message || response.statusText || 'Error en la petición de la API');
  }

  return data as T;
};

export default {
  apiRequest,
  getStoredToken,
  setStoredToken,
};
