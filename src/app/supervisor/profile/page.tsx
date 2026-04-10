"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  Star,
  Truck,
  Scale,
  Clock,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthGuard } from "@/components/AuthGuard";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/intl";
import {
  type NormalizedCourierProfile,
  courierApiErrorMessage,
  isProfileIncomplete,
} from "@/lib/courierProfile";
import dispatchLogo from "@/assets/dispatch-logo.png";

export default function CourierProfilePage() {
  const { user, getValidAccessToken } = useAuth();
  const t = useI18n("profile");
  const router = useRouter();

  const [profile, setProfile] = useState<NormalizedCourierProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        const body = await res.json().catch(() => ({}));
        setError(courierApiErrorMessage(body));
      }
    } catch (err) {
      console.error("Failed to fetch courier profile:", err);
      setError("Failed to load profile");
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
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-lg font-semibold mb-2">Error Loading Profile</h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={handleRetry} className="w-full">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-lg font-semibold mb-2">No Profile Data</h2>
            <p className="text-muted-foreground mb-6">
              Profile data is unavailable. Contact Admin.
            </p>
            <Button onClick={() => router.push("/supervisor")} className="w-full">
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const incomplete = isProfileIncomplete(profile);

  return (
    <AuthGuard allowedRoles={["courier"]} loginPath="/login/supervisor">
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        {/* Background blobs */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/3 w-[500px] h-[350px] bg-primary/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[300px] bg-accent/5 rounded-full blur-[100px]" />
        </div>

        {/* Header */}
        <header className="relative z-20 border-b border-border/40 bg-background/80 backdrop-blur-md sticky top-0">
          <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push("/supervisor")}
                className="h-8 w-8 rounded-lg"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-3">
                <img src={dispatchLogo.src} alt="Dispatch" className="h-7 w-auto" />
                <span className="text-xs text-muted-foreground/50 font-medium uppercase tracking-widest hidden sm:block">
                  Supervisor
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="relative z-10 flex-1 max-w-3xl w-full mx-auto px-6 py-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
            <p className="text-muted-foreground">{t("subtitle")}</p>
          </div>

          {/* Incomplete Warning */}
          {incomplete && (
            <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-destructive">Profile incomplete</p>
                <p className="text-sm text-muted-foreground">
                  Contact Admin to complete your company profile.
                </p>
              </div>
            </div>
          )}

          {/* Company Information Card */}
          <Card className="border-border/40 bg-card/60 backdrop-blur-sm shadow-xl mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                {t("companyInfo")}
              </CardTitle>
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
          <Card className="border-border/40 bg-card/60 backdrop-blur-sm shadow-xl mb-6">
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

          {/* Operational Zones Card */}
          <Card className="border-border/40 bg-card/60 backdrop-blur-sm shadow-xl mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                {t("operationalZones")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {t("operationalZonesDesc") || "Operational zones information not available."}
              </p>
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
                        ? `${profile.rating_aggregate.toFixed(1)} / 5`
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
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("weightRate")}</span>
                    <span className="font-medium">
                      {profile.weight_rate > 0 ? `ETB ${profile.weight_rate}/kg` : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("distanceRate")}</span>
                    <span className="font-medium">
                      {profile.distance_rate > 0 ? `ETB ${profile.distance_rate}/km` : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("timeRate")}</span>
                    <span className="font-medium">
                      {profile.time_rate > 0 ? `ETB ${profile.time_rate}/min` : "—"}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </AuthGuard>
  );
}
