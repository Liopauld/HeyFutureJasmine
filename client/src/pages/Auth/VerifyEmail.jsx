import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../lib/api.js";
import AuthShell from "../../components/auth/AuthShell.jsx";
import LoadingCompass from "../../components/common/LoadingCompass.jsx";

export default function VerifyEmail() {
  const { token } = useParams();
  const [status, setStatus] = useState("verifying");

  useEffect(() => {
    let active = true;
    api
      .get(`/auth/verify-email/${token}`)
      .then(() => active && setStatus("ok"))
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
