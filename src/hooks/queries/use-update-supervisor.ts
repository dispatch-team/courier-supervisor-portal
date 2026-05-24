"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "@/hooks/use-api";
import type { Supervisor } from "@/types/api";

export interface UpdateSupervisorPayload {
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  email?: string;
  phone_number?: string;
  status?: string;
}

export function useUpdateSupervisor(companyId: number | undefined) {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ supervisorId, payload }: { supervisorId: number; payload: UpdateSupervisorPayload }) =>
      api.patch<Supervisor>(`couriers/${companyId}/supervisors/${supervisorId}`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supervisors", companyId] });
    },
  });
}
