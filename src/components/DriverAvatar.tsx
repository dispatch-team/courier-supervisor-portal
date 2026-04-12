"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

interface DriverAvatarProps {
  driverId: number;
  profilePictureId: string | null;
  initials: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-16 w-16 text-lg",
};

// Cache blob URLs to avoid refetching + strict mode double-mount issues
const blobCache = new Map<string, string>();

export function DriverAvatar({
  driverId,
  profilePictureId,
  initials,
  size = "sm",
}: DriverAvatarProps) {
  const { getValidAccessToken } = useAuth();
  const cacheKey = profilePictureId ? `${driverId}:${profilePictureId}` : null;
  const [src, setSrc] = useState<string | null>(cacheKey ? blobCache.get(cacheKey) ?? null : null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!profilePictureId || !cacheKey) return;

    // Already cached
    if (blobCache.has(cacheKey)) {
      setSrc(blobCache.get(cacheKey)!);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const token = await getValidAccessToken();
        if (!token || cancelled) return;

        const res = await fetch(
          `/api/v1/drivers/${driverId}/content/${profilePictureId}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );

        if (!res.ok || cancelled) return;

        const blob = await res.blob();
        if (cancelled) return;

        const url = URL.createObjectURL(blob);
        blobCache.set(cacheKey, url);
        setSrc(url);
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [driverId, profilePictureId, cacheKey]);

  const cls = sizeClasses[size];

  if (src && !failed) {
    return (
      <img
        src={src}
        alt={initials}
        onError={() => setFailed(true)}
        className={`${cls} rounded-full object-cover border border-border shrink-0`}
      />
    );
  }

  return (
    <div
      className={`${cls} rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary shrink-0`}
    >
      {initials}
    </div>
  );
}
