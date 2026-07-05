import { useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import { CalendarDays, Heart } from "lucide-react";
import GrandLineRoute from "./GrandLineRoute.jsx";
import { addMonths, addYears, nextAnniversary, formatGap, formatDate } from "../../lib/dates.js";

function Chip({ active, onClick, children, icon: Icon }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm transition ${
        active
          ? "border-gold bg-gold/15 text-gold"
          : "border-grand-line text-text-secondary hover:border-gold/50 hover:text-text-primary"
      }`}
    >
      {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
      {children}
    </button>
  );
}

export default function DeliveryDatePicker({ value, onChange, anniversary }) {
  const [showCustom, setShowCustom] = useState(false);
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const selected = value ? new Date(value) : undefined;
  const sameDay = (d) => selected && selected.toDateString() === d.toDateString();
  const pick = (d) => onChange(d.toISOString());

  const presets = [
    { label: "6 months", date: addMonths(now, 6) },
    { label: "1 year", date: addYears(now, 1) },
    { label: "3 years", date: addYears(now, 3) },
    { label: "5 years", date: addYears(now, 5) },
    { label: "10 years", date: addYears(now, 10) }
  ];
  const anniv = nextAnniversary(anniversary);

  return (
    <div className="space-y-4">
      <div>
        <p className="mb-2 text-xs uppercase tracking-wider text-text-muted">How far to sail</p>
        <div className="flex flex-wrap gap-2">
          {presets.map((p) => (
            <Chip key={p.label} active={sameDay(p.date)} onClick={() => pick(p.date)}>
              {p.label}
            </Chip>
          ))}
        </div>
      </div>

      {anniv ? (
        <div>
          <p className="mb-2 text-xs uppercase tracking-wider text-text-muted">Milestones</p>
          <div className="flex flex-wrap gap-2">
            <Chip active={sameDay(anniv)} onClick={() => pick(anniv)} icon={Heart}>
              Our next anniversary
            </Chip>
          </div>
        </div>
      ) : null}

      <div>
        <button
          type="button"
          onClick={() => setShowCustom((s) => !s)}
          className="flex items-center gap-1.5 text-sm text-gold hover:underline"
        >
          <CalendarDays className="h-4 w-4" />
          {showCustom ? "Hide calendar" : "Pick a custom date"}
        </button>
        {showCustom ? (
          <div className="mt-2 inline-block rounded-2xl bg-parchment p-2 text-ink shadow-lg">
            <DayPicker
              mode="single"
              selected={selected}
              onSelect={(d) => d && pick(d)}
              disabled={{ before: tomorrow }}
              defaultMonth={selected || now}
            />
          </div>
        ) : null}
      </div>

      {selected ? (
        <div className="rounded-2xl border border-grand-line bg-ocean/50 p-4">
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="text-text-secondary">Arrives</span>
            <span className="font-semibold text-gold">{formatDate(selected)}</span>
          </div>
          <GrandLineRoute progress={0} label={`A ${formatGap(now, selected)} voyage`} />
        </div>
      ) : null}
    </div>
  );
}
