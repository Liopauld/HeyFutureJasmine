import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation, useParams, Link } from "react-router-dom";
import { toast } from "sonner";
import { MapPin, CalendarClock, Paperclip, Package, ArrowLeft, ScrollText } from "lucide-react";
import api from "../lib/api.js";
import { useAuth } from "../hooks/useAuth.js";
import { useCreateLetter, useUpdateLetter, useLetterForEdit } from "../hooks/useLetters.js";
import { useDraft, useUnloadGuard } from "../hooks/useDraft.js";
import { formatDate } from "../lib/dates.js";
import RichTextEditor from "../components/letter/RichTextEditor.jsx";
import RecipientPicker from "../components/letter/RecipientPicker.jsx";
import DeliveryDatePicker from "../components/letter/DeliveryDatePicker.jsx";
import PhotoDropzone from "../components/letter/PhotoDropzone.jsx";
import VoiceRecorder from "../components/letter/VoiceRecorder.jsx";
import SongInput from "../components/letter/SongInput.jsx";
import ChestThemePicker from "../components/letter/ChestThemePicker.jsx";
import WaxSealButton from "../components/ui/WaxSealButton.jsx";
import LoadingCompass from "../components/common/LoadingCompass.jsx";
import EmptyState from "../components/common/EmptyState.jsx";

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

const stripHtml = (html) => (html || "").replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();

const EMPTY_FORM = {
  letterType: "self",
  recipientEmail: "",
  recipientName: "",
  addToCrew: false,
  subject: "",
  body: "",
  deliveryDate: "",
  capsuleTheme: "default",
  visibility: "private"
};

