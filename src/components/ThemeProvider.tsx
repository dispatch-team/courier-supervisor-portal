"use client";

/**
 * components/ThemeProvider.tsx
 *
 * Wraps next-themes and adds a configurable color scheme context.
 *
 * USAGE:
 *   // 1. Already wired into src/app/layout.tsx -- nothing to do.
 *   // 2. In any client component:
 *   import { useThemeConfig } from "@/components/ThemeProvider";
 *   const { colorScheme, setColorScheme, mode, setMode } = useThemeConfig();
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import {
  COLOR_SCHEMES,
  DEFAULT_COLOR_SCHEME,
  DEFAULT_THEME_MODE,
  THEME_STORAGE_KEYS,
  type ColorSchemeKey,
  type ThemeMode,
} from "@/lib/theme";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ThemeConfigContextValue {
  colorScheme: ColorSchemeKey;
  setColorScheme: (scheme: ColorSchemeKey) => void;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
}

const ThemeConfigContext = createContext<ThemeConfigContextValue>({
  colorScheme: DEFAULT_COLOR_SCHEME,
  setColorScheme: () => {},
  mode: DEFAULT_THEME_MODE,
  setMode: () => {},
});

// ─── Provider ─────────────────────────────────────────────────────────────────

/**
 * ThemeConfigProvider
 * Must wrap the app (already done in layout.tsx).
 * Persists color scheme and mode to localStorage.
 * Applies color scheme as a CSS class on <html>.
 */
export function ThemeConfigProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [colorScheme, setColorSchemeState] =
    useState<ColorSchemeKey>(DEFAULT_COLOR_SCHEME);
  const [mode, setModeState] = useState<ThemeMode>(DEFAULT_THEME_MODE);

  // Hydrate from localStorage
  useEffect(() => {
    const storedScheme = localStorage.getItem(
      THEME_STORAGE_KEYS.colorScheme
    ) as ColorSchemeKey | null;
    if (storedScheme && storedScheme in COLOR_SCHEMES) {
      setColorSchemeState(storedScheme);
    }
    const storedMode = localStorage.getItem(
      THEME_STORAGE_KEYS.mode
    ) as ThemeMode | null;
    if (storedMode) setModeState(storedMode);
  }, []);

  // Apply color scheme CSS class to <html>
  useEffect(() => {
    const html = document.documentElement;
    // Remove all existing scheme classes
    Object.keys(COLOR_SCHEMES).forEach((k) =>
      html.classList.remove(`scheme-${k}`)
    );
    if (colorScheme !== DEFAULT_COLOR_SCHEME) {
      html.classList.add(`scheme-${colorScheme}`);
    }
  }, [colorScheme]);

  const setColorScheme = useCallback((scheme: ColorSchemeKey) => {
    localStorage.setItem(THEME_STORAGE_KEYS.colorScheme, scheme);
    setColorSchemeState(scheme);
  }, []);

  const setMode = useCallback((next: ThemeMode) => {
    localStorage.setItem(THEME_STORAGE_KEYS.mode, next);
    setModeState(next);
  }, []);

  return (
    <ThemeConfigContext.Provider
      value={{ colorScheme, setColorScheme, mode, setMode }}
    >
      <NextThemesProvider
        attribute="class"
        defaultTheme={DEFAULT_THEME_MODE}
        enableSystem
        disableTransitionOnChange={false}
      >
        {children}
      </NextThemesProvider>
    </ThemeConfigContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useThemeConfig(): ThemeConfigContextValue {
  return useContext(ThemeConfigContext);
}
