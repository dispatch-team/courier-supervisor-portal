"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/api-client";

export interface UpdateCourierPayload {
  company_name?: string;
  company_address?: string;
  phone_number?: string;
  email?: string;
  website_url?: string;
  max_weight?: number;
  base_price?: number;
  weight_rate?: number;
  distance_rate?: number;
  time_rate?: number;
  company_logo?: File | null;
}

export function useUpdateCourier(courierId: number | undefined) {
  const { getValidAccessToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdateCourierPayload) => {
      const token = await getValidAccessToken();
      if (!token) throw new Error("Not authenticated");

      const form = new FormData();
      for (const [key, value] of Object.entries(payload)) {
        if (key === "company_logo") {
          if (value instanceof File) form.append("company_logo", value);
        } else if (value !== undefined && value !== null && value !== "") {
          form.append(key, String(value));
        }
      }

      const res = await fetch(`/api/v1/couriers/${courierId}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new ApiError(res.status, data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company-id"] });
      queryClient.invalidateQueries({ queryKey: ["courier-profile"] });
      queryClient.invalidateQueries({ queryKey: ["courier-company-profile"] });
    },
  });
}