export default function WriteLetter() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { user, partner } = useAuth();
  const create = useCreateLetter();
  const update = useUpdateLetter();

  const [form, setForm] = useState(EMPTY_FORM);
  const [attachments, setAttachments] = useState([]);
  const [song, setSong] = useState(null);
  const [replyTo, setReplyTo] = useState(null);
  const [loaded, setLoaded] = useState(!isEdit);

  // Editing is the only way back into a sealed chest, and only within its window.
  const existing = useLetterForEdit(isEdit ? id : undefined);
  const { saved: savedDraft, save: saveDraft, clear: clearDraft, dismiss: dismissDraft } = useDraft(
    user?.id,
    !isEdit
  );

  useEffect(() => {
    if (!isEdit || !existing.data || loaded) return;
    const letter = existing.data;
    setForm({
      letterType: letter.letterType,
      recipientEmail: letter.recipientEmail || "",
      recipientName: letter.recipientName || "",
      addToCrew: false,
      subject: letter.subject === "A Treasure From Your Past" ? "" : letter.subject || "",
      body: letter.body || "",
      deliveryDate: letter.deliveryDate,
      capsuleTheme: letter.capsuleTheme || "default",
      visibility: letter.visibility || "private"
    });
    setAttachments(letter.attachments || []);
    setSong(letter.song?.url ? letter.song : null);
    setReplyTo(letter.replyTo || null);
    setLoaded(true);
  }, [isEdit, existing.data, loaded]);

  // "Write back across time" hands off a letter to reply to.
  useEffect(() => {
    const s = location.state;
    if (!isEdit && s?.replyTo) {
      setReplyTo(s.replyTo);
      if (s.letterType) setForm((f) => ({ ...f, letterType: s.letterType }));
    }
  }, [location.state, isEdit]);

  const hasWords = Boolean(stripHtml(form.body));
  useUnloadGuard(hasWords && !create.isPending && !update.isPending);

  // Autosave every keystroke-ish, so an accidental exit costs nothing.
  useEffect(() => {
    if (isEdit || !hasWords) return;
    saveDraft({ form, attachments, song, replyTo });
  }, [isEdit, hasWords, form, attachments, song, replyTo, saveDraft]);

  const restoreDraft = () => {
    const d = savedDraft;
    if (!d) return;
    setForm({ ...EMPTY_FORM, ...d.form });
    setAttachments(d.attachments || []);
    setSong(d.song || null);
    setReplyTo(d.replyTo || null);
    dismissDraft();
    toast.success("Back on the desk where you left it.");
  };

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
        : form.letterType === "other"
          ? form.recipientName ? `${form.recipientName} (${form.recipientEmail})` : form.recipientEmail || "Other Nakama"
          : partner?.displayName || partner?.username || "Your partner";

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!hasWords) return toast.error("Your letter needs some words, Captain.");
    if (!form.deliveryDate) return toast.error("Chart a destination date first.");
    if (!isEdit && (form.letterType === "partner" || form.letterType === "us") && !partner) {
      return toast.error("Pair with your partner first.");
    }
    if (form.letterType === "other" && !form.recipientEmail) {
      return toast.error("Please provide a destination email for your nakama.");
    }

    const payload = {
      subject: form.subject || undefined,
      body: form.body,
      deliveryDate: form.deliveryDate,
      letterType: form.letterType,
      recipientEmail: form.recipientEmail || undefined,
      recipientName: form.recipientName || undefined,
      addToCrew: form.addToCrew,
      capsuleTheme: form.capsuleTheme,
      visibility: form.visibility,
      attachments: attachments.map((a) => a._id),
      song: song?.url ? song : undefined,
      replyTo: replyTo?._id || replyTo || undefined
    };

    try {
      if (isEdit) {
        await update.mutateAsync({ id, ...payload });
        toast.success("Resealed. Back to the waves it goes.");
      } else {
        await create.mutateAsync({ ...payload, letterType: form.letterType, replyTo: replyTo || undefined });
        clearDraft();
        toast.success("Your treasure is sealed and sailing the Grand Line!");
      }
      navigate("/log");
    } catch (error) {
      toast.error(error.response?.data?.message || "Taken by the sea…");
    }
  };

  if (isEdit && existing.isLoading) return <LoadingCompass full label="Prising the lid open…" />;
  if (isEdit && existing.isError) {
    return (
      <EmptyState
        title={existing.error?.response?.status === 423 ? "🔒 Chest Sealed for Voyage" : "Can't open that chest"}
        description={
          existing.error?.response?.data?.message ||
          "⚠️ This letter is within 24 hours of delivery and is actively sailing. It can no longer be edited or abandoned."
        }
        action={
          <Link to="/log" className="inline-flex items-center gap-2 text-gold hover:underline">
            <ArrowLeft className="h-4 w-4" /> Back to Our Log
          </Link>
        }
      />
    );
  }

  const pending = create.isPending || update.isPending;

  return (
    <form onSubmit={handleSubmit}>
      <header className="mb-6">
        <p className="text-sm uppercase tracking-[0.2em] text-text-muted">
          {isEdit ? "Still within reach" : "Chart your destination"}
        </p>
        <h1 className="font-display text-3xl text-gold sm:text-4xl">
          {isEdit ? "Reopen the Chest" : "Write a Treasure Letter"}
        </h1>
      </header>

      {savedDraft ? (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gold/40 bg-gold/5 px-5 py-4">
          <p className="flex items-center gap-2 text-sm text-text-secondary">
            <ScrollText className="h-4 w-4 text-gold" />
            An unfinished letter is still on your desk.
          </p>
          <div className="flex items-center gap-4 text-sm">
            <button type="button" onClick={restoreDraft} className="text-gold hover:underline">
              Pick it back up
            </button>
            <button type="button" onClick={clearDraft} className="text-text-muted hover:text-straw-red">
              Discard
            </button>
          </div>
        </div>
      ) : null}

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
              recipientEmail={form.recipientEmail}
              onEmailChange={(recipientEmail) => set({ recipientEmail })}
              recipientName={form.recipientName}
              onNameChange={(recipientName) => set({ recipientName })}
              addToCrew={form.addToCrew}
              onAddToCrewChange={(addToCrew) => set({ addToCrew })}
              crewMembers={user?.crewMembers || []}
              partner={partner}
              locked={isEdit}
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

          <Section
            label="Noticeboard Visibility"
            hint="Choose whether this letter remains strictly private or washes ashore on the public Noticeboard once delivered."
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  id: "private",
                  label: "Private Treasure",
                  icon: "🔒",
                  desc: "Only the recipient can read this letter."
                },
                {
                  id: "public_anonymous",
                  label: "Public (Anonymous)",
                  icon: "🏴‍☠️",
                  desc: "Washes ashore on Noticeboard with a random pirate alias."
                },
                {
                  id: "public_named",
                  label: "Public (Named)",
                  icon: "📜",
                  desc: "Washes ashore on Noticeboard showing your captain name."
                }
              ].map((opt) => {
                const active = (form.visibility || "private") === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => set({ visibility: opt.id })}
                    className={`p-3.5 rounded-2xl border text-left transition-all ${
                      active
                        ? "bg-amber-500/20 border-amber-400 text-sand shadow-[0_0_15px_rgba(245,166,35,0.15)]"
                        : "bg-surface-elevated/60 border-white/10 text-sand-dim hover:border-white/20 hover:text-sand"
                    }`}
                  >
                    <div className="text-xl mb-1.5">{opt.icon}</div>
                    <h4 className="font-bold text-xs text-sand font-display">{opt.label}</h4>
                    <p className="text-[11px] text-sand-dim/80 mt-1 leading-snug">{opt.desc}</p>
                  </button>
                );
              })}
            </div>
          </Section>
        </div>

        {/* Seal summary */}
        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <div className="map-card rounded-3xl p-5">
            <h3 className="mb-4 font-display text-xl text-gold">
              {isEdit ? "Ready to reseal?" : "Ready to seal?"}
            </h3>
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
            <WaxSealButton type="submit" loading={pending} className="mt-5 w-full">
              {isEdit ? "🔒 Reseal the chest" : "🔮 Seal & Set Sail"}
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
