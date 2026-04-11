"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "@/hooks/use-api";
import type { ShipmentDetail } from "@/types/api";

interface AssignDriverParams {
  shipmentCode: string;
  driverId: number;
}

export function useAssignDriver() {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ shipmentCode, driverId }: AssignDriverParams) =>
      api.post<ShipmentDetail>(`shipments/${shipmentCode}/assign-driver`, {
        driver_id: driverId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shipments"] });
      queryClient.invalidateQueries({ queryKey: ["shipment"] });
    },
  });
}
