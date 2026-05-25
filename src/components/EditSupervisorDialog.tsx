"use client";

import { friendlyError } from "@/lib/api-client";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useUpdateSupervisor } from "@/hooks/queries/use-update-supervisor";
import type { Supervisor } from "@/types/api";
import { useI18n } from "@/intl";

interface EditSupervisorDialogProps {
  supervisor: Supervisor | null;
  companyId: number | undefined;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const inputClass =
  "h-9 w-full bg-background border border-border rounded-md px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring [color-scheme:dark] placeholder:text-muted-foreground/50";

const selectClass =
  "h-9 w-full bg-background border border-border rounded-md px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring";

interface FormState {
  first_name: string;
  middle_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  status: string;
}

export function EditSupervisorDialog({ supervisor, companyId, open, onOpenChange }: EditSupervisorDialogProps) {
  const t = useI18n("supervisors");
  const [form, setForm] = useState<FormState>({
    first_name: "", middle_name: "", last_name: "", email: "", phone_number: "", status: "active",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);
  const mutation = useUpdateSupervisor(companyId);

  useEffect(() => {
    if (supervisor) {
      setForm({
        first_name: supervisor.first_name,
        middle_name: supervisor.middle_name ?? "",
        last_name: supervisor.last_name,
        email: supervisor.email,
        phone_number: supervisor.phone_number,
        status: supervisor.status,
      });
      setErrors({});
      setSuccess(false);
      mutation.reset();
    }
  }, [supervisor]);

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!form.first_name.trim()) e.first_name = "First name is required";
    if (!form.last_name.trim()) e.last_name = "Last name is required";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Invalid email format";
    if (form.phone_number && !/^\+\d{9,14}$/.test(form.phone_number.replace(/\s/g, "")))
      e.phone_number = "Must be E.164 format (e.g. +251911234567)";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleClose() {
    setErrors({});
    setSuccess(false);
    mutation.reset();
    onOpenChange(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!supervisor || !validate()) return;
    try {
      await mutation.mutateAsync({
        supervisorId: supervisor.id,
        payload: {
          first_name: form.first_name.trim(),
          middle_name: form.middle_name.trim() || undefined,
          last_name: form.last_name.trim(),
          email: form.email.trim() || undefined,
          phone_number: form.phone_number.trim() || undefined,
          status: form.status,
        },
      });
      setSuccess(true);
    } catch {
      // error shown from mutation.error
    }
  }

  const field = (key: keyof FormState) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((p) => ({ ...p, [key]: e.target.value })),
  });

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("edit.title" as any)}</DialogTitle>
          <DialogDescription>{t("edit.description" as any)}</DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <CheckCircle2 className="h-10 w-10 text-green-500" />
            <p className="text-sm font-medium">{t("edit.success" as any)}</p>
            <Button onClick={handleClose} className="mt-2">{t("close")}</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">{t("edit.firstName" as any)} *</label>
                <input className={inputClass} {...field("first_name")} />
                {errors.first_name && <p className="text-xs text-destructive">{errors.first_name}</p>}
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">{t("edit.middleName" as any)}</label>
                <input className={inputClass} {...field("middle_name")} />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">{t("edit.lastName" as any)} *</label>
              <input className={inputClass} {...field("last_name")} />
              {errors.last_name && <p className="text-xs text-destructive">{errors.last_name}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">{t("edit.email" as any)}</label>
              <input className={inputClass} type="email" {...field("email")} />
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">{t("edit.phone" as any)}</label>
              <input className={inputClass} {...field("phone_number")} />
              {errors.phone_number && <p className="text-xs text-destructive">{errors.phone_number}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">{t("edit.status" as any)}</label>
              <select className={selectClass} {...field("status")}>
                <option value="active">{t("status.active" as any)}</option>
                <option value="inactive">{t("status.inactive" as any)}</option>
              </select>
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
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{t("edit.submitting" as any)}</>
                ) : t("edit.submit" as any)}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
