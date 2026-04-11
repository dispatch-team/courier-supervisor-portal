"use client";

import { useQuery } from "@tanstack/react-query";
import { useApi } from "@/hooks/use-api";
import type { CourierCompany } from "@/types/api";

export function useCourierProfile(courierCompanyId: number | undefined) {
  const api = useApi();

  return useQuery({
    queryKey: ["courier-profile", courierCompanyId],
    queryFn: () => api.get<CourierCompany>(`couriers/${courierCompanyId}`),
    enabled: !!courierCompanyId,
  });
}
