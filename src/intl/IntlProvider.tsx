"use client";

/**
 * intl/IntlProvider.tsx
 *
 * Lightweight i18n context for Dispatch.
 * Uses next-intl under the hood to power translation lookups.
 *
 * USAGE in any client component:
 *   const t = useI18n("login");
 *   t("emailLabel"); // -> "Email" or "ኢሜይል" depending on locale
 *
 * To change locale programmatically:
 *   const { setLocale } = useLocale();
 *   setLocale("am");
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { NextIntlClientProvider } from "next-intl";
import en, { type Messages } from "./en";
import am from "./am";
import type { Locale } from "./index";

// ─── Types ────────────────────────────────────────────────────────────────────

type NestedKeyOf<T, Prefix extends string = ""> = {
  [K in keyof T & string]: T[K] extends Record<string, unknown>
    ? NestedKeyOf<T[K], `${Prefix}${K}.`>
    : `${Prefix}${K}`;
}[keyof T & string];

type Namespace = keyof Messages;
type NSMessages<NS extends Namespace> = Messages[NS];

// ─── Constants ────────────────────────────────────────────────────────────────

const LOCALE_STORAGE_KEY = "dispatch_locale";
const DEFAULT_LOCALE: Locale = "en";

const MESSAGE_MAP: Record<Locale, Messages> = { en, am };

// ─── Context ─────────────────────────────────────────────────────────────────

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

const LocaleContext = createContext<LocaleContextValue>({
  locale: DEFAULT_LOCALE,
  setLocale: () => {},
});

// ─── Provider ─────────────────────────────────────────────────────────────────

export function IntlProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  // Hydrate from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY) as Locale | null;
    if (stored && stored in MESSAGE_MAP) {
      setLocaleState(stored);
    }
  }, []);

  const setLocale = useCallback((next: Locale) => {
    localStorage.setItem(LOCALE_STORAGE_KEY, next);
    setLocaleState(next);
  }, []);

  const messages = MESSAGE_MAP[locale] as unknown as Record<string, unknown>;

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      <NextIntlClientProvider locale={locale} messages={messages}>
        {children}
      </NextIntlClientProvider>
    </LocaleContext.Provider>
  );
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

/**
 * useLocale
 * Returns the current locale and a setter. Safe to use in any client component.
 */
export function useLocale(): LocaleContextValue {
  return useContext(LocaleContext);
}

/**
 * useI18n(namespace)
 * Returns a typed t() function for the given namespace.
 *
 * Example:
 *   const t = useI18n("login");
 *   t("emailLabel");          // top-level key
 *   t("roles.merchant.label") // nested key with dot notation
 */
export function useI18n<NS extends Namespace>(namespace: NS) {
  const { locale } = useContext(LocaleContext);
  const messages = MESSAGE_MAP[locale];
  const ns = messages[namespace] as NSMessages<NS>;

  const t = useCallback(
    (key: string, replacements?: Record<string, string>): string => {
      const parts = key.split(".");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let value: any = ns;
      for (const part of parts) {
        value = value?.[part];
      }
      let result = typeof value === "string" ? value : key;
      if (replacements) {
        for (const [k, v] of Object.entries(replacements)) {
          result = result.replace(`{${k}}`, v);
        }
      }
      return result;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [locale, namespace]
  );

  return t;
}

// Use setLocale via: const { setLocale } = useLocale();
