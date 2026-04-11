"use client";

import { useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { createApiClient } from "@/lib/api-client";

export function useApi() {
  const { getValidAccessToken } = useAuth();
  return useMemo(() => createApiClient(getValidAccessToken), [getValidAccessToken]);
}
