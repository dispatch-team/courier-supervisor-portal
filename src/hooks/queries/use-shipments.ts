"use client";

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useApi } from "@/hooks/use-api";
import type { ShipmentListResponse, ShipmentDetail } from "@/types/api";

export interface ShipmentFilters {
  page?: number;
  page_size?: number;
  status?: string;
  assigned_driver_id?: number;
  created_at_start?: string;
  created_at_end?: string;
}

export function buildQuery(filters: ShipmentFilters): string {
  const params = new URLSearchParams();
  if (filters.page) params.set("page", String(filters.page));
  if (filters.page_size) params.set("page_size", String(filters.page_size));
  if (filters.status) params.set("status", filters.status);
  if (filters.assigned_driver_id !== undefined)
    params.set("assigned_driver_id", String(filters.assigned_driver_id));
  if (filters.created_at_start) params.set("created_at_start", filters.created_at_start);
  if (filters.created_at_end) params.set("created_at_end", filters.created_at_end);
  const qs = params.toString();
  return `shipments${qs ? `?${qs}` : ""}`;
}

export function useShipments(filters: ShipmentFilters = {}) {
  const api = useApi();

  return useQuery({
    queryKey: ["shipments", filters],
    queryFn: () => api.get<ShipmentListResponse>(buildQuery(filters)),
    placeholderData: keepPreviousData,
  });
}

export function useShipment(code: string) {
  const api = useApi();

  return useQuery({
    queryKey: ["shipment", code],
    queryFn: () => api.get<ShipmentDetail>(`shipments/${code}`),
    enabled: !!code,
  });
}
