export type UserRole = 'ADMIN' | 'OPERATOR' | 'WHOLESALER' | 'CUSTOMER';

export type TaxIdType = 'DNI' | 'CUIL' | 'CUIT' | 'PASAPORTE';

export interface UserResponse {
  userId: string;
  userRole: UserRole;
  userName: string;
  userEmail: string;
  userPhone: string | null;
  companyName: string | null;
  taxIdType: TaxIdType | null;
  taxIdNumber: string | null;
  lastLoginAt: string | null;
  passwordExpiresAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
  taxIdType?: TaxIdType;
  taxIdNumber?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresAt: string;
  user: UserResponse;
}

export interface AuthState {
  user: UserResponse | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
