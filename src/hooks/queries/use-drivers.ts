"use client";

import { useQuery } from "@tanstack/react-query";
import { useApi } from "@/hooks/use-api";
import type { Driver } from "@/types/api";

export function useDrivers(courierCompanyId: number | undefined) {
  const api = useApi();

  return useQuery({
    queryKey: ["drivers", courierCompanyId],
    queryFn: () => api.get<Driver[]>(`couriers/${courierCompanyId}/drivers/`),
    enabled: !!courierCompanyId,
  });
}

export function useDriver(courierCompanyId: number | undefined, driverId: number | undefined) {
  const api = useApi();

  return useQuery({
    queryKey: ["driver", courierCompanyId, driverId],
    queryFn: () =>
      api.get<Driver>(`couriers/${courierCompanyId}/drivers/${driverId}`),
    enabled: !!courierCompanyId && !!driverId,
  });
}
