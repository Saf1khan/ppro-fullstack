import { API_BASE_URL } from '../config/api';
import {
  AuthMessageResponse,
  LoginRequest,
  RegisterRequest,
  ResendOtpRequest,
  TokenResponse,
  UserResponse,
  VerifyEmailRequest,
  ApiErrorResponse,
} from '../types/auth';
import { tokenStorage } from './storage';

export class ApiError extends Error {
  status: number;
  data?: ApiErrorResponse;

  constructor(status: number, message: string, data?: ApiErrorResponse) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Extracts a human-friendly error string from FastAPI error responses.
 */
export function formatApiErrorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    if (typeof err.data?.detail === 'string') {
      return err.data.detail;
    }
    if (Array.isArray(err.data?.detail) && err.data.detail.length > 0) {
      // Pydantic validation error array
      const first = err.data.detail[0];
      return first.msg ? first.msg.replace(/^Value error, /i, '') : 'Invalid form input.';
    }
    if (err.data?.message) {
      return err.data.message;
    }
    return err.message;
  }
  if (err instanceof Error) {
    if (err.message.includes('Network request failed')) {
      return 'Unable to connect to the backend server. Please verify your connection or backend address.';
    }
    return err.message;
  }
  return 'An unexpected error occurred. Please try again.';
}

/**
 * Core HTTP request handler.
 */
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${cleanEndpoint}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(options.headers as Record<string, string>),
  };

  const token = await tokenStorage.getAccessToken();
  if (token && !headers.Authorization) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (netErr: unknown) {
    const errorMsg =
      netErr instanceof Error && netErr.message.includes('Network request failed')
        ? `Cannot reach backend at ${API_BASE_URL}. Ensure server is running and accessible.`
        : 'Network request failed. Please check your connection.';
    throw new ApiError(0, errorMsg);
  }

  if (!response.ok) {
    let errorData: ApiErrorResponse | undefined;
    try {
      errorData = (await response.json()) as ApiErrorResponse;
    } catch {
      // Non-JSON error payload
    }

    let message = `Request failed with status ${response.status}`;
    if (typeof errorData?.detail === 'string') {
      message = errorData.detail;
    } else if (Array.isArray(errorData?.detail) && errorData.detail.length > 0) {
      const firstMsg = errorData.detail[0].msg;
      message = firstMsg ? firstMsg.replace(/^Value error, /i, '') : 'Validation failed';
    } else if (errorData?.message) {
      message = errorData.message;
    }

    throw new ApiError(response.status, message, errorData);
  }

  return response.json() as Promise<T>;
}

export const api = {
  get: <T>(endpoint: string, options?: RequestInit) =>
    request<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, body?: unknown, options?: RequestInit) =>
    request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),

  put: <T>(endpoint: string, body?: unknown, options?: RequestInit) =>
    request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(endpoint: string, options?: RequestInit) =>
    request<T>(endpoint, { ...options, method: 'DELETE' }),

  checkHealth: async () => {
    return request<{ status: string; environment: string; version: string; database?: string }>(
      '/health'
    );
  },
};

/**
 * Authentication API Service
 */
export const authApi = {
  register: (data: RegisterRequest): Promise<UserResponse> => {
    return api.post<UserResponse>('/auth/register', data);
  },

  verifyEmail: (data: VerifyEmailRequest): Promise<AuthMessageResponse> => {
    return api.post<AuthMessageResponse>('/auth/verify-email', data);
  },

  resendOtp: (data: ResendOtpRequest): Promise<AuthMessageResponse> => {
    return api.post<AuthMessageResponse>('/auth/resend-otp', data);
  },

  login: (data: LoginRequest): Promise<TokenResponse> => {
    return api.post<TokenResponse>('/auth/login', data);
  },

  getMe: (): Promise<UserResponse> => {
    return api.get<UserResponse>('/auth/me');
  },
};

/**
 * Profile API Service (Phase 4)
 */
import { CreateProfilePayload, UpdateProfilePayload, UserProfile } from '../types/profile';

export const profileApi = {
  getMyProfile: (): Promise<UserProfile> => {
    return api.get<UserProfile>('/profile/me');
  },

  createProfile: (data: CreateProfilePayload): Promise<UserProfile> => {
    return api.post<UserProfile>('/profile', data);
  },

  updateProfile: (data: UpdateProfilePayload): Promise<UserProfile> => {
    return api.put<UserProfile>('/profile', data);
  },
};

