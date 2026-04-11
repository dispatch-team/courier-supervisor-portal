"use client";

import { useQuery } from "@tanstack/react-query";
import { useApi } from "@/hooks/use-api";
import type { ShipmentListResponse, Shipment } from "@/types/api";

interface ShipmentFilters {
  page?: number;
  page_size?: number;
  status?: string;
}

function buildQuery(filters: ShipmentFilters): string {
  const params = new URLSearchParams();
  if (filters.page) params.set("page", String(filters.page));
  if (filters.page_size) params.set("page_size", String(filters.page_size));
  if (filters.status) params.set("status", filters.status);
  const qs = params.toString();
  return `shipments${qs ? `?${qs}` : ""}`;
}

export function useShipments(filters: ShipmentFilters = {}) {
  const api = useApi();

  return useQuery({
    queryKey: ["shipments", filters],
    queryFn: () => api.get<ShipmentListResponse>(buildQuery(filters)),
  });
}

export function useShipment(code: string) {
  const api = useApi();

  return useQuery({
    queryKey: ["shipment", code],
    queryFn: () => api.get<Shipment>(`shipments/${code}`),
    enabled: !!code,
  });
}
