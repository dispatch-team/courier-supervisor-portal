"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "@/hooks/use-api";

export function useDeleteSupervisor(companyId: number | undefined) {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (supervisorId: number) =>
      api.del<void>(`couriers/${companyId}/supervisors/${supervisorId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supervisors", companyId] });
    },
  });
}
