"use client";

import { createContext, useContext } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { User } from "@/lib/types";

const AuthContext = createContext<{ user: User | null; loading: boolean; refresh: () => Promise<unknown>; setUser: (user: User | null) => void }>({ user: null, loading: true, refresh: async () => undefined, setUser: () => undefined });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ["me"], queryFn: () => api<User | null>("/api/users/me"), retry: false });
  return <AuthContext.Provider value={{ user: query.data ?? null, loading: query.isLoading, refresh: () => queryClient.invalidateQueries({ queryKey: ["me"] }), setUser: (user) => queryClient.setQueryData(["me"], user) }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
