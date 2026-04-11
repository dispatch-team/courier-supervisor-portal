"use client";

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
import { Loader2, CheckCircle2, AlertCircle, Eye, EyeOff, Shuffle } from "lucide-react";
import { useCreateDriver } from "@/hooks/queries/use-create-driver";

interface CreateDriverDialogProps {
  courierCompanyId: number | undefined;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const inputClass =
  "h-9 w-full bg-background border border-border rounded-md px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring [color-scheme:dark] placeholder:text-muted-foreground/50";

function generatePassword(): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$";
  let pw = "";
  for (let i = 0; i < 12; i++) pw += chars[Math.floor(Math.random() * chars.length)];
  return pw;
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

function validateForm(form: FormState): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!form.first_name.trim()) errors.first_name = "First name is required";
  if (!form.last_name.trim()) errors.last_name = "Last name is required";
  if (!form.email.trim()) errors.email = "Email is required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = "Invalid email format";
  if (!form.phone_number.trim()) errors.phone_number = "Phone number is required";
  else if (!/^\+?\d{9,15}$/.test(form.phone_number.replace(/\s/g, "")))
    errors.phone_number = "Invalid phone format (e.g. +251911234567)";
  if (!form.password) errors.password = "Password is required";
  else if (form.password.length < 8) errors.password = "Minimum 8 characters";
  return errors;
}

export function CreateDriverDialog({
  courierCompanyId,
  open,
  onOpenChange,
}: CreateDriverDialogProps) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [createdDriver, setCreatedDriver] = useState<{ id: number; password: string } | null>(null);

  const createMutation = useCreateDriver(courierCompanyId);

  const updateField = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => { const n = { ...prev }; delete n[key]; return n; });
  };

  const handleGenerate = () => {
    const pw = generatePassword();
    updateField("password", pw);
    setShowPassword(true);
  };

  const handleSubmit = () => {
    const errs = validateForm(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    createMutation.mutate(
      {
        first_name: form.first_name.trim(),
        middle_name: form.middle_name.trim() || undefined,
        last_name: form.last_name.trim(),
        email: form.email.trim(),
        phone_number: form.phone_number.replace(/\s/g, ""),
        password: form.password,
      },
      {
        onSuccess: (driver) => {
          setCreatedDriver({ id: driver.id, password: form.password });
        },
      },
    );
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setForm(EMPTY_FORM);
      setErrors({});
      setShowPassword(false);
      setCreatedDriver(null);
      createMutation.reset();
    }, 200);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add New Driver</DialogTitle>
          <DialogDescription>
            Create a driver account for your courier company
          </DialogDescription>
        </DialogHeader>

        {createdDriver ? (
          <div className="space-y-4 py-2">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
              <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
              <div>
                <p className="text-sm font-medium text-green-700 dark:text-green-400">
                  Driver created successfully
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Driver ID: #{createdDriver.id}
                </p>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Credentials</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="font-mono">{form.email}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Password</p>
                  <p className="font-mono">{createdDriver.password}</p>
                </div>
              </div>
              <p className="text-xs text-amber-500 mt-2">
                Save these credentials — the password cannot be retrieved later.
              </p>
            </div>
            <DialogFooter>
              <Button onClick={handleClose}>Done</Button>
            </DialogFooter>
          </div>
        ) : (
          <>
            <div className="space-y-4 py-2">
              {/* Name Row */}
              <div className="grid grid-cols-3 gap-3">
                <Field
                  label="First Name *"
                  value={form.first_name}
                  onChange={(v) => updateField("first_name", v)}
                  error={errors.first_name}
                  placeholder="Abel"
                />
                <Field
                  label="Middle Name"
                  value={form.middle_name}
                  onChange={(v) => updateField("middle_name", v)}
                  placeholder="Tesfaye"
                />
                <Field
                  label="Last Name *"
                  value={form.last_name}
                  onChange={(v) => updateField("last_name", v)}
                  error={errors.last_name}
                  placeholder="Kebede"
                />
              </div>

              {/* Contact Row */}
              <div className="grid grid-cols-2 gap-3">
                <Field
                  label="Email *"
                  value={form.email}
                  onChange={(v) => updateField("email", v)}
                  error={errors.email}
                  placeholder="driver@company.com"
                  type="email"
                />
                <Field
                  label="Phone Number *"
                  value={form.phone_number}
                  onChange={(v) => updateField("phone_number", v)}
                  error={errors.phone_number}
                  placeholder="+251911234567"
                  type="tel"
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Password *</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={(e) => updateField("password", e.target.value)}
                      placeholder="Minimum 8 characters"
                      className={inputClass}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-9 gap-1.5 text-xs shrink-0"
                    onClick={handleGenerate}
                  >
                    <Shuffle className="h-3 w-3" />
                    Generate
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-xs text-destructive">{errors.password}</p>
                )}
              </div>

              {/* Mutation Error */}
              {createMutation.isError && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
                  <p className="text-sm text-destructive">
                    {createMutation.error?.message ?? "Failed to create driver"}
                  </p>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={createMutation.isPending}>
                {createMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Create Driver
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
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={inputClass}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
