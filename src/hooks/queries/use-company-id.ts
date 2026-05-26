"use client";

import { useQuery } from "@tanstack/react-query";
import { useApi } from "@/hooks/use-api";
import { useAuth } from "@/context/AuthContext";
import { normalizeCourierProfile } from "@/lib/courierProfile";

export function useCompanyId() {
  const api = useApi();
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["company-id", user?.sub],
    queryFn: async () => {
      const raw = await api.get<unknown>("couriers/profile");
      const profile = normalizeCourierProfile(raw);
      return profile?.id ?? null;
    },
    staleTime: Infinity,
    enabled: !!user,
  });

  return { companyId: data ?? undefined, isLoading: isLoading || !user };
}
