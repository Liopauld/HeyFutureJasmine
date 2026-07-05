import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/authStore.js";
import LoadingCompass from "../common/LoadingCompass.jsx";

/** Gates a route: waits for bootstrap, then redirects anonymous users to /login. */
export default function RequireAuth({ children }) {
  const status = useAuthStore((s) => s.status);
  const location = useLocation();

  if (status === "loading") return <LoadingCompass full label="Finding your bearings…" />;
  if (status !== "authenticated") {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return children;
}
