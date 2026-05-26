"use client";

import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, Upload, X, Loader2, AlertCircle } from "lucide-react";
import { useUpdateCourier } from "@/hooks/queries/use-update-courier";
import { useToast } from "@/components/ui/use-toast";
import { friendlyError } from "@/lib/api-client";
import type { NormalizedCourierProfile } from "@/lib/courierProfile";
import { cn } from "@/lib/utils";
import { validatePhone, validateEmail, validateUrl } from "@/lib/validation";
import { useI18n, useTranslateValidationError } from "@/intl";

interface EditCompanyDialogProps {
  profile: NormalizedCourierProfile;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function EditCompanyDialog({ profile, open, onOpenChange, onSuccess }: EditCompanyDialogProps) {
  const t = useI18n("profile");
  const tVal = useTranslateValidationError();
  const { toast } = useToast();
  const { mutateAsync, isPending } = useUpdateCourier(profile.id);

  const [form, setForm] = useState({
    company_name: profile.company_name,
    company_address: profile.company_address,
    phone_number: profile.phone_number,
    email: profile.email,
    website_url: profile.website_url,
    max_weight: profile.max_weight > 0 ? String(profile.max_weight) : "",
    base_price: profile.base_price > 0 ? String(profile.base_price) : "",
    weight_rate: profile.weight_rate > 0 ? String(profile.weight_rate) : "",
    distance_rate: profile.distance_rate > 0 ? String(profile.distance_rate) : "",
    time_rate: profile.time_rate > 0 ? String(profile.time_rate) : "",
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  function validateForm(): Record<string, string> {
    const e: Record<string, string> = {};
    if (!form.company_name.trim()) e.company_name = "Company name is required";
    if (!form.company_address.trim()) e.company_address = "Address is required";
    const phoneErr = validatePhone(form.phone_number); if (phoneErr) e.phone_number = phoneErr;
    const emailErr = validateEmail(form.email, false); if (emailErr) e.email = emailErr;
    const urlErr = validateUrl(form.website_url, false); if (urlErr) e.website_url = urlErr;
    if (form.max_weight && Number(form.max_weight) > 10_000) e.max_weight = "Max weight cannot exceed 10,000 kg";
    if (form.base_price && Number(form.base_price) > 100_000) e.base_price = "Base price cannot exceed 100,000 ETB";
    if (form.weight_rate && Number(form.weight_rate) > 10_000) e.weight_rate = "Weight rate cannot exceed 10,000 ETB/kg";
    if (form.distance_rate && Number(form.distance_rate) > 10_000) e.distance_rate = "Distance rate cannot exceed 10,000 ETB/km";
    if (form.time_rate && Number(form.time_rate) > 10_000) e.time_rate = "Time rate cannot exceed 10,000 ETB/min";
    return e;
  }

  useEffect(() => {
    if (open) {
      setForm({
        company_name: profile.company_name,
        company_address: profile.company_address,
        phone_number: profile.phone_number,
        email: profile.email,
        website_url: profile.website_url,
        max_weight: profile.max_weight > 0 ? String(profile.max_weight) : "",
        base_price: profile.base_price > 0 ? String(profile.base_price) : "",
        weight_rate: profile.weight_rate > 0 ? String(profile.weight_rate) : "",
        distance_rate: profile.distance_rate > 0 ? String(profile.distance_rate) : "",
        time_rate: profile.time_rate > 0 ? String(profile.time_rate) : "",
      });
      setLogoFile(null);
      setLogoPreview(null);
      setError(null);
      setFieldErrors({});
    }
  }, [open, profile]);

  function set(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    if (fieldErrors[key]) setFieldErrors((p) => { const n = { ...p }; delete n[key]; return n; });
  }

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    const url = URL.createObjectURL(file);
    setLogoPreview(url);
  }

  function clearLogo() {
    setLogoFile(null);
    setLogoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const errs = validateForm();
    if (Object.keys(errs).length > 0) { setFieldErrors(errs); return; }
    setFieldErrors({});
    try {
      await mutateAsync({
        company_name: form.company_name,
        company_address: form.company_address,
        phone_number: form.phone_number,
        email: form.email,
        website_url: form.website_url,
        max_weight: form.max_weight ? Number(form.max_weight) : undefined,
        base_price: form.base_price ? Number(form.base_price) : undefined,
        weight_rate: form.weight_rate ? Number(form.weight_rate) : undefined,
        distance_rate: form.distance_rate ? Number(form.distance_rate) : undefined,
        time_rate: form.time_rate ? Number(form.time_rate) : undefined,
        company_logo: logoFile,
      });
      toast({ title: t("editDialog.success") });
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      setError(friendlyError(err));
    }
  }

  const translateFieldError = (fieldName: string, rawError: string) => {
    if (rawError === "Company name is required") return t("editDialog.errors.companyNameRequired");
    if (rawError === "Address is required") return t("editDialog.errors.addressRequired");
    if (rawError === "Max weight cannot exceed 10,000 kg") return t("editDialog.errors.maxWeightExceeded");
    if (rawError === "Base price cannot exceed 100,000 ETB") return t("editDialog.errors.basePriceExceeded");
    if (rawError === "Weight rate cannot exceed 10,000 ETB/kg") return t("editDialog.errors.weightRateExceeded");
    if (rawError === "Distance rate cannot exceed 10,000 ETB/km") return t("editDialog.errors.distanceRateExceeded");
    if (rawError === "Time rate cannot exceed 10,000 ETB/min") return t("editDialog.errors.timeRateExceeded");
    return tVal(rawError);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            {t("editDialog.title")}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Logo upload */}
          <div className="space-y-2">
            <Label>{t("editDialog.logo")}</Label>
            <div className="flex items-center gap-4">
              <div className={cn(
                "h-20 w-20 rounded-xl border-2 border-dashed border-border flex items-center justify-center overflow-hidden shrink-0",
                logoPreview ? "border-primary/40" : "bg-muted/30"
              )}>
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo preview" className="h-full w-full object-contain" />
                ) : (
                  <Building2 className="h-8 w-8 text-muted-foreground/40" />
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1.5 w-fit"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-3.5 w-3.5" />
                  {logoPreview ? t("editDialog.changeLogo") : t("editDialog.uploadLogo")}
                </Button>
                {logoPreview && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 w-fit text-muted-foreground hover:text-destructive"
                    onClick={clearLogo}
                  >
                    <X className="h-3.5 w-3.5" />
                    {t("editDialog.remove")}
                  </Button>
                )}
                <p className="text-xs text-muted-foreground">{t("editDialog.logoTip")}</p>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleLogoChange}
            />
          </div>

