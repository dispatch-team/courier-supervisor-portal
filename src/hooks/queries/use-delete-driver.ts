"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "@/hooks/use-api";

interface DeleteDriverParams {
  courierCompanyId: number;
  driverId: number;
}

export function useDeleteDriver() {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ courierCompanyId, driverId }: DeleteDriverParams) =>
      api.del(`couriers/${courierCompanyId}/drivers/${driverId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
    },
  });
}
