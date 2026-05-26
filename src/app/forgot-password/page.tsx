"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Mail, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import dispatchLogo from "@/assets/dispatch-logo.png";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useI18n } from "@/intl";

type State = "idle" | "loading" | "success" | "error";

function validateEmail(val: string): string | null {
  if (!val.trim()) return "Email is required.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim())) return "Please enter a valid email address.";
  if (val.trim().length > 255) return "Email must be under 255 characters.";
  return null;
}

function ForgotPasswordContent() {
  const t = useI18n("forgotPassword");
  const searchParams = useSearchParams();

  const [email, setEmail] = useState(searchParams.get("email") ?? "");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [state, setState] = useState<State>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateEmail(email);
    if (err) {
      setEmailError(err);
      return;
    }
    setEmailError(null);
    setState("loading");
    setErrorMsg(null);

    try {
      const res = await fetch("/api/v1/auth-actions/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      if (res.ok) {
        setState("success");
        return;
      }

      const data = await res.json().catch(() => ({}));
      if (res.status === 404) {
        setErrorMsg(t("errorNotFound"));
      } else {
        setErrorMsg(
          typeof data?.error === "string" ? data.error : t("errorGeneric"),
        );
      }
      setState("error");
    } catch {
      setErrorMsg(t("errorGeneric"));
      setState("error");
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-1 relative items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[400px] bg-primary/15 rounded-full blur-[100px]" />
          <div className="absolute bottom-1/4 left-1/4 w-[300px] h-[300px] bg-accent/10 rounded-full blur-[80px]" />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:48px_48px]" />
        <div className="relative max-w-md text-center px-8">
          <img
            src={dispatchLogo.src}
            alt="Dispatch"
            className="h-28 w-auto mx-auto mb-10 drop-shadow-[0_0_30px_hsl(270,70%,60%,0.2)]"
          />
          <h2 className="text-3xl font-bold text-foreground mb-3 tracking-tight">
            {t("panelTitle")}
          </h2>
          <p className="text-muted-foreground leading-relaxed">{t("panelSubtitle")}</p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 relative">
        <div className="absolute top-5 right-6 flex items-center gap-0.5">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>

        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center mb-10">
            <img src={dispatchLogo.src} alt="Dispatch" className="h-20 w-auto" />
          </div>

          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/10 flex items-center justify-center">
              <Mail className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground tracking-tight">
                {t("title")}
              </h1>
              <p className="text-xs text-muted-foreground">{t("subtitle")}</p>
            </div>
          </div>

          {/* Success state */}
          {state === "success" ? (
            <div className="space-y-6">
              <div className="flex flex-col items-center gap-3 bg-green-500/10 border border-green-500/20 rounded-xl p-5 text-center">
                <CheckCircle2 className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-sm font-medium text-foreground">{t("successTitle")}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("successBody", { email: email.trim() })}
                  </p>
                </div>
              </div>
              <Link href="/login/supervisor">
                <Button variant="ghost" className="w-full h-11 rounded-xl gap-2 text-muted-foreground hover:bg-muted hover:text-foreground">
                  <ArrowLeft className="h-4 w-4" />
                  {t("backToLogin")}
                </Button>
              </Link>
            </div>
          ) : (
            <>
              {/* Description */}
              <p className="text-sm text-muted-foreground mb-6">{t("description")}</p>

              {/* Error banner */}
              {state === "error" && errorMsg && (
                <div className="flex items-start gap-2.5 bg-destructive/10 border border-destructive/20 rounded-xl p-3.5 mb-6">
                  <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-destructive">{errorMsg}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs text-muted-foreground">
                    {t("emailLabel")}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={t("emailPlaceholder")}
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (emailError) setEmailError(null);
                      if (state === "error") setState("idle");
                    }}
                    disabled={state === "loading"}
                    className={`h-11 rounded-xl bg-card border-border/60 focus:border-primary/40 ${
                      emailError ? "border-destructive/60 focus:border-destructive/80" : ""
                    }`}
                  />
                  {emailError && (
                    <p className="text-xs text-destructive mt-1">{emailError}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 rounded-xl"
                  disabled={state === "loading"}
                >
                  {state === "loading" ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {t("sending")}
                    </span>
                  ) : (
                    t("submit")
                  )}
                </Button>

                <Link href="/login/supervisor" className="mt-1 block">
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full h-11 rounded-xl gap-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    {t("backToLogin")}
                  </Button>
                </Link>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense>
      <ForgotPasswordContent />
    </Suspense>
  );
}
