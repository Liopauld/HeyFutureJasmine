import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../lib/api.js";
import AuthShell from "../../components/auth/AuthShell.jsx";
import LoadingCompass from "../../components/common/LoadingCompass.jsx";
import { useAuthStore } from "../../store/authStore.js";

// Share the request across React StrictMode's effect replay; verification consumes a token.
const verifications = new Map();
function verify(token) {
  if (!verifications.has(token)) {
    const request = api.get(`/auth/verify-email/${token}`).catch((error) => {
      verifications.delete(token);
      throw error;
    });
    verifications.set(token, request);
  }
  return verifications.get(token);
}

export default function VerifyEmail() {
  const { token } = useParams();
  const [status, setStatus] = useState("verifying");

  useEffect(() => {
    let active = true;
    verify(token)
      .then(async () => {
        if (!active) return;
        setStatus("ok");
        if (useAuthStore.getState().status === "authenticated") {
          try {
            const { data } = await api.get("/users/me");
            if (active) useAuthStore.getState().setSession(data);
          } catch { /* verification succeeded even if profile refresh fails */ }
        }
      })
      .catch(() => active && setStatus("error"));
    return () => {
      active = false;
    };
  }, [token]);

  return (
    <AuthShell
      title="Verify your Log Pose"
      footer={
        <Link to="/log" className="text-gold hover:underline">
          Continue to Our Log
        </Link>
      }
    >
      {status === "verifying" ? (
        <LoadingCompass label="Confirming your course…" />
      ) : status === "ok" ? (
        <p className="text-center font-serif text-ink/80">
          ⚓ Your email is verified. You're cleared to seal treasures.
        </p>
      ) : (
        <p className="text-center font-serif text-ink/80">
          That verification link is invalid or has already been used.
        </p>
      )}
    </AuthShell>
  );
}
