import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../../hooks/useAuth.js";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await login(form);
      toast.success("Welcome aboard, Captain.");
      navigate("/log");
    } catch (error) {
      toast.error(error.response?.data?.message || "Taken by the sea...");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="mx-auto max-w-md space-y-6" onSubmit={handleSubmit}>
      <header>
        <h1 className="font-display text-3xl text-gold">Board the Ship</h1>
        <p className="text-text-secondary">Log in to check your treasure route.</p>
      </header>
      <div className="rounded-3xl parchment-area p-6 text-ink">
        <label className="block">
          <span className="text-sm text-ink">Email</span>
          <input
            type="email"
            className="mt-1 w-full rounded-xl border border-parchment-dark bg-white px-4 py-3"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            required
          />
        </label>
        <label className="mt-4 block">
          <span className="text-sm text-ink">Password</span>
          <input
            type="password"
            className="mt-1 w-full rounded-xl border border-parchment-dark bg-white px-4 py-3"
            value={form.password}
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
            required
          />
        </label>
        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-6 w-full rounded-full bg-straw-red px-5 py-3 text-white transition hover:bg-red-600 disabled:opacity-60"
        >
          {isSubmitting ? "Charting the Course..." : "Board the Ship"}
        </button>
        <Link to="/register" className="mt-4 inline-block text-gold">
          New here? Join the crew.
        </Link>
      </div>
    </form>
  );
}
