import { tokenStorage } from './storage';

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:8000/api/v1';

export interface ApiErrorPayload {
  detail?: string | { msg?: string }[];
  message?: string;
}

export class ApiError extends Error {
  status: number;
  data?: ApiErrorPayload;

  constructor(status: number, message: string, data?: ApiErrorPayload) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Base API client with token injection and error handling.
 */
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(options.headers as Record<string, string>),
  };

  const token = await tokenStorage.getAccessToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorData: ApiErrorPayload | undefined;
    try {
      errorData = await response.json();
    } catch {
      // Non-JSON error response
    }
    const message =
      (typeof errorData?.detail === 'string' && errorData.detail) ||
      errorData?.message ||
      `HTTP Error ${response.status}: ${response.statusText}`;

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

  /** Check API health */
  checkHealth: async () => {
    return request<{ status: string; environment: string; version: string }>(
      '/health'
    );
  },
};
