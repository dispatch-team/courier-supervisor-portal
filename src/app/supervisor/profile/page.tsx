"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  Star,
  Truck,
  Scale,
  AlertCircle,
  Loader2,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/intl";
import {
  type NormalizedCourierProfile,
  isProfileIncomplete,
} from "@/lib/courierProfile";
import { ApiError, friendlyError } from "@/lib/api-client";
import { CompanyLogo } from "@/components/CompanyLogo";
import { EditCompanyDialog } from "@/components/EditCompanyDialog";
import { useIsOwner } from "@/hooks/queries/use-is-owner";

export default function CourierProfilePage() {
  const { user, getValidAccessToken } = useAuth();
  const t = useI18n("profile");
  const router = useRouter();
  const { isOwner } = useIsOwner();

  const [profile, setProfile] = useState<NormalizedCourierProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = await getValidAccessToken();
      if (!token) return;

      const res = await fetch("/api/courier/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setProfile(data);
      } else {
        setError(friendlyError(new ApiError(res.status, {})));
      }
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    setIsLoading(true);
    fetchProfile();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-lg font-semibold mb-2">{t("errorLoading")}</h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={handleRetry} className="w-full">
              {t("tryAgain")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-lg font-semibold mb-2">{t("noProfileData")}</h2>
            <p className="text-muted-foreground mb-6">
              {t("noProfileDataDesc")}
            </p>
            <Button onClick={() => router.push("/supervisor")} className="w-full">
              {t("returnToDashboard")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const incomplete = isProfileIncomplete(profile);

  return (
    <>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </div>

        {/* Incomplete Warning */}
        {incomplete && (
          <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-destructive">{t("incomplete.title")}</p>
              <p className="text-sm text-muted-foreground">
                {t("incomplete.description")}
              </p>
            </div>
          </div>
        )}

        {/* Company Information Card */}
        <Card className="border-border/40 bg-card/60 backdrop-blur-sm shadow-xl">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <CompanyLogo
                  logoId={profile.company_logo_id}
                  companyName={profile.company_name}
                  className="h-16 w-16 rounded-xl border border-border/40"
                />
                <CardTitle className="text-lg flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  {t("companyInfo")}
                </CardTitle>
              </div>
              {isOwner && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 shrink-0"
                  onClick={() => setEditOpen(true)}
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{t("companyName")}</p>
                <p className="font-medium">{profile.company_name || "—"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{t("status")}</p>
                <p className="font-medium capitalize">{profile.status || "—"}</p>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">{t("companyAddress")}</p>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <p className="font-medium">{profile.company_address || "—"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information Card */}
        <Card className="border-border/40 bg-card/60 backdrop-blur-sm shadow-xl">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Phone className="h-5 w-5 text-primary" />
              {t("contactInfo")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{t("supportPhone")}</p>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <p className="font-medium">{profile.phone_number || "—"}</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{t("email")}</p>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <p className="font-medium">{profile.email || "—"}</p>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">{t("website")}</p>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <p className="font-medium">
                  {profile.website_url ? (
                    <a
                      href={profile.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {profile.website_url}
                    </a>
                  ) : (
                    "—"
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rating & Pricing Card */}
        <Card className="border-border/40 bg-card/60 backdrop-blur-sm shadow-xl">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Star className="h-5 w-5 text-primary" />
              {t("ratingPricing")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{t("rating")}</p>
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <p className="font-medium">
                    {profile.rating_aggregate > 0
                      ? `${(profile.rating_aggregate / 2).toFixed(1)} / 5`
                      : "—"}
                    {profile.rating_count > 0 && (
                      <span className="text-sm text-muted-foreground ml-1">
                        ({profile.rating_count} {t("reviews")})
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{t("maxWeight")}</p>
                <div className="flex items-center gap-2">
                  <Scale className="h-4 w-4 text-muted-foreground" />
                  <p className="font-medium">
                    {profile.max_weight > 0 ? `${profile.max_weight} kg` : "—"}
                  </p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{t("basePrice")}</p>
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-muted-foreground" />
                  <p className="font-medium">
                    {profile.base_price > 0 ? `ETB ${profile.base_price}` : "—"}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-border/40 pt-4">
              <p className="text-sm text-muted-foreground mb-3">{t("rateDetails")}</p>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">{t("weightRate")}</p>
                  <p className="font-semibold">
                    {profile.weight_rate > 0 ? `ETB ${profile.weight_rate}` : "—"}
                  </p>
                  {profile.weight_rate > 0 && <p className="text-xs text-muted-foreground">per kg</p>}
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">{t("distanceRate")}</p>
                  <p className="font-semibold">
                    {profile.distance_rate > 0 ? `ETB ${profile.distance_rate}` : "—"}
                  </p>
                  {profile.distance_rate > 0 && <p className="text-xs text-muted-foreground">per km</p>}
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">{t("timeRate")}</p>
                  <p className="font-semibold">
                    {profile.time_rate > 0 ? `ETB ${profile.time_rate}` : "—"}
                  </p>
                  {profile.time_rate > 0 && <p className="text-xs text-muted-foreground">per min</p>}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {profile && (
        <EditCompanyDialog
          profile={profile}
          open={editOpen}
          onOpenChange={setEditOpen}
          onSuccess={fetchProfile}
        />
      )}
    </>
  );
}