          {/* Company info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="company_name">{t("editDialog.companyName")}</Label>
              <Input
                id="company_name"
                value={form.company_name}
                onChange={(e) => set("company_name", e.target.value)}
                placeholder="e.g. FastTrack Courier"
                maxLength={100}
                className={fieldErrors.company_name ? "border-destructive/60" : ""}
              />
              {fieldErrors.company_name && <p className="text-xs text-destructive">{translateFieldError("company_name", fieldErrors.company_name)}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="company_address">{t("editDialog.address")}</Label>
              <Input
                id="company_address"
                value={form.company_address}
                onChange={(e) => set("company_address", e.target.value)}
                placeholder="e.g. Bole, Addis Ababa"
                maxLength={200}
                className={fieldErrors.company_address ? "border-destructive/60" : ""}
              />
              {fieldErrors.company_address && <p className="text-xs text-destructive">{translateFieldError("company_address", fieldErrors.company_address)}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone_number">{t("editDialog.phone")}</Label>
              <Input
                id="phone_number"
                value={form.phone_number}
                onChange={(e) => set("phone_number", e.target.value)}
                placeholder="09XXXXXXXX or +2519XXXXXXXX"
                className={fieldErrors.phone_number ? "border-destructive/60" : ""}
              />
              {fieldErrors.phone_number && <p className="text-xs text-destructive">{translateFieldError("phone_number", fieldErrors.phone_number)}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">{t("editDialog.email")}</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="contact@company.com"
                maxLength={255}
                className={fieldErrors.email ? "border-destructive/60" : ""}
              />
              {fieldErrors.email && <p className="text-xs text-destructive">{translateFieldError("email", fieldErrors.email)}</p>}
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="website_url">{t("editDialog.website")}</Label>
              <Input
                id="website_url"
                value={form.website_url}
                onChange={(e) => set("website_url", e.target.value)}
                placeholder="https://yourcompany.com"
                className={fieldErrors.website_url ? "border-destructive/60" : ""}
              />
              {fieldErrors.website_url && <p className="text-xs text-destructive">{translateFieldError("website_url", fieldErrors.website_url)}</p>}
            </div>
          </div>

          {/* Pricing */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">{t("editDialog.pricingSection")}</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="max_weight">{t("editDialog.maxWeight")}</Label>
                <Input
                  id="max_weight"
                  type="number"
                  min="0"
                  max="10000"
                  step="0.1"
                  value={form.max_weight}
                  onChange={(e) => set("max_weight", e.target.value)}
                  placeholder="0"
                />
                {fieldErrors.max_weight && <p className="text-xs text-destructive">{translateFieldError("max_weight", fieldErrors.max_weight)}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="base_price">{t("editDialog.basePrice")}</Label>
                <Input
                  id="base_price"
                  type="number"
                  min="0"
                  max="100000"
                  step="0.01"
                  value={form.base_price}
                  onChange={(e) => set("base_price", e.target.value)}
                  placeholder="0.00"
                />
                {fieldErrors.base_price && <p className="text-xs text-destructive">{translateFieldError("base_price", fieldErrors.base_price)}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="weight_rate">{t("editDialog.weightRate")}</Label>
                <Input
                  id="weight_rate"
                  type="number"
                  min="0"
                  max="10000"
                  step="0.01"
                  value={form.weight_rate}
                  onChange={(e) => set("weight_rate", e.target.value)}
                  placeholder="0.00"
                />
                 {fieldErrors.weight_rate && <p className="text-xs text-destructive">{translateFieldError("weight_rate", fieldErrors.weight_rate)}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="distance_rate">{t("editDialog.distanceRate")}</Label>
                <Input
                  id="distance_rate"
                  type="number"
                  min="0"
                  max="10000"
                  step="0.01"
                  value={form.distance_rate}
                  onChange={(e) => set("distance_rate", e.target.value)}
                  placeholder="0.00"
                />
                {fieldErrors.distance_rate && <p className="text-xs text-destructive">{translateFieldError("distance_rate", fieldErrors.distance_rate)}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="time_rate">{t("editDialog.timeRate")}</Label>
                <Input
                  id="time_rate"
                  type="number"
                  min="0"
                  max="10000"
                  step="0.01"
                  value={form.time_rate}
                  onChange={(e) => set("time_rate", e.target.value)}
                  placeholder="0.00"
                />
                {fieldErrors.time_rate && <p className="text-xs text-destructive">{translateFieldError("time_rate", fieldErrors.time_rate)}</p>}
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
              {t("editDialog.cancel")}
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {t("editDialog.submit")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
