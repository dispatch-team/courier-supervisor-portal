"use client";

import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import {
  type UserInfo,
  type TokenResponse,
  extractUserInfo,
  isTokenExpired,
  refreshAccessToken,
  logout as keycloakLogout,
  persistTokens,
  getStoredTokens,
  clearStoredTokens,
} from "@/lib/auth";

interface AuthState {
  user: UserInfo | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  setTokens: (tokens: TokenResponse) => void;
  logout: () => Promise<void>;
  getValidAccessToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: true,
  });

  const refreshTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleRefresh = useCallback((accessToken: string, refreshToken: string) => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }

    try {
      const payload = JSON.parse(atob(accessToken.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
      const exp = payload.exp as number;
      // Refresh 60s before expiry
      const refreshAt = (exp - 60) * 1000 - Date.now();

      if (refreshAt <= 0) return;

      refreshTimeoutRef.current = setTimeout(async () => {
        try {
          const tokens = await refreshAccessToken(refreshToken);
          persistTokens(tokens);
          const user = extractUserInfo(tokens.access_token);
          setState({
            user,
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            isAuthenticated: true,
            isLoading: false,
          });
          scheduleRefresh(tokens.access_token, tokens.refresh_token);
        } catch {
          clearStoredTokens();
          setState({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false, isLoading: false });
        }
      }, refreshAt);
    } catch {
      // Invalid token — don't schedule
    }
  }, []);

  // Initialize from stored tokens
  useEffect(() => {
    const { accessToken, refreshToken } = getStoredTokens();

    if (!accessToken || !refreshToken) {
      setState((s) => ({ ...s, isLoading: false }));
      return;
    }

    if (!isTokenExpired(accessToken)) {
      const user = extractUserInfo(accessToken);
      setState({ user, accessToken, refreshToken, isAuthenticated: true, isLoading: false });
      scheduleRefresh(accessToken, refreshToken);
      return;
    }

    // Access token expired — try refreshing
    refreshAccessToken(refreshToken)
      .then((tokens) => {
        persistTokens(tokens);
        const user = extractUserInfo(tokens.access_token);
        setState({ user, accessToken: tokens.access_token, refreshToken: tokens.refresh_token, isAuthenticated: true, isLoading: false });
        scheduleRefresh(tokens.access_token, tokens.refresh_token);
      })
      .catch(() => {
        clearStoredTokens();
        setState({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false, isLoading: false });
      });
  }, [scheduleRefresh]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) clearTimeout(refreshTimeoutRef.current);
    };
  }, []);

  const setTokens = useCallback(
    (tokens: TokenResponse) => {
      persistTokens(tokens);
      const user = extractUserInfo(tokens.access_token);
      setState({ user, accessToken: tokens.access_token, refreshToken: tokens.refresh_token, isAuthenticated: true, isLoading: false });
      scheduleRefresh(tokens.access_token, tokens.refresh_token);
    },
    [scheduleRefresh]
  );

  const logout = useCallback(async () => {
    if (refreshTimeoutRef.current) clearTimeout(refreshTimeoutRef.current);
    const { refreshToken } = getStoredTokens();
    if (refreshToken) {
      await keycloakLogout(refreshToken);
    }
    clearStoredTokens();
    setState({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false, isLoading: false });
  }, []);

  const getValidAccessToken = useCallback(async (): Promise<string | null> => {
    const { accessToken, refreshToken } = getStoredTokens();
    if (!accessToken || !refreshToken) return null;

    if (!isTokenExpired(accessToken)) return accessToken;

    try {
      const tokens = await refreshAccessToken(refreshToken);
      persistTokens(tokens);
      const user = extractUserInfo(tokens.access_token);
      setState({ user, accessToken: tokens.access_token, refreshToken: tokens.refresh_token, isAuthenticated: true, isLoading: false });
      scheduleRefresh(tokens.access_token, tokens.refresh_token);
      return tokens.access_token;
    } catch {
      clearStoredTokens();
      setState({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false, isLoading: false });
      return null;
    }
  }, [scheduleRefresh]);

  return (
    <AuthContext.Provider value={{ ...state, setTokens, logout, getValidAccessToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
