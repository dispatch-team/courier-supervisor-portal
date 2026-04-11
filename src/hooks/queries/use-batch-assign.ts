"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "@/hooks/use-api";
import { ApiError } from "@/lib/api-client";
import type { ShipmentDetail } from "@/types/api";

export interface BatchResult {
  code: string;
  success: boolean;
  error?: string;
}

interface BatchAssignParams {
  shipmentCodes: string[];
  driverId: number;
}

export function useBatchAssignDriver() {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ shipmentCodes, driverId }: BatchAssignParams): Promise<BatchResult[]> => {
      const results: BatchResult[] = [];

      for (const code of shipmentCodes) {
        try {
          await api.post<ShipmentDetail>(`shipments/${code}/assign-driver`, {
            driver_id: driverId,
          });
          results.push({ code, success: true });
        } catch (err) {
          const message =
            err instanceof ApiError ? err.message : "Unknown error";
          results.push({ code, success: false, error: message });
        }
      }

      return results;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shipments"] });
      queryClient.invalidateQueries({ queryKey: ["shipment"] });
    },
  });
}
