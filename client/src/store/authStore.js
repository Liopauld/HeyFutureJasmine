import { create } from "zustand";

/**
 * Auth lives in memory only (never localStorage). The access token is short-lived
 * and refreshed via the httpOnly refresh cookie. `status` gates protected routes
 * until the initial refresh resolves.
 *   status: "loading" → "authenticated" | "anonymous"
 */
export const useAuthStore = create((set) => ({
  user: null,
  partner: null,
  accessToken: null,
  status: "loading",

  // Login / register: we get a fresh access token + user.
  setAuth: ({ user, accessToken }) =>
    set({ user, accessToken, status: "authenticated" }),

  // Bootstrap / profile refresh: token already set by the interceptor.
  setSession: ({ user, partner }) =>
    set({ user, partner: partner ?? null, status: "authenticated" }),

  setUser: (user) => set({ user }),
  setPartner: (partner) => set({ partner }),
  setAccessToken: (accessToken) => set({ accessToken }),
  setAnonymous: () =>
    set({ user: null, partner: null, accessToken: null, status: "anonymous" }),
  clearAuth: () =>
    set({ user: null, partner: null, accessToken: null, status: "anonymous" })
}));
