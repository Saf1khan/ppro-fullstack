export interface RegisterRequest {
  email: string;
  password: string;
  confirm_password: string;
}

export interface VerifyEmailRequest {
  email: string;
  otp: string;
}

export interface ResendOtpRequest {
  email: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface UserResponse {
  id: string;
  email: string;
  is_email_verified: boolean;
  created_at: string;
}

export interface AuthMessageResponse {
  message: string;
  email?: string;
  is_verified?: boolean;
}

export interface ApiErrorDetail {
  loc?: (string | number)[];
  msg?: string;
  type?: string;
  ctx?: Record<string, unknown>;
}

export interface ApiErrorResponse {
  detail?: string | ApiErrorDetail[];
  message?: string;
}
