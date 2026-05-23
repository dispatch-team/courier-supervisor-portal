"use client";

import { useQuery } from "@tanstack/react-query";
import { useApi } from "@/hooks/use-api";
import { normalizeCourierProfile } from "@/lib/courierProfile";

export function useCompanyId() {
  const api = useApi();

  const { data, isLoading } = useQuery({
    queryKey: ["company-id"],
    queryFn: async () => {
      const raw = await api.get<unknown>("couriers/profile");
      const profile = normalizeCourierProfile(raw);
      return profile?.id ?? null;
    },
    staleTime: Infinity,
  });

  return { companyId: data ?? undefined, isLoading };
}
