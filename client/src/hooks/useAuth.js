import api from "../lib/api.js";
import { useAuthStore } from "../store/authStore.js";

export function useAuth() {
  const { setUser, setAccessToken, clearAuth } = useAuthStore();

  const register = async (payload) => {
    const { data } = await api.post("/auth/register", payload);
    setAccessToken(data.accessToken);
    setUser(data.user);
    return data;
  };

  const login = async (payload) => {
    const { data } = await api.post("/auth/login", payload);
    setAccessToken(data.accessToken);
    setUser(data.user);
    return data;
  };

  const logout = async () => {
    await api.post("/auth/logout");
    clearAuth();
  };

  return { register, login, logout };
}
