import axios, { type AxiosRequestConfig } from 'axios';

const BASE_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
export const AUTH_TOKEN_KEY = 'calwill_fiorella_access_token';
const LOGIN_ROUTE = '/iniciar_sesion';

type ApiRequestOptions = Omit<AxiosRequestConfig, 'baseURL' | 'data' | 'url'> & {
  body?: unknown;
  credentials?: RequestCredentials;
};

const apiClient = axios.create({
  baseURL: BASE_API_URL,
  withCredentials: true,
});

export const getStoredToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(AUTH_TOKEN_KEY);
};

export const setStoredToken = (token: string | null): void => {
  if (typeof window === 'undefined') return;
  if (token) localStorage.setItem(AUTH_TOKEN_KEY, token);
  else localStorage.removeItem(AUTH_TOKEN_KEY);
};

const handleUnauthorized = (): void => {
  setStoredToken(null);
  if (typeof window !== 'undefined') {
    window.location.href = LOGIN_ROUTE;
  }
};

apiClient.interceptors.request.use((config) => {
  const token = getStoredToken();

  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }

  return config;
});

apiClient.interceptors.response.use(undefined, (error: unknown) => {
  if (axios.isAxiosError(error) && error.response?.status === 401) {
    handleUnauthorized();
  }

  return Promise.reject(error);
});

const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const responseData: unknown = error.response?.data;

    if (typeof responseData === 'string' && responseData.trim()) {
      return responseData;
    }

    if (typeof responseData === 'object' && responseData !== null) {
      const errorResponse = responseData as { message?: unknown; error?: unknown };
      if (typeof errorResponse.message === 'string' && errorResponse.message.trim()) {
        return errorResponse.message;
      }
      if (typeof errorResponse.error === 'string' && errorResponse.error.trim()) {
        return errorResponse.error;
      }
    }

    if (error.response?.status === 401) {
      return 'Sesión expirada. Iniciá sesión de nuevo.';
    }

    return error.message || 'Error en la petición de la API';
  }

  return error instanceof Error ? error.message : 'Error en la petición de la API';
};

export const apiRequest = async <T = unknown>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> => {
  const { body, credentials, ...requestOptions } = options;

  try {
    const response = await apiClient.request<T>({
      ...requestOptions,
      url: path.startsWith('/') ? path : `/${path}`,
      data: body,
      withCredentials: credentials !== 'omit',
    });

    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export default {
  apiRequest,
  getStoredToken,
  setStoredToken,
};
