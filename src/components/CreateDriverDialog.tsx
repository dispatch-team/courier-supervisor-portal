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
  const upper = "ABCDEFGHJKMNPQRSTUVWXYZ";
  const lower = "abcdefghjkmnpqrstuvwxyz";
  const digits = "23456789";
  const special = "!@#$%^&*";
  const all = upper + lower + digits + special;

  const pick = (s: string) => s[Math.floor(Math.random() * s.length)];

  // Guarantee at least one from each required category
  const chars = [pick(upper), pick(lower), pick(digits), pick(special),
    ...Array.from({ length: 8 }, () => pick(all))];

  // Fisher-Yates shuffle
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
  vehicle_type: string;
  license_plate: string;
  emergency_contact: string;
  password: string;
  confirm_password: string;
  password_mode: "generate" | "custom";
}

const EMPTY_FORM: FormState = {
  first_name: "",
  middle_name: "",
  last_name: "",
  email: "",
  phone_number: "",
  vehicle_type: "",
  license_plate: "",
  emergency_contact: "",
  password: "",
  confirm_password: "",
  password_mode: "generate",
};

function validatePassword(password: string): string | null {
  if (!password) return "Password is required";
  if (password.length < 8) return "Must be at least 8 characters";
  if (!/[A-Z]/.test(password)) return "Must include an uppercase letter";
  if (!/[a-z]/.test(password)) return "Must include a lowercase letter";
  if (!/[0-9]/.test(password)) return "Must include a number";
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) return "Must include a special character";
  return null;
}

function validateForm(form: FormState): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!form.first_name.trim()) errors.first_name = "First name is required";
  if (!form.last_name.trim()) errors.last_name = "Last name is required";
  if (!form.email.trim()) errors.email = "Email is required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = "Invalid email format";
  if (!form.phone_number.trim()) errors.phone_number = "Phone number is required";
  else if (!/^\+?\d{9,15}$/.test(form.phone_number.replace(/\s/g, "")))
    errors.phone_number = "Invalid phone format (e.g. +251911234567)";
  if (!form.vehicle_type.trim()) errors.vehicle_type = "Vehicle type is required";
  if (!form.license_plate.trim()) errors.license_plate = "License plate is required";
  if (!form.emergency_contact.trim()) errors.emergency_contact = "Emergency contact is required";

  const pwError = validatePassword(form.password);
  if (pwError) errors.password = pwError;

  if (form.password_mode === "custom" && form.password && form.confirm_password !== form.password) {
    errors.confirm_password = "Passwords do not match";
  }

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
        vehicle_type: form.vehicle_type.trim(),
        license_plate: form.license_plate.trim(),
        emergency_contact: form.emergency_contact.trim(),
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

              {/* Vehicle & License Row */}
              <div className="grid grid-cols-2 gap-3">
                <Field
                  label="Vehicle Type *"
                  value={form.vehicle_type}
                  onChange={(v) => updateField("vehicle_type", v)}
                  error={errors.vehicle_type}
                  placeholder="Motorcycle, Car, Van..."
                />
                <Field
                  label="License Plate *"
                  value={form.license_plate}
                  onChange={(v) => updateField("license_plate", v)}
                  error={errors.license_plate}
                  placeholder="AA-12345"
                />
              </div>

              {/* Emergency Contact */}
              <Field
                label="Emergency Contact *"
                value={form.emergency_contact}
                onChange={(v) => updateField("emergency_contact", v)}
                error={errors.emergency_contact}
                placeholder="+251911234567"
                type="tel"
              />

              {/* Password Mode Toggle */}
              <div className="space-y-3">
                <label className="text-xs font-medium text-muted-foreground">Password *</label>
                <div className="flex gap-1 p-0.5 bg-muted/30 rounded-md w-fit">
                  <button
                    type="button"
                    onClick={() => {
                      const pw = generatePassword();
                      setForm((prev) => ({ ...prev, password_mode: "generate" as const, password: pw, confirm_password: "" }));
                      setShowPassword(true);
                    }}
                    className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                      form.password_mode === "generate"
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Auto-generate
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setForm((prev) => ({ ...prev, password_mode: "custom" as const, password: "", confirm_password: "" }));
                      setShowPassword(false);
                    }}
                    className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                      form.password_mode === "custom"
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Set custom
                  </button>
                </div>

                {form.password_mode === "generate" ? (
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={form.password}
                        readOnly
                        className={`${inputClass} font-mono bg-muted/30`}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-9 gap-1.5 text-xs shrink-0"
                      onClick={handleGenerate}
                    >
                      <Shuffle className="h-3 w-3" />
                      Regenerate
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={form.password}
                        onChange={(e) => updateField("password", e.target.value)}
                        placeholder="Enter password"
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
                    <input
                      type={showPassword ? "text" : "password"}
                      value={form.confirm_password}
                      onChange={(e) => updateField("confirm_password", e.target.value)}
                      placeholder="Confirm password"
                      className={inputClass}
                    />
                    {errors.confirm_password && (
                      <p className="text-xs text-destructive">{errors.confirm_password}</p>
                    )}
                    <p className="text-[11px] text-muted-foreground">
                      Min 8 chars, uppercase, lowercase, number, special character
                    </p>
                  </div>
                )}
                {errors.password && (
                  <p className="text-xs text-destructive">{errors.password}</p>
                )}
              </div>

              {/* Mutation Error */}
              {createMutation.isError && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
                  <p className="text-sm text-destructive">
                    {friendlyError(createMutation.error)}
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
