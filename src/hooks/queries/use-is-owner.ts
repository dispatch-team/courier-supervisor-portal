"use client";

import { useAuth } from "@/context/AuthContext";
import { useCompanyId } from "@/hooks/queries/use-company-id";
import { useSupervisors } from "@/hooks/queries/use-supervisors";
import { useApi } from "@/hooks/use-api";
import { useQuery } from "@tanstack/react-query";
import { normalizeCourierProfile } from "@/lib/courierProfile";

export function useIsOwner() {
  const { user } = useAuth();
  const { companyId } = useCompanyId();
  const { data: supervisors } = useSupervisors(companyId);

  const api = useApi();
  const { data: profile } = useQuery({
    queryKey: ["courier-company-profile"],
    queryFn: async () => {
      const raw = await api.get<unknown>("couriers/profile");
      return normalizeCourierProfile(raw);
    },
    staleTime: Infinity,
  });

  const mySupervisor = supervisors?.find((s) => s.keycloak_id === user?.sub);
  const isOwner = !!mySupervisor && mySupervisor.id === profile?.owner_supervisor_id;

  return { isOwner, mySupervisorId: mySupervisor?.id };
}
