/**
 * intl/index.ts
 *
 * Public API for the intl package.
 *
 * USAGE:
 *   import { useI18n, useLocale, setLocale, type Locale } from "@/intl";
 *
 * The `useI18n` hook returns a typed `t()` function scoped to your namespace,
 * e.g.:
 *   const t = useI18n("login");
 *   t("emailLabel"); // fully typed
 */

export { default as en } from "./en";
export { default as am } from "./am";
export type { Messages } from "./en";
export { useI18n, useLocale, IntlProvider } from "./IntlProvider";

export type Locale = "en" | "am";
