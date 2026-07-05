import { Link } from "react-router-dom";
import { UserRound, Heart, Users } from "lucide-react";

export default function RecipientPicker({ value, onChange, partner }) {
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
    }
  ];

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-3">
        {options.map(({ key, icon: Icon, title, desc, disabled }) => {
          const active = value === key;
          return (
            <button
              key={key}
              type="button"
              disabled={disabled}
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
      {!partner ? (
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
