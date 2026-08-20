import { Link } from "react-router-dom";
import { UserRound, Heart, Users, Mail, UserPlus } from "lucide-react";

export default function RecipientPicker({
  value,
  onChange,
  recipientEmail = "",
  onEmailChange,
  recipientName = "",
  onNameChange,
  addToCrew = false,
  onAddToCrewChange,
  crewMembers = [],
  partner,
  locked = false
}) {
  const partnerName = partner?.displayName || partner?.username;

  const options = [
    {
      key: "self",
      icon: UserRound,
      title: "My future self",
      desc: "A letter only you will open, someday.",
      disabled: false
    },
    {
      key: "partner",
      icon: Heart,
      title: partnerName ? `${partnerName}` : "Your partner",
      desc: partnerName ? `A treasure for ${partnerName} to find.` : "Pair up to write to them.",
      disabled: !partner
    },
    {
      key: "us",
      icon: Users,
      title: "Us",
      desc: "Sealed for both of you — opened together.",
      disabled: !partner
    },
    {
      key: "other",
      icon: Mail,
      title: "Other Nakama",
      desc: "Any email address across the world.",
      disabled: false
    }
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {options.map(({ key, icon: Icon, title, desc, disabled: unavailable }) => {
          const active = value === key;
          const disabled = unavailable || (locked && !active);
          return (
            <button
              key={key}
              type="button"
              disabled={disabled || locked}
              onClick={() => onChange(key)}
              className={`group relative rounded-2xl border p-4 text-left transition ${
                active
                  ? "border-gold bg-gold/10 shadow-glow"
                  : "border-grand-line bg-deep-sea/50 hover:border-gold/50"
              } ${disabled ? "cursor-not-allowed opacity-45" : ""}`}
            >
              <Icon
                className={`mb-2 h-5 w-5 ${active ? "text-gold" : "text-text-secondary"}`}
              />
              <p className={`font-display text-lg ${active ? "text-gold" : "text-text-primary"}`}>
                {title}
              </p>
              <p className="mt-0.5 text-xs text-text-muted">{desc}</p>
            </button>
          );
        })}
      </div>

      {/* External email input form when 'other' is chosen */}
      {value === "other" && !locked && (
        <div className="rounded-2xl border border-gold/30 bg-surface-elevated/70 p-4 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-sand-dim mb-1">
                Recipient Email <span className="text-amber-400">*</span>
              </label>
              <input
                type="email"
                required
                value={recipientEmail}
                onChange={(e) => onEmailChange && onEmailChange(e.target.value)}
                placeholder="nakama@grandline.sea"
                className="w-full rounded-xl border border-white/10 bg-ocean-abyss/80 px-3.5 py-2 text-sm text-sand placeholder:text-sand-dim/40 focus:border-amber-400 focus:outline-none"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-semibold text-sand-dim mb-1">
                Recipient Name (Optional)
              </label>
              <input
                type="text"
                value={recipientName}
                onChange={(e) => onNameChange && onNameChange(e.target.value)}
                placeholder="e.g. Sanji, Nami"
                className="w-full rounded-xl border border-white/10 bg-ocean-abyss/80 px-3.5 py-2 text-sm text-sand placeholder:text-sand-dim/40 focus:border-amber-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Quick select from crew if any */}
          {crewMembers?.length > 0 && (
            <div className="flex items-center gap-2 pt-1 flex-wrap">
              <span className="text-[11px] text-sand-dim font-medium">Quick pick:</span>
              {crewMembers.map((c, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    onEmailChange && onEmailChange(c.email);
                    onNameChange && onNameChange(c.name);
                  }}
                  className="px-2.5 py-0.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-sand-light transition"
                >
                  {c.name || c.email}
                </button>
              ))}
            </div>
          )}

          {/* Add to crew checkbox */}
          <label className="inline-flex items-center gap-2 text-xs text-sand-dim cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={addToCrew}
              onChange={(e) => onAddToCrewChange && onAddToCrewChange(e.target.checked)}
              className="rounded border-white/20 bg-ocean-abyss text-amber-500 focus:ring-0"
            />
            <UserPlus className="w-3.5 h-3.5 text-amber-400" />
            Save this nakama to my Crew address book
          </label>
        </div>
      )}

      {locked ? (
        <p className="mt-2 text-xs text-text-muted">
          The recipient is set once a chest is sealed.
        </p>
      ) : null}
      {!partner && !locked && value === "partner" ? (
        <p className="mt-2 text-xs text-text-muted">
          Writing to your partner?{" "}
          <Link to="/profile" className="text-gold underline">
            Pair your crew of two →
          </Link>
        </p>
      ) : null}
    </div>
  );
}
