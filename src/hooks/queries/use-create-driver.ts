"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "@/hooks/use-api";
import type { Driver } from "@/types/api";

export interface CreateDriverPayload {
  first_name: string;
  middle_name?: string;
  last_name: string;
  email: string;
  phone_number: string;
  password: string;
}

export function useCreateDriver(courierCompanyId: number | undefined) {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateDriverPayload) =>
      api.post<Driver>(`couriers/${courierCompanyId}/drivers/`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
    },
  });
}
