"use client";

import { friendlyError } from "@/lib/api-client";
import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, AlertCircle, Upload, X } from "lucide-react";
import { useUpdateDriver } from "@/hooks/queries/use-update-driver";
import { validateName, validateEmail, validatePhone } from "@/lib/validation";
import { DriverAvatar } from "@/components/DriverAvatar";
import type { Driver } from "@/types/api";
import { useI18n, useTranslateValidationError } from "@/intl";

interface EditDriverDialogProps {
  driver: Driver | null;
  courierCompanyId: number | undefined;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const inputClass =
  "h-9 w-full bg-background border border-border rounded-md px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring [color-scheme:dark] placeholder:text-muted-foreground/50";

interface FormState {
  first_name: string;
  middle_name: string;
  last_name: string;
  email: string;
  phone_number: string;
}

function validateForm(form: FormState): Record<string, string> {
  const errors: Record<string, string> = {};
  const fnErr = validateName(form.first_name, "First name"); if (fnErr) errors.first_name = fnErr;
  const lnErr = validateName(form.last_name, "Last name"); if (lnErr) errors.last_name = lnErr;
  const emailErr = validateEmail(form.email); if (emailErr) errors.email = emailErr;
  const phoneErr = validatePhone(form.phone_number); if (phoneErr) errors.phone_number = phoneErr;
  return errors;
}

function getChangedFields(
  original: Driver,
  form: FormState,
): Record<string, string> {
  const changes: Record<string, string> = {};
  if (form.first_name.trim() !== original.first_name) changes.first_name = form.first_name.trim();
  if (form.middle_name.trim() !== original.middle_name) changes.middle_name = form.middle_name.trim();
  if (form.last_name.trim() !== original.last_name) changes.last_name = form.last_name.trim();
  if (form.email.trim() !== original.email) changes.email = form.email.trim();
  if (form.phone_number.replace(/\s/g, "") !== original.phone_number)
    changes.phone_number = form.phone_number.replace(/\s/g, "");
  return changes;
}

export function EditDriverDialog({
  driver,
  courierCompanyId,
  open,
  onOpenChange,
}: EditDriverDialogProps) {
  const t = useI18n("drivers");
  const tVal = useTranslateValidationError();

  const [form, setForm] = useState<FormState>({
    first_name: "",
    middle_name: "",
    last_name: "",
    email: "",
    phone_number: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [changedFields, setChangedFields] = useState<string[] | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const updateMutation = useUpdateDriver();

  // Populate form when driver changes
  useEffect(() => {
    if (driver) {
      setForm({
        first_name: driver.first_name,
        middle_name: driver.middle_name,
        last_name: driver.last_name,
        email: driver.email,
        phone_number: driver.phone_number,
      });
      setErrors({});
      setProfilePic(null);
      setProfilePreview(null);
      setChangedFields(null);
      updateMutation.reset();
    }
    // updateMutation excluded intentionally — new object reference every render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [driver]);

  const updateField = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => { const n = { ...prev }; delete n[key]; return n; });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setErrors((prev) => ({ ...prev, photo: "Only JPEG, PNG, or WebP images are allowed" }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, photo: "Max file size is 5MB" }));
      return;
    }
    setProfilePic(file);
    setProfilePreview(URL.createObjectURL(file));
    setErrors((prev) => { const n = { ...prev }; delete n.photo; return n; });
  };

  const clearPhoto = () => {
    setProfilePic(null);
    setProfilePreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleSubmit = () => {
    if (!driver || !courierCompanyId) return;

    const errs = validateForm(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    const changes = getChangedFields(driver, form);
    const hasChanges = Object.keys(changes).length > 0 || profilePic;

    if (!hasChanges) {
      onOpenChange(false);
      return;
    }

    updateMutation.mutate(
      {
        courierCompanyId,
        driverId: driver.id,
        data: changes,
        profilePicture: profilePic ?? undefined,
      },
      {
        onSuccess: () => {
          const fields = [...Object.keys(changes)];
          if (profilePic) fields.push("profile photo");
          setChangedFields(fields);
        },
      },
    );
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  if (!driver) return null;

  const fullName = [driver.first_name, driver.middle_name, driver.last_name].filter(Boolean).join(" ");

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("dialogs.edit.title")}</DialogTitle>
          <DialogDescription>
            {t("dialogs.edit.description", { name: fullName })}
          </DialogDescription>
        </DialogHeader>

        {changedFields ? (
          <div className="space-y-4 py-2">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
              <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
              <div>
                <p className="text-sm font-medium text-green-700 dark:text-green-400">
                  {t("dialogs.edit.success")}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {t("dialogs.edit.changedFields", { fields: changedFields.map((f) => f.replace(/_/g, " ")).join(", ") })}
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleClose}>{t("dialogs.done")}</Button>
            </DialogFooter>
          </div>
        ) : (
          <>
            <div className="space-y-4 py-2">
              {/* Name Row */}
              <div className="grid grid-cols-3 gap-3">
                <Field label={t("dialogs.create.firstName")} value={form.first_name} onChange={(v) => updateField("first_name", v)} error={tVal(errors.first_name) || undefined} />
                <Field label={t("dialogs.create.middleName")} value={form.middle_name} onChange={(v) => updateField("middle_name", v)} />
                <Field label={t("dialogs.create.lastName")} value={form.last_name} onChange={(v) => updateField("last_name", v)} error={tVal(errors.last_name) || undefined} />
              </div>

              {/* Contact Row */}
              <div className="grid grid-cols-2 gap-3">
                <Field label={t("dialogs.create.email")} value={form.email} onChange={(v) => updateField("email", v)} error={tVal(errors.email) || undefined} type="email" />
                <Field label={t("dialogs.create.phone")} value={form.phone_number} onChange={(v) => updateField("phone_number", v)} error={tVal(errors.phone_number) || undefined} type="tel" />
              </div>

              {/* Profile Photo */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">{t("dialogs.edit.profilePhoto")}</label>
                {profilePreview ? (
                  <div className="flex items-center gap-3">
                    <img src={profilePreview} alt="Preview" className="h-12 w-12 rounded-full object-cover border border-border" />
                    <div className="flex-1 text-sm text-muted-foreground truncate">{profilePic?.name}</div>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={clearPhoto}>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    {driver.profile_picture_id && (
                      <DriverAvatar
                        driverId={driver.id}
                        profilePictureId={driver.profile_picture_id}
                        initials={`${driver.first_name[0]}${driver.last_name[0]}`}
                        size="md"
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      className="flex items-center gap-2 px-3 py-2 rounded-md border border-dashed border-border text-sm text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors flex-1"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      {driver.profile_picture_id ? t("dialogs.edit.changePhoto") : t("dialogs.edit.uploadPhoto")}
                    </button>
                  </div>
                )}
                <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileSelect} className="hidden" />
                {errors.photo && <p className="text-xs text-destructive">{errors.photo}</p>}
              </div>

              {/* Error */}
              {updateMutation.isError && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
                  <p className="text-sm text-destructive">
                    {friendlyError(updateMutation.error)}
                  </p>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>{t("dialogs.cancel")}</Button>
              <Button onClick={handleSubmit} disabled={updateMutation.isPending}>
                {updateMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                {t("dialogs.edit.submit")}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  value,
  onChange,
  error,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  type?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className={inputClass} />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
