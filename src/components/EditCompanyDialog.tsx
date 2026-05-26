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

interface EditCompanyDialogProps {
  profile: NormalizedCourierProfile;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function EditCompanyDialog({ profile, open, onOpenChange, onSuccess }: EditCompanyDialogProps) {
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
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    }
  }, [open, profile]);

  function set(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
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
      toast({ title: "Company profile updated successfully." });
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      setError(friendlyError(err));
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Edit Company Profile
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Logo upload */}
          <div className="space-y-2">
            <Label>Company Logo</Label>
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
                  {logoPreview ? "Change logo" : "Upload logo"}
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
                    Remove
                  </Button>
                )}
                <p className="text-xs text-muted-foreground">JPG, PNG or WEBP. Max 5MB.</p>
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
              <Label htmlFor="company_name">Company Name</Label>
              <Input
                id="company_name"
                value={form.company_name}
                onChange={(e) => set("company_name", e.target.value)}
                placeholder="e.g. FastTrack Courier"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="company_address">Address</Label>
              <Input
                id="company_address"
                value={form.company_address}
                onChange={(e) => set("company_address", e.target.value)}
                placeholder="e.g. Bole, Addis Ababa"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone_number">Phone Number</Label>
              <Input
                id="phone_number"
                value={form.phone_number}
                onChange={(e) => set("phone_number", e.target.value)}
                placeholder="+251910000000"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="contact@company.com"
              />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="website_url">Website URL</Label>
              <Input
                id="website_url"
                value={form.website_url}
                onChange={(e) => set("website_url", e.target.value)}
                placeholder="https://yourcompany.com"
              />
            </div>
          </div>

          {/* Pricing */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Pricing & Capacity</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="max_weight">Max Weight (kg)</Label>
                <Input
                  id="max_weight"
                  type="number"
                  min="0"
                  step="0.1"
                  value={form.max_weight}
                  onChange={(e) => set("max_weight", e.target.value)}
                  placeholder="0"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="base_price">Base Price (ETB)</Label>
                <Input
                  id="base_price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.base_price}
                  onChange={(e) => set("base_price", e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="weight_rate">Weight Rate (ETB/kg)</Label>
                <Input
                  id="weight_rate"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.weight_rate}
                  onChange={(e) => set("weight_rate", e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="distance_rate">Distance Rate (ETB/km)</Label>
                <Input
                  id="distance_rate"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.distance_rate}
                  onChange={(e) => set("distance_rate", e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="time_rate">Time Rate (ETB/min)</Label>
                <Input
                  id="time_rate"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.time_rate}
                  onChange={(e) => set("time_rate", e.target.value)}
                  placeholder="0.00"
                />
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
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
