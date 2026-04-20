"use client";

import { useLocale, type Locale, useI18n } from "@/intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Languages, Check, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

interface LocaleOption {
  code: Locale;
  name: string;
  nativeName: string;
}

const LOCALES: LocaleOption[] = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "am", name: "Amharic", nativeName: "አማርኛ" },
];

export default function SettingsPage() {
  const { locale, setLocale } = useLocale();
  const t = useI18n("settings");

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">
          {t("subtitle")}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Languages className="h-4 w-4 text-primary" />
            {t("language.title")}
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t("language.description")}
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {LOCALES.map((opt) => {
              const isActive = locale === opt.code;
              return (
                <button
                  key={opt.code}
                  onClick={() => setLocale(opt.code)}
                  className={cn(
                    "flex items-center gap-3 p-4 rounded-lg border text-left transition-all",
                    isActive
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border bg-card hover:border-border/80 hover:bg-muted/30",
                  )}
                >
                  <div
                    className={cn(
                      "h-9 w-9 rounded-md flex items-center justify-center shrink-0 text-sm font-bold uppercase",
                      isActive
                        ? "bg-primary/15 text-primary"
                        : "bg-muted/50 text-muted-foreground",
                    )}
                  >
                    {opt.code}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">
                      {opt.nativeName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {opt.name}
                    </p>
                  </div>
                  {isActive && (
                    <div className="h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                      <Check className="h-3 w-3" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="border-dashed">
        <CardContent className="flex items-start gap-3 p-4">
          <div className="h-9 w-9 rounded-md bg-muted/50 flex items-center justify-center shrink-0">
            <Globe className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">
              {t("comingSoon.title")}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {t("comingSoon.description")}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
