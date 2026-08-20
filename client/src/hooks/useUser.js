import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../lib/api.js";
import { useAuthStore } from "../store/authStore.js";

export function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: async () => (await api.get("/users/me")).data
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);
  return useMutation({
    mutationFn: async (payload) => (await api.patch("/users/me", payload)).data.user,
    onSuccess: (user) => {
      setUser(user);
      queryClient.invalidateQueries({ queryKey: ["me"] });
    }
  });
}

// ── Partner pairing ──────────────────────────────────────
export function useCreatePairInvite() {
  return useMutation({
    mutationFn: async () => (await api.post("/users/me/pair/invite")).data.code
  });
}

export function useAcceptPairInvite() {
  const queryClient = useQueryClient();
  const setPartner = useAuthStore((s) => s.setPartner);
  return useMutation({
    mutationFn: async (code) => (await api.post("/users/me/pair/accept", { code })).data.partner,
    onSuccess: (partner) => {
      setPartner(partner);
      queryClient.invalidateQueries({ queryKey: ["me"] });
    }
  });
}

export function useUnpair() {
  const queryClient = useQueryClient();
  const setPartner = useAuthStore((s) => s.setPartner);
  return useMutation({
    mutationFn: async () => api.delete("/users/me/pair"),
    onSuccess: () => {
      setPartner(null);
      queryClient.invalidateQueries({ queryKey: ["me"] });
    }
  });
}

// ── Crew (saved contacts) ────────────────────────────────
export function useCrew() {
  return useQuery({
    queryKey: ["crew"],
    queryFn: async () => (await api.get("/users/me/crew")).data.crewMembers
  });
}

export function useAddCrewMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => (await api.post("/users/me/crew", payload)).data.crewMembers,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crew"] });
      queryClient.invalidateQueries({ queryKey: ["me"] });
    }
  });
}

export function useRemoveCrewMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => api.delete(`/users/me/crew/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crew"] });
      queryClient.invalidateQueries({ queryKey: ["me"] });
    }
  });
}
