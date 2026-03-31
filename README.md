# Dispatch

## Quick Start

```bash
# Install dependencies
npm install

# Run dev server (http://localhost:8080)
npm run dev

# Production build
npm run build
```

---

## Project Structure

```
src/
├── app/                         # Next.js App Router pages
│   ├── layout.tsx               # Root layout: wraps ThemeConfigProvider + IntlProvider
│   ├── index.css                # Global CSS: light/dark modes + color schemes
│   ├── page.tsx                 # Landing page
│   ├── login/
│   │   └── [role]/page.tsx      # Shared login page for all roles (merchant/supervisor/admin)
│   ├── merchant/page.tsx        # Merchant dashboard stub
│   ├── supervisor/page.tsx      # Courier Supervisor dashboard stub
│   └── admin/page.tsx           # Admin dashboard stub
│
├── intl/                        # i18n package
│   ├── en.ts                    # English strings (source of truth)
│   ├── am.ts                    # Amharic strings (matches keys in en.ts)
│   ├── index.ts                 # Public barrel export
│   └── IntlProvider.tsx         # Context + useI18n() + useLocale() hooks
│
├── lib/
│   ├── theme.ts                 # Theme config: COLOR_SCHEMES, DEFAULT_COLOR_SCHEME
│   └── utils.ts                 # Tailwind cn() utility
│
├── components/
│   ├── ThemeProvider.tsx        # next-themes wrapper + color scheme context
│   ├── ThemeToggle.tsx          # Dark/light toggle + color scheme picker
│   ├── LanguageSwitcher.tsx     # EN / Amharic language toggle
│   ├── DataTable.tsx
│   ├── ShipmentCard.tsx
│   ├── StatsCard.tsx
│   ├── StatusBadge.tsx
│   └── ui/                      # shadcn/ui components
│
└── assets/
    └── dispatch-logo.png
```

---

## Theming

### Dark / Light Mode

Controlled by `next-themes`. The `ThemeToggle` component lets users switch between `dark`, `light`, and `system`. Default is `dark`.

**To change the default:** edit `DEFAULT_THEME_MODE` in `src/lib/theme.ts`.

### Color Schemes

Five built-in schemes: `purple` (default), `blue`, `orange`, `green`, `rose`.

**To change the default scheme:** edit `DEFAULT_COLOR_SCHEME` in `src/lib/theme.ts`.

**To add a new scheme:**

1. Add an entry to `COLOR_SCHEMES` in `src/lib/theme.ts`:
   ```ts
   teal: { label: "Teal", hue: 174, saturation: 72, darkLightness: 50, lightLightness: 38 }
   ```
2. Add a matching CSS block to `src/app/index.css`:
   ```css
   .scheme-teal { --hue: 174; --sat: 72%; }
   ```
3. Add a swatch color to `SCHEME_SWATCH` in `src/components/ThemeToggle.tsx`.

Color schemes work in both light and dark mode automatically via CSS custom properties (`--hue`, `--sat`).

---

## Internationalization (i18n)

The project uses a custom lightweight wrapper over `next-intl`.

### How it works

All strings live in `src/intl/en.ts` (English) and `src/intl/am.ts` (Amharic). They share the same key structure.

### Using translations in a component

```tsx
import { useI18n } from "@/intl";

export function MyComponent() {
  const t = useI18n("login");       // pass a top-level namespace key
  return <p>{t("emailLabel")}</p>;  // "Email" or "ኢሜይል"
}
```

For nested keys, use dot notation:
```tsx
t("roles.merchant.label")  // "Merchant" or "ነጋዴ"
```

For strings with placeholders:
```tsx
t("lockout.message", { time: "14:32" })
```

### Changing the language at runtime

```tsx
import { useLocale } from "@/intl";

const { locale, setLocale } = useLocale();
setLocale("am"); // switches to Amharic and persists in localStorage
```

### Adding a new language

1. Create `src/intl/fr.ts` mirroring the structure of `en.ts`.
2. Add `"fr"` to the `Locale` type in `src/intl/index.ts`.
3. Add `fr` to `MESSAGE_MAP` in `src/intl/IntlProvider.tsx`.
4. Add an entry to `LOCALE_LABELS` in `src/components/LanguageSwitcher.tsx`.

---

## Forking for a New Dashboard Repo

This repo is the shared template. When forking for a specific portal (e.g., the merchant dashboard):

1. Fork / copy the repo.
2. Add the merchant signup page if needed (it was intentionally excluded from this template).
3. Update `DEFAULT_COLOR_SCHEME` and `DEFAULT_THEME_MODE` in `src/lib/theme.ts` to match that portal's brand.
4. Develop the full dashboard under `src/app/merchant/`.

---

## Tech Stack

| Tool | Purpose |
|------|---------|
| [Next.js 15](https://nextjs.org) | Framework (App Router) |
| [Tailwind CSS](https://tailwindcss.com) | Styling |
| [shadcn/ui](https://ui.shadcn.com) | UI components |
| [next-themes](https://github.com/pacocoursey/next-themes) | Dark/light mode |
| [next-intl](https://next-intl-docs.vercel.app) | i18n infrastructure |
| [lucide-react](https://lucide.dev) | Icons |


