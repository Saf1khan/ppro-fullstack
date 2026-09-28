import * as SecureStore from 'expo-secure-store';

const ACCESS_TOKEN_KEY = 'padosipro_access_token';
const REFRESH_TOKEN_KEY = 'padosipro_refresh_token';

/**
 * Hardware-backed secure storage for sensitive authentication tokens.
 * Falls back safely if running in unsupported environments (e.g., SSR or web).
 */
export const tokenStorage = {
  async getAccessToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
    } catch {
      return null;
    }
  },

  async setAccessToken(token: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);
    } catch (err) {
      console.error('Failed to persist access token in SecureStore', err);
    }
  },

  async getRefreshToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    } catch {
      return null;
    }
  },

  async setRefreshToken(token: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
    } catch (err) {
      console.error('Failed to persist refresh token in SecureStore', err);
    }
  },

  async clearTokens(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    } catch (err) {
      console.error('Failed to delete tokens from SecureStore', err);
    }
  },
};
