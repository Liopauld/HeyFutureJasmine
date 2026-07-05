import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../lib/api.js";

export function useLetters() {
  return useQuery({
    queryKey: ["letters"],
    queryFn: async () => (await api.get("/letters")).data.letters
  });
}

export function useLetter(id) {
  return useQuery({
    queryKey: ["letter", id],
    enabled: Boolean(id),
    retry: false,
    queryFn: async () => (await api.get(`/letters/${id}`)).data.letter
  });
}

export function useLetterByToken(token) {
  return useQuery({
    queryKey: ["unlock", token],
    enabled: Boolean(token),
    retry: false,
    queryFn: async () => (await api.get(`/letters/unlock/${token}`)).data.letter
  });
}

export function useCreateLetter() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => (await api.post("/letters", payload)).data.letter,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["letters"] })
  });
}

export function useDeleteLetter() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => api.delete(`/letters/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["letters"] })
  });
}

/** Dev-only: force a letter to deliver now so the reveal can be tested. */
export function useForceDeliver() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => (await api.post(`/dev/deliver/${id}`)).data,
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ["letters"] });
      queryClient.invalidateQueries({ queryKey: ["letter", id] });
    }
  });
}
