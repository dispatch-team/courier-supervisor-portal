"use client";

import { useQuery } from "@tanstack/react-query";
import { useApi } from "@/hooks/use-api";
import type { Supervisor } from "@/types/api";

export function useSupervisors(companyId: number | undefined) {
  const api = useApi();

  return useQuery({
    queryKey: ["supervisors", companyId],
    queryFn: () => api.get<Supervisor[]>(`couriers/${companyId}/supervisors/`),
    enabled: !!companyId,
  });
}
