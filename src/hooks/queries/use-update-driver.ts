"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import type { Driver } from "@/types/api";

interface UpdateDriverParams {
  courierCompanyId: number;
  driverId: number;
  data: {
    first_name?: string;
    middle_name?: string;
    last_name?: string;
    email?: string;
    phone_number?: string;
    status?: string;
  };
  profilePicture?: File;
}

export function useUpdateDriver() {
  const { getValidAccessToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ courierCompanyId, driverId, data, profilePicture }: UpdateDriverParams) => {
      const token = await getValidAccessToken();
      const formData = new FormData();

      for (const [key, value] of Object.entries(data)) {
        if (value !== undefined && value !== null) formData.append(key, value);
      }

      if (profilePicture) {
        formData.append("profile_picture", profilePicture);
      }

      const res = await fetch(`/api/v1/couriers/${courierCompanyId}/drivers/${driverId}`, {
        method: "PATCH",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          (json as Record<string, unknown>).message as string ??
          (json as Record<string, unknown>).error as string ??
          "Failed to update driver",
        );
      }

      return (json.data ?? json) as Driver;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
    },
  });
}
