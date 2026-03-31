"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Package,
  Users,
  Shield,
  Eye,
  EyeOff,
  ArrowLeft,
  AlertCircle,
  Loader2,
} from "lucide-react";
import dispatchLogo from "@/assets/dispatch-logo.png";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useI18n } from "@/intl";
import { useAuth } from "@/context/AuthContext";
import { login as keycloakLogin, type AuthError } from "@/lib/auth";

type RoleKey = "merchant" | "supervisor" | "admin";

const ROLE_ICONS: Record<RoleKey, React.ElementType> = {
  merchant: Package,
  supervisor: Users,
  admin: Shield,
};

const ROLE_DASHBOARDS: Record<RoleKey, string> = {
  merchant: "/merchant",
  supervisor: "/supervisor",
  admin: "/admin",
};

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

function getAttemptKey(role: string) {
  return `dispatch_login_attempts_${role}`;
}

function getAttemptData(role: string): { count: number; firstAttemptAt: number } {
  try {
    const raw = sessionStorage.getItem(getAttemptKey(role));
    if (raw) return JSON.parse(raw);
  } catch {}
  return { count: 0, firstAttemptAt: 0 };
}

function setAttemptData(
  role: string,
  data: { count: number; firstAttemptAt: number }
) {
  sessionStorage.setItem(getAttemptKey(role), JSON.stringify(data));
}

function clearAttemptData(role: string) {
  sessionStorage.removeItem(getAttemptKey(role));
}

