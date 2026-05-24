"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "@/hooks/use-api";
import type { Supervisor } from "@/types/api";

export interface CreateSupervisorPayload {
  first_name: string;
  middle_name?: string;
  last_name: string;
  email: string;
  phone_number: string;
  password: string;
}

export function useCreateSupervisor(companyId: number | undefined) {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateSupervisorPayload) =>
      api.post<Supervisor>(`couriers/${companyId}/supervisors/`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supervisors", companyId] });
    },
  });
}
