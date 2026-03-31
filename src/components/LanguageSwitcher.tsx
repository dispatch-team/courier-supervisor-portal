"use client";

/**
 * components/LanguageSwitcher.tsx
 *
 * Compact language toggle between English and Amharic.
 *
 * USAGE:
 *   import { LanguageSwitcher } from "@/components/LanguageSwitcher";
 *   <LanguageSwitcher />
 *
 * To add more languages:
 *  1. Add a new file in src/intl/ (e.g., fr.ts) mirroring en.ts keys.
 *  2. Add the locale to the Locale type in src/intl/index.ts.
 *  3. Add the locale to MESSAGE_MAP in src/intl/IntlProvider.tsx.
 *  4. Add an entry to LOCALE_LABELS below.
 */

import { useLocale } from "@/intl";
import type { Locale } from "@/intl";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Languages } from "lucide-react";

const LOCALE_LABELS: Record<Locale, { label: string; native: string }> = {
  en: { label: "English", native: "EN" },
  am: { label: "አማርኛ", native: "አማ" },
};

export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, setLocale } = useLocale();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={`h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground ${className ?? ""}`}
          title="Switch language"
        >
          <Languages className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-36">
        {(Object.entries(LOCALE_LABELS) as [Locale, (typeof LOCALE_LABELS)[Locale]][]).map(
          ([key, info]) => (
            <DropdownMenuItem
              key={key}
              onClick={() => setLocale(key)}
              className={locale === key ? "text-primary font-medium" : ""}
            >
              <span className="mr-2 text-xs font-bold w-6 text-center">
                {info.native}
              </span>
              {info.label}
            </DropdownMenuItem>
          )
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
