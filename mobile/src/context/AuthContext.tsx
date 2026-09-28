import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { authApi } from '../services/api';
import { tokenStorage } from '../services/storage';
import { UserResponse } from '../types/auth';

export type AuthStatus = 'initializing' | 'unauthenticated' | 'authenticated';

export interface AuthContextValue {
  status: AuthStatus;
  user: UserResponse | null;
  token: string | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [status, setStatus] = useState<AuthStatus>('initializing');
  const [user, setUser] = useState<UserResponse | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Initialize session from SecureStore on startup
  useEffect(() => {
    let isCancelled = false;

    async function restoreSession() {
      try {
        const storedToken = await tokenStorage.getAccessToken();
        if (!storedToken) {
          if (!isCancelled) {
            setStatus('unauthenticated');
          }
          return;
        }

        // Validate token against backend /me
        try {
          const profile = await authApi.getMe();
          if (!isCancelled) {
            setUser(profile);
            setToken(storedToken);
            setStatus('authenticated');
          }
        } catch {
          // Token is expired, invalid, or user was deleted
          await tokenStorage.clearTokens();
          if (!isCancelled) {
            setUser(null);
            setToken(null);
            setStatus('unauthenticated');
          }
        }
      } catch {
        if (!isCancelled) {
          setStatus('unauthenticated');
        }
      }
    }

    restoreSession();

    return () => {
      isCancelled = true;
    };
  }, []);

  const login = useCallback(async (newToken: string) => {
    await tokenStorage.setAccessToken(newToken);
    setToken(newToken);
    try {
      const profile = await authApi.getMe();
      setUser(profile);
    } catch {
      // Profile fetch fallback
      setUser(null);
    }
    setStatus('authenticated');
  }, []);

  const logout = useCallback(async () => {
    await tokenStorage.clearTokens();
    setUser(null);
    setToken(null);
    setStatus('unauthenticated');
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const profile = await authApi.getMe();
      setUser(profile);
    } catch (err) {
      console.warn('Failed to refresh user profile', err);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      token,
      isAuthenticated: status === 'authenticated',
      isInitializing: status === 'initializing',
      login,
      logout,
      refreshUser,
    }),
    [status, user, token, login, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
