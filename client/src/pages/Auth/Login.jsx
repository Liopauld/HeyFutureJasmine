import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../../hooks/useAuth.js";
import AuthShell, { AuthSubmit } from "../../components/auth/AuthShell.jsx";
import Field from "../../components/ui/Field.jsx";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await login(form);
      toast.success("Welcome aboard, Captain.");
      navigate(location.state?.from || "/log", { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.message || "Taken by the sea…");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Board the Ship"
      subtitle="Log in to check your treasure route."
      footer={
        <>
          New here?{" "}
          <Link to="/register" className="text-gold hover:underline">
            Join the crew.
          </Link>
        </>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <Field
          label="Email"
          type="email"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          required
        />
        <Field
          label="Password"
          type="password"
          value={form.password}
          onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
          required
        />
        <div className="text-right">
          <Link to="/forgot-password" className="text-xs text-ink/60 hover:underline">
            Lost your log pose?
          </Link>
        </div>
        <AuthSubmit loading={submitting}>Board the Ship</AuthSubmit>
      </form>
    </AuthShell>
  );
}
