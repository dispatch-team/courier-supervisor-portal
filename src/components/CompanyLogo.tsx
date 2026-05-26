"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

const blobCache = new Map<string, string>();

interface CompanyLogoProps {
  logoId: string | null;
  companyName: string;
  className?: string;
}

export function CompanyLogo({ logoId, companyName, className }: CompanyLogoProps) {
  const { getValidAccessToken } = useAuth();
  const [src, setSrc] = useState<string | null>(logoId ? (blobCache.get(logoId) ?? null) : null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!logoId) return;
    setFailed(false);

    if (blobCache.has(logoId)) {
      setSrc(blobCache.get(logoId)!);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const token = await getValidAccessToken();
        if (!token || cancelled) return;

        const res = await fetch(`/api/v1/couriers/logos/${encodeURIComponent(logoId)}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok || cancelled) return;

        const blob = await res.blob();
        if (cancelled) return;

        const url = URL.createObjectURL(blob);
        blobCache.set(logoId, url);
        setSrc(url);
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [logoId, getValidAccessToken]);

  if (src && !failed) {
    return (
      <img
        src={src}
        alt={companyName}
        onError={() => setFailed(true)}
        className={cn("object-contain", className)}
      />
    );
  }

  return (
    <div className={cn("flex items-center justify-center bg-primary/10 text-primary rounded-xl", className)}>
      <Building2 className="h-1/2 w-1/2" />
    </div>
  );
}
