/**
 * lib/theme.ts
 *
 * Theme configuration for Dispatch.
 *
 * HOW TO CUSTOMIZE:
 *  1. To change the default color scheme, edit `DEFAULT_COLOR_SCHEME`.
 *  2. To add a new color scheme, add an entry to `COLOR_SCHEMES` below.
 *     Each scheme only needs a `hue` (0-360) and a `label`.
 *     The CSS variables are derived automatically in index.css.
 *  3. To change the default mode (dark/light), edit `DEFAULT_THEME_MODE`.
 *
 * USAGE in a component:
 *   import { COLOR_SCHEMES, type ColorSchemeKey } from "@/lib/theme";
 */

export type ThemeMode = "dark" | "light" | "system";

export interface ColorScheme {
  /** A human-readable label shown in the theme picker. */
  label: string;
  /** The HSL hue (0-360) used to derive all primary/accent/sidebar shades. */
  hue: number;
  /** The HSL saturation for the primary color (0-100). */
  saturation: number;
  /** Lightness for dark-mode primary (0-100). */
  darkLightness: number;
  /** Lightness for light-mode primary (0-100). */
  lightLightness: number;
}

/**
 * COLOR_SCHEMES
 * The full set of color schemes teams can choose from.
 * Fork-specific projects should extend or replace this object.
 */
export const COLOR_SCHEMES = {
  purple: {
    label: "Purple",
    hue: 270,
    saturation: 70,
    darkLightness: 60,
    lightLightness: 52,
  },
  blue: {
    label: "Blue",
    hue: 217,
    saturation: 91,
    darkLightness: 60,
    lightLightness: 50,
  },
  orange: {
    label: "Orange",
    hue: 25,
    saturation: 95,
    darkLightness: 55,
    lightLightness: 48,
  },
  green: {
    label: "Green",
    hue: 142,
    saturation: 71,
    darkLightness: 52,
    lightLightness: 38,
  },
  rose: {
    label: "Rose",
    hue: 346,
    saturation: 84,
    darkLightness: 60,
    lightLightness: 50,
  },
} satisfies Record<string, ColorScheme>;

export type ColorSchemeKey = keyof typeof COLOR_SCHEMES;

/** The color scheme applied when no preference is stored. */
export const DEFAULT_COLOR_SCHEME: ColorSchemeKey = "purple";

/** The theme mode applied when no preference is stored. */
export const DEFAULT_THEME_MODE: ThemeMode = "dark";

/** localStorage keys used by ThemeConfigProvider. */
export const THEME_STORAGE_KEYS = {
  mode: "dispatch_theme_mode",
  colorScheme: "dispatch_color_scheme",
} as const;
