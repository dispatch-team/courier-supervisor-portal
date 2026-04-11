"use client";

import { useQuery } from "@tanstack/react-query";
import { useApi } from "@/hooks/use-api";
import type { ShipmentListResponse } from "@/types/api";

/**
 * Resolves the current supervisor's courier company ID.
 * Since there's no /couriers/profile endpoint, we extract it
 * from the first shipment returned by the shipments API.
 */
export function useCompanyId() {
  const api = useApi();

  const { data, isLoading } = useQuery({
    queryKey: ["company-id"],
    queryFn: async () => {
      const res = await api.get<ShipmentListResponse>("shipments?page=1&page_size=1");
      return res.shipments?.[0]?.courier_company_id ?? null;
    },
    staleTime: Infinity,
  });

  return { companyId: data ?? undefined, isLoading };
}
