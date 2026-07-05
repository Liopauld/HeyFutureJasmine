import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { MapPin, CalendarClock, Paperclip, Package } from "lucide-react";
import api from "../lib/api.js";
import { useAuth } from "../hooks/useAuth.js";
import { useCreateLetter } from "../hooks/useLetters.js";
import { formatDate } from "../lib/dates.js";
import RichTextEditor from "../components/letter/RichTextEditor.jsx";
import RecipientPicker from "../components/letter/RecipientPicker.jsx";
import DeliveryDatePicker from "../components/letter/DeliveryDatePicker.jsx";
import PhotoDropzone from "../components/letter/PhotoDropzone.jsx";
import VoiceRecorder from "../components/letter/VoiceRecorder.jsx";
import SongInput from "../components/letter/SongInput.jsx";
import ChestThemePicker from "../components/letter/ChestThemePicker.jsx";
import WaxSealButton from "../components/ui/WaxSealButton.jsx";

function Section({ label, hint, children }) {
  return (
    <section className="rounded-3xl border border-grand-line bg-deep-sea/50 p-5 sm:p-6">
      <div className="mb-4">
        <h2 className="font-display text-xl text-gold">{label}</h2>
        {hint ? <p className="text-sm text-text-muted">{hint}</p> : null}
      </div>
      {children}
    </section>
  );
}

const stripHtml = (html) => html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();

export default function WriteLetter() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, partner } = useAuth();
  const create = useCreateLetter();

  const [form, setForm] = useState({
    letterType: "self",
    subject: "",
    body: "",
    deliveryDate: "",
    capsuleTheme: "default"
  });
  const [attachments, setAttachments] = useState([]);
  const [song, setSong] = useState(null);
  const [replyTo, setReplyTo] = useState(null);

  // "Write back across time" hands off a letter to reply to.
  useEffect(() => {
    const s = location.state;
    if (s?.replyTo) {
      setReplyTo(s.replyTo);
      if (s.letterType) setForm((f) => ({ ...f, letterType: s.letterType }));
    }
  }, [location.state]);

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));
  const photos = useMemo(() => attachments.filter((a) => a.kind === "photo"), [attachments]);
  const voice = useMemo(() => attachments.find((a) => a.kind === "voice"), [attachments]);

  const addAttachment = (att) => setAttachments((a) => [...a, att]);
  const removeAttachment = (id) => {
    setAttachments((a) => a.filter((x) => x._id !== id));
    api.delete(`/uploads/${id}`).catch(() => {});
  };

  const recipientLabel =
    form.letterType === "self"
      ? "Your future self"
      : form.letterType === "us"
        ? "Both of you"
        : partner?.displayName || partner?.username || "Your partner";

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!stripHtml(form.body)) return toast.error("Your letter needs some words, Captain.");
    if (!form.deliveryDate) return toast.error("Chart a destination date first.");
    if (form.letterType !== "self" && !partner) return toast.error("Pair with your partner first.");

    try {
      await create.mutateAsync({
        letterType: form.letterType,
        subject: form.subject || undefined,
        body: form.body,
        deliveryDate: form.deliveryDate,
        capsuleTheme: form.capsuleTheme,
        attachments: attachments.map((a) => a._id),
        song: song || undefined,
        replyTo: replyTo || undefined
      });
      toast.success("Your treasure is sealed and sailing the Grand Line!");
      navigate("/log");
    } catch (error) {
      toast.error(error.response?.data?.message || "Taken by the sea…");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <header className="mb-6">
        <p className="text-sm uppercase tracking-[0.2em] text-text-muted">Chart your destination</p>
        <h1 className="font-display text-3xl text-gold sm:text-4xl">Write a Treasure Letter</h1>
      </header>

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="space-y-5">
          <Section label="The Letter">
            <div className="parchment rounded-2xl p-5">
              <input
                value={form.subject}
                onChange={(e) => set({ subject: e.target.value })}
                placeholder="A Treasure From Your Past"
                className="mb-3 w-full border-b border-parchment-dark bg-transparent pb-2 font-display text-2xl text-ink placeholder:text-ink/30 focus:outline-none"
              />
              <RichTextEditor value={form.body} onChange={(body) => set({ body })} />
            </div>
          </Section>

          <Section label="Who is it for?">
            <RecipientPicker
              value={form.letterType}
              onChange={(letterType) => set({ letterType })}
              partner={partner}
            />
          </Section>

          <Section label="When should it arrive?">
            <DeliveryDatePicker
              value={form.deliveryDate}
              onChange={(deliveryDate) => set({ deliveryDate })}
              anniversary={user?.anniversary}
            />
          </Section>

          <Section label="Treasures to tuck inside" hint="A photo, your voice, a song for this moment.">
            <div className="space-y-4">
              <PhotoDropzone photos={photos} onAdd={addAttachment} onRemove={removeAttachment} />
              <VoiceRecorder voice={voice} onAdd={addAttachment} onRemove={removeAttachment} />
              <SongInput song={song} onChange={setSong} />
            </div>
          </Section>

          <Section label="Your chest">
            <ChestThemePicker value={form.capsuleTheme} onChange={(capsuleTheme) => set({ capsuleTheme })} />
          </Section>
        </div>

        {/* Seal summary */}
        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <div className="map-card rounded-3xl p-5">
            <h3 className="mb-4 font-display text-xl text-gold">Ready to seal?</h3>
            <dl className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-text-secondary">
                <MapPin className="h-4 w-4 text-gold" />
                <dt className="sr-only">Recipient</dt>
                <dd>{recipientLabel}</dd>
              </div>
              <div className="flex items-center gap-2 text-text-secondary">
                <CalendarClock className="h-4 w-4 text-gold" />
                <dt className="sr-only">Delivery date</dt>
                <dd>{form.deliveryDate ? formatDate(form.deliveryDate) : "No date yet"}</dd>
              </div>
              <div className="flex items-center gap-2 text-text-secondary">
                <Paperclip className="h-4 w-4 text-gold" />
                <dt className="sr-only">Attachments</dt>
                <dd>
                  {photos.length} photo{photos.length === 1 ? "" : "s"}
                  {voice ? " · voice note" : ""}
                  {song ? " · song" : ""}
                </dd>
              </div>
              <div className="flex items-center gap-2 text-text-secondary">
                <Package className="h-4 w-4 text-gold" />
                <dt className="sr-only">Chest theme</dt>
                <dd className="capitalize">{form.capsuleTheme.replace("_", " ")} chest</dd>
              </div>
            </dl>
            <WaxSealButton type="submit" loading={create.isPending} className="mt-5 w-full">
              🔮 Seal &amp; Set Sail
            </WaxSealButton>
            <p className="mt-3 text-center text-xs text-text-muted">
              You can edit or cancel until 24h before it arrives.
            </p>
          </div>
        </aside>
      </div>
    </form>
  );
}
