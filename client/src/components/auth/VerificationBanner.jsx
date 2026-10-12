import { useState } from "react";
import { toast } from "sonner";
import api from "../../lib/api.js";
import { useAuthStore } from "../../store/authStore.js";

export default function VerificationBanner() {
  const user = useAuthStore((state) => state.user);
  const [sending, setSending] = useState(false);
  if (!user || user.emailVerified) return null;

  const resend = async () => {
    setSending(true);
    try {
      const { data } = await api.post("/auth/resend-verification");
      toast.success(data.message);
      const profile = await api.get("/users/me");
      useAuthStore.getState().setSession(profile.data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Couldn't send the verification email. Please try again.");
    } finally { setSending(false); }
  };

  return (
    <div role="status" className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gold/30 bg-ocean/80 p-4 text-sm">
      <p>Verify {user.email} before sealing treasures. Check your inbox and spam folder.</p>
      <button type="button" onClick={resend} disabled={sending} className="rounded-full border border-gold px-4 py-2 text-gold disabled:opacity-50">
        {sending ? "Sending…" : "Resend verification"}
      </button>
    </div>
  );
}
