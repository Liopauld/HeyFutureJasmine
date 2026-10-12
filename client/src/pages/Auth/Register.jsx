import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../../hooks/useAuth.js";
import AuthShell, { AuthSubmit } from "../../components/auth/AuthShell.jsx";
import Field from "../../components/ui/Field.jsx";

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const result = await register(form);
      if (result.verificationEmailSent) {
        toast.success("Your account has set sail. Check your email to verify.");
      } else {
        toast.warning("Account created, but the verification email could not be sent. Use Resend verification to retry.");
      }
      navigate("/log");
    } catch (error) {
      toast.error(error.response?.data?.message || "Taken by the sea…");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Join the Crew"
      subtitle="Create an account to seal your treasure."
      footer={
        <>
          Already sailing?{" "}
          <Link to="/login" className="text-gold hover:underline">
            Log in.
          </Link>
        </>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <Field
          label="Name"
          value={form.username}
          onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
          minLength={3}
          maxLength={30}
          required
        />
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
          minLength={8}
          required
        />
        <AuthSubmit loading={submitting}>Join the Crew</AuthSubmit>
      </form>
    </AuthShell>
  );
}
