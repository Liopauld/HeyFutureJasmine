import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import api from "../lib/api.js";
import WaxSealButton from "../components/ui/WaxSealButton.jsx";

export default function WriteLetter() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    subject: "A Treasure From Your Past",
    recipientEmail: "",
    recipientName: "",
    deliveryDate: "",
    body: "",
    visibility: "private",
    capsuleTheme: "default",
    isSelfLetter: true
  });
  const [isSaving, setIsSaving] = useState(false);

  const updateField = (field) => (event) => {
    setForm((current) => ({
      ...current,
      [field]: event.target.value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    try {
      const payload = {
        ...form,
        deliveryDate: new Date(form.deliveryDate).toISOString(),
        recipientEmail: form.isSelfLetter ? "" : form.recipientEmail
      };
      const { data } = await api.post("/letters", payload);
      toast.success("Your treasure is sealed and sailing the Grand Line!");
      navigate(`/treasure/${data.letter._id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Taken by the sea...");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form className="space-y-8" onSubmit={handleSubmit}>
      <header>
        <p className="text-sm uppercase tracking-[0.2em] text-text-muted">Chart Your Destination</p>
        <h1 className="font-display text-3xl text-gold">Write a Treasure Letter</h1>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4 rounded-3xl parchment-area p-6 text-ink">
          <label className="block">
            <span className="text-sm font-semibold">Subject</span>
            <input
              className="mt-1 w-full rounded-xl border border-parchment-dark bg-white px-4 py-3 font-serif"
              value={form.subject}
              onChange={updateField("subject")}
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold">Treasure Letter</span>
            <textarea
              className="mt-1 min-h-64 w-full rounded-xl border border-parchment-dark bg-white px-4 py-3 font-serif"
              placeholder="Write your message to the future..."
              value={form.body}
              onChange={updateField("body")}
              required
            />
          </label>
        </div>

        <div className="space-y-5 rounded-3xl border border-grand-line bg-deep-sea/70 p-6">
          <div className="rounded-2xl border border-grand-line bg-ocean/60 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-text-muted">Grand Line Tracker</p>
            <div className="mt-3 h-2 w-full rounded-full bg-grand-line">
              <div className="h-full w-1/3 rounded-full bg-gold shadow-glow" />
            </div>
            <p className="mt-2 text-xs text-text-secondary">Set your destination date to see the ship advance.</p>
          </div>
          <label className="block">
            <span className="text-sm text-text-secondary">Recipient type</span>
            <select
              className="mt-1 w-full rounded-xl border border-grand-line bg-ocean px-4 py-3"
              value={form.isSelfLetter ? "self" : "other"}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  isSelfLetter: event.target.value === "self"
                }))
              }
            >
              <option value="self">To myself</option>
              <option value="other">To another nakama</option>
            </select>
          </label>

          {!form.isSelfLetter ? (
            <>
              <label className="block">
                <span className="text-sm text-text-secondary">Recipient name</span>
                <input
                  className="mt-1 w-full rounded-xl border border-grand-line bg-ocean px-4 py-3"
                  value={form.recipientName}
                  onChange={updateField("recipientName")}
                />
              </label>
              <label className="block">
                <span className="text-sm text-text-secondary">Recipient email</span>
                <input
                  type="email"
                  className="mt-1 w-full rounded-xl border border-grand-line bg-ocean px-4 py-3"
                  value={form.recipientEmail}
                  onChange={updateField("recipientEmail")}
                  required
                />
              </label>
            </>
          ) : null}

          <label className="block">
            <span className="text-sm text-text-secondary">Delivery date</span>
            <input
              type="date"
              className="mt-1 w-full rounded-xl border border-grand-line bg-ocean px-4 py-3"
              value={form.deliveryDate}
              onChange={updateField("deliveryDate")}
              required
            />
          </label>

          <label className="block">
            <span className="text-sm text-text-secondary">Visibility</span>
            <select
              className="mt-1 w-full rounded-xl border border-grand-line bg-ocean px-4 py-3"
              value={form.visibility}
              onChange={updateField("visibility")}
            >
              <option value="private">Private</option>
              <option value="public_anonymous">Public anonymous</option>
              <option value="public_named">Public named</option>
            </select>
          </label>

          <label className="block">
            <span className="text-sm text-text-secondary">Chest theme</span>
            <select
              className="mt-1 w-full rounded-xl border border-grand-line bg-ocean px-4 py-3"
              value={form.capsuleTheme}
              onChange={updateField("capsuleTheme")}
            >
              <option value="default">Default</option>
              <option value="gold">Gold</option>
              <option value="scroll">Scroll</option>
              <option value="davy_jones">Davy Jones</option>
              <option value="alabasta">Alabasta</option>
              <option value="skypiea">Skypiea</option>
            </select>
          </label>

          <WaxSealButton type="submit" loading={isSaving} className="w-full justify-center">
            SEAL & SET SAIL
          </WaxSealButton>
        </div>
      </div>
    </form>
  );
}
