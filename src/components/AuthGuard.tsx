"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";
import type { UserRole } from "@/lib/auth";

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  loginPath: string;
}

export function AuthGuard({ children, allowedRoles, loginPath }: AuthGuardProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace(loginPath);
      return;
    }

    if (allowedRoles && user && !user.roles.some((r) => allowedRoles.includes(r))) {
      router.replace(loginPath);
    }
  }, [isAuthenticated, isLoading, user, allowedRoles, loginPath, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  if (allowedRoles && user && !user.roles.some((r) => allowedRoles.includes(r))) {
    return null;
  }

  return <>{children}</>;
}
