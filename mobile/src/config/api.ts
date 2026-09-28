import { Platform } from 'react-native';

/**
 * Resolves the API base URL dynamically based on environment and runtime platform:
 * - If EXPO_PUBLIC_API_URL is configured (e.g., LAN IP for physical device), use it.
 * - On Android emulator, localhost on the host machine is routed via 10.0.2.2.
 * - On iOS simulator / Web, localhost is routed via 127.0.0.1.
 */
function resolveApiBaseUrl(): string {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL.replace(/\/+$/, '');
  }

  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8000/api/v1';
  }

  return 'http://localhost:8000/api/v1';
}

export const API_BASE_URL = resolveApiBaseUrl();