export default function LoginPage() {
  const params = useParams();
  const roleStr = typeof params?.role === "string" ? params.role : "merchant";
  const role: RoleKey = (roleStr as RoleKey) in ROLE_ICONS ? (roleStr as RoleKey) : "merchant";
  const router = useRouter();
  const { setTokens, isAuthenticated } = useAuth();

  const t = useI18n("login");
  const roleLabel = t(`roles.${role}.label`);
  const roleSubtitle = t(`roles.${role}.subtitle`);

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});
  const [isLockedOut, setIsLockedOut] = useState(false);
  const [lockoutRemaining, setLockoutRemaining] = useState(0);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace(ROLE_DASHBOARDS[role]);
    }
  }, [isAuthenticated, role, router]);

  useEffect(() => {
    checkLockout();
    setError(null);
    setFieldErrors({});
    setEmail("");
    setPassword("");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  useEffect(() => {
    if (!isLockedOut) return;
    const interval = setInterval(() => {
      checkLockout();
    }, 1000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLockedOut]);

  function checkLockout() {
    const data = getAttemptData(role);
    if (data.count >= MAX_ATTEMPTS) {
      const elapsed = Date.now() - data.firstAttemptAt;
      if (elapsed < LOCKOUT_DURATION_MS) {
        setIsLockedOut(true);
        setLockoutRemaining(Math.ceil((LOCKOUT_DURATION_MS - elapsed) / 1000));
        return;
      }
      clearAttemptData(role);
    }
    setIsLockedOut(false);
    setLockoutRemaining(0);
  }

  function formatTime(seconds: number) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  function validateEmail(val: string): string | null {
    if (!val.trim()) return t("validation.emailRequired");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim()))
      return t("validation.emailInvalid");
    if (val.trim().length > 255) return t("validation.emailTooLong");
    return null;
  }

  function validatePassword(val: string): string | null {
    if (!val) return t("validation.passwordRequired");
    if (val.length < 8) return t("validation.passwordTooShort");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (isLockedOut) return;

    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password);
    setFieldErrors({
      email: emailErr ?? undefined,
      password: passwordErr ?? undefined,
    });
    if (emailErr || passwordErr) return;

    setIsLoading(true);
    try {
      const tokens = await keycloakLogin(email, password);
      clearAttemptData(role);
      setTokens(tokens);
      router.push(ROLE_DASHBOARDS[role]);
    } catch (err) {
      const authErr = err as AuthError;
      setError(authErr.message);

      if (authErr.code === "INVALID_CREDENTIALS") {
        const data = getAttemptData(role);
        const now = Date.now();
        if (data.count === 0 || now - data.firstAttemptAt >= LOCKOUT_DURATION_MS) {
          setAttemptData(role, { count: 1, firstAttemptAt: now });
        } else {
          setAttemptData(role, { count: data.count + 1, firstAttemptAt: data.firstAttemptAt });
        }
        checkLockout();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const Icon = ROLE_ICONS[role];
  const otherRoles = (Object.keys(ROLE_ICONS) as RoleKey[]).filter(
    (k) => k !== role
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel: branding */}
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
            {t("welcomeBack")}
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            {t("platformDescription")}
          </p>
        </div>
      </div>

      {/* Right panel: form */}
      <div className="flex-1 flex items-center justify-center p-6 relative">
        {/* Top bar: back link + controls */}
        <div className="absolute top-5 left-6 right-6 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("back")}
          </Link>
          <div className="flex items-center gap-0.5">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>

        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <Link href="/" className="lg:hidden flex justify-center mb-10">
            <img src={dispatchLogo.src} alt="Dispatch" className="h-20 w-auto" />
          </Link>

          {/* Role header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/10 flex items-center justify-center">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground tracking-tight">
                {roleLabel}
              </h1>
              <p className="text-xs text-muted-foreground">{roleSubtitle}</p>
            </div>
          </div>

          {/* Error banner */}
          {error && (
            <div className="flex items-start gap-2.5 bg-destructive/10 border border-destructive/20 rounded-xl p-3.5 mb-6 animate-fade-in">
              <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Lockout banner */}
          {isLockedOut && (
            <div className="flex items-start gap-2.5 bg-warning/10 border border-warning/20 rounded-xl p-3.5 mb-6 animate-fade-in">
              <AlertCircle className="h-4 w-4 text-warning flex-shrink-0 mt-0.5" />
              <p className="text-sm text-warning">
                {t("lockout.message", { time: formatTime(lockoutRemaining) })}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
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
                  if (fieldErrors.email)
                    setFieldErrors((p) => ({ ...p, email: undefined }));
                }}
                required
                disabled={isLockedOut || isLoading}
                className={`h-11 rounded-xl bg-card border-border/60 focus:border-primary/40 ${
                  fieldErrors.email
                    ? "border-destructive/60 focus:border-destructive/80"
                    : ""
                }`}
              />
              {fieldErrors.email && (
                <p className="text-xs text-destructive mt-1">
                  {fieldErrors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="password"
                  className="text-xs text-muted-foreground"
                >
                  {t("passwordLabel")}
                </Label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-primary/70 hover:text-primary transition-colors"
                >
                  {t("forgotPassword")}
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password)
                      setFieldErrors((p) => ({ ...p, password: undefined }));
                  }}
                  required
                  disabled={isLockedOut || isLoading}
                  className={`h-11 rounded-xl bg-card border-border/60 focus:border-primary/40 pr-10 ${
                    fieldErrors.password
                      ? "border-destructive/60 focus:border-destructive/80"
                      : ""
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-xs text-destructive mt-1">
                  {fieldErrors.password}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-11 rounded-xl"
              disabled={isLockedOut || isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t("signingIn")}
                </span>
              ) : (
                t("signIn")
              )}
            </Button>
          </form>

          {/* Switch portal */}
          <div className="mt-10 pt-6 border-t border-border/40">
            <p className="text-[11px] text-muted-foreground/60 mb-3 text-center uppercase tracking-wider">
              {t("switchPortal")}
            </p>
            <div className="flex justify-center gap-1.5 flex-wrap">
              {otherRoles.map((key) => {
                const OtherIcon = ROLE_ICONS[key];
                return (
                  <Link key={key} href={`/login/${key}`}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1.5 text-xs text-muted-foreground hover:text-foreground rounded-lg h-8"
                    >
                      <OtherIcon className="h-3.5 w-3.5" />
                      {t(`roles.${key}.label`)}
                    </Button>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
