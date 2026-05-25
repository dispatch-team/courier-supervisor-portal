"use client";

import { friendlyError } from "@/lib/api-client";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, AlertCircle, Shuffle } from "lucide-react";
import { useCreateSupervisor } from "@/hooks/queries/use-create-supervisor";
import { useI18n } from "@/intl";

interface CreateSupervisorDialogProps {
  companyId: number | undefined;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const inputClass =
  "h-9 w-full bg-background border border-border rounded-md px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring [color-scheme:dark] placeholder:text-muted-foreground/50";

function generatePassword(): string {
  const upper = "ABCDEFGHJKMNPQRSTUVWXYZ";
  const lower = "abcdefghjkmnpqrstuvwxyz";
  const digits = "23456789";
  const special = "!@#$%^&*";
  const all = upper + lower + digits + special;

  const pick = (s: string) => s[Math.floor(Math.random() * s.length)];

  const chars = [pick(upper), pick(lower), pick(digits), pick(special),
    ...Array.from({ length: 8 }, () => pick(all))];

  for (let i = chars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }

  return chars.join("");
}

interface FormState {
  first_name: string;
  middle_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  password: string;
}

const EMPTY_FORM: FormState = {
  first_name: "",
  middle_name: "",
  last_name: "",
  email: "",
  phone_number: "",
  password: "",
};

export function CreateSupervisorDialog({ companyId, open, onOpenChange }: CreateSupervisorDialogProps) {
  const t = useI18n("supervisors");
  const [form, setForm] = useState<FormState>({ ...EMPTY_FORM, password: generatePassword() });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);
  const mutation = useCreateSupervisor(companyId);

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!form.first_name.trim()) e.first_name = "First name is required";
    if (!form.last_name.trim()) e.last_name = "Last name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Invalid email format";
    if (!form.phone_number.trim()) e.phone_number = "Phone number is required";
    else if (!/^\+\d{9,14}$/.test(form.phone_number.replace(/\s/g, "")))
      e.phone_number = "Must be E.164 format (e.g. +251911234567)";
    if (!form.password) e.password = "Password is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleClose() {
    setForm({ ...EMPTY_FORM, password: generatePassword() });
    setErrors({});
    setSuccess(false);
    mutation.reset();
    onOpenChange(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    try {
      await mutation.mutateAsync({
        first_name: form.first_name.trim(),
        middle_name: form.middle_name.trim() || undefined,
        last_name: form.last_name.trim(),
        email: form.email.trim(),
        phone_number: form.phone_number.trim(),
        password: form.password,
      });
      setSuccess(true);
    } catch {
      // error shown from mutation.error
    }
  }

  const field = (key: keyof FormState) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((p) => ({ ...p, [key]: e.target.value })),
  });

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("create.title" as any)}</DialogTitle>
          <DialogDescription>{t("create.description" as any)}</DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <CheckCircle2 className="h-10 w-10 text-green-500" />
            <p className="text-sm font-medium">{t("create.success" as any)}</p>
            <Button onClick={handleClose} className="mt-2">{t("close")}</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">{t("create.firstName" as any)} *</label>
                <input className={inputClass} placeholder={t("create.firstNamePlaceholder" as any)} {...field("first_name")} />
                {errors.first_name && <p className="text-xs text-destructive">{errors.first_name}</p>}
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">{t("create.middleName" as any)}</label>
                <input className={inputClass} placeholder={t("create.middleNamePlaceholder" as any)} {...field("middle_name")} />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">{t("create.lastName" as any)} *</label>
              <input className={inputClass} placeholder={t("create.lastNamePlaceholder" as any)} {...field("last_name")} />
              {errors.last_name && <p className="text-xs text-destructive">{errors.last_name}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">{t("create.email" as any)} *</label>
              <input className={inputClass} type="email" placeholder={t("create.emailPlaceholder" as any)} {...field("email")} />
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">{t("create.phone" as any)} *</label>
              <input className={inputClass} placeholder={t("create.phonePlaceholder" as any)} {...field("phone_number")} />
              {errors.phone_number && <p className="text-xs text-destructive">{errors.phone_number}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">{t("create.password" as any)} *</label>
              <div className="flex gap-2">
                <input className={inputClass} readOnly value={form.password} />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="shrink-0"
                  onClick={() => setForm((p) => ({ ...p, password: generatePassword() }))}
                >
                  <Shuffle className="h-3.5 w-3.5 mr-1" />
                  {t("create.regenerate" as any)}
                </Button>
              </div>
              {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
            </div>

            {mutation.isError && (
              <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{friendlyError(mutation.error)}</span>
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose} disabled={mutation.isPending}>
                {t("cancel")}
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{t("create.submitting" as any)}</>
                ) : t("create.submit" as any)}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
