import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * Resolves the API base URL dynamically based on environment and runtime platform:
 * - If EXPO_PUBLIC_API_URL is configured, use it.
 * - If running on a physical device via Expo Go, dynamically extracts the PC's host IP (e.g. 192.168.x.x).
 * - On Android emulator, localhost on the host machine is routed via 10.0.2.2.
 * - On iOS simulator / Web, localhost is routed via 127.0.0.1.
 */
function resolveApiBaseUrl(): string {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL.replace(/\/+$/, '');
  }

  // Automatic host detection for physical phones connected via Expo Go
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const hostIp = hostUri.split(':')[0];
    if (hostIp && hostIp !== 'localhost' && hostIp !== '127.0.0.1') {
      return `http://${hostIp}:8000/api/v1`;
    }
  }

  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8000/api/v1';
  }

  return 'http://localhost:8000/api/v1';
}

export const API_BASE_URL = resolveApiBaseUrl();
