import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import api from "../../lib/api.js";
import AuthShell, { AuthSubmit } from "../../components/auth/AuthShell.jsx";
import Field from "../../components/ui/Field.jsx";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await api.post(`/auth/reset-password/${token}`, { password });
      toast.success("New course set. Log in with your new password.");
      navigate("/login", { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.message || "That link may have expired.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Chart a new password"
      footer={
        <Link to="/login" className="text-gold hover:underline">
          Back to login
        </Link>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <Field
          label="New password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={8}
          required
        />
        <AuthSubmit loading={submitting}>Reset password</AuthSubmit>
      </form>
    </AuthShell>
  );
}
