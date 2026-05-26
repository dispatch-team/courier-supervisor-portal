"use client";

import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";

function CacheInvalidator() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const prevUser = useRef(user);

  useEffect(() => {
    if (prevUser.current && !user) {
      queryClient.clear();
    }
    prevUser.current = user;
  }, [user, queryClient]);

  return null;
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={client}>
      <CacheInvalidator />
      {children}
    </QueryClientProvider>
  );
}
