import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import api from "../../lib/api.js";
import AuthShell, { AuthSubmit } from "../../components/auth/AuthShell.jsx";
import Field from "../../components/ui/Field.jsx";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/auth/forgot-password", { email });
      setSent(true);
      toast.success("If that account exists, a new course has been sent.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Taken by the sea…");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Lost your log pose?"
      subtitle="We'll send a link to reset your password."
      footer={
        <Link to="/login" className="text-gold hover:underline">
          Back to login
        </Link>
      }
    >
      {sent ? (
        <p className="text-center font-serif text-ink/80">
          Check your email — if an account exists, a reset link is on its way.
        </p>
      ) : (
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Field
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <AuthSubmit loading={submitting}>Send reset link</AuthSubmit>
        </form>
      )}
    </AuthShell>
  );
}
