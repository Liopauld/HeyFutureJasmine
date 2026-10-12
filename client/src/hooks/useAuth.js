import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import api from "../lib/api.js";
import { useAuthStore } from "../store/authStore.js";

export function useAuth() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const partner = useAuthStore((s) => s.partner);
  const status = useAuthStore((s) => s.status);
  const setAuth = useAuthStore((s) => s.setAuth);
  const setAnonymous = useAuthStore((s) => s.setAnonymous);

  const register = async (payload) => {
    const { data } = await api.post("/auth/register", payload);
    queryClient.clear();
    setAuth(data);
    return data;
  };

  const login = async (payload) => {
    const { data } = await api.post("/auth/login", payload);
    queryClient.clear();
    setAuth(data);
    return data;
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      /* ignore — clear locally regardless */
    }
    setAnonymous();
    queryClient.clear();
  };

  return {
    user,
    partner,
    status,
    isAuthenticated: status === "authenticated",
    register,
    login,
    logout
  };
}

/**
 * Runs once on app mount: hit /users/me. If there's a valid refresh cookie the
 * 401 interceptor silently refreshes and the call succeeds; otherwise we settle
 * into the anonymous state. Either way, `status` leaves "loading".
 */
export function useAuthBootstrap() {
  const status = useAuthStore((s) => s.status);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { data } = await api.get("/users/me");
        if (active) useAuthStore.getState().setSession({ user: data.user, partner: data.partner });
      } catch {
        if (active) useAuthStore.getState().setAnonymous();
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return status;
}
