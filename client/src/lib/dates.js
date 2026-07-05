export function addMonths(date, n) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + n);
  return d;
}

export function addYears(date, n) {
  const d = new Date(date);
  d.setFullYear(d.getFullYear() + n);
  return d;
}

/** Calendar-aware gap broken into years / months / days (absolute). */
export function diffParts(from, to) {
  let a = new Date(from);
  let b = new Date(to);
  if (b < a) [a, b] = [b, a];
  let years = b.getFullYear() - a.getFullYear();
  let months = b.getMonth() - a.getMonth();
  let days = b.getDate() - a.getDate();
  if (days < 0) {
    months -= 1;
    days += new Date(b.getFullYear(), b.getMonth(), 0).getDate();
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  return { years, months, days };
}

/** "1 year, 2 months" / "6 months" / "12 days" — the top one or two units. */
export function formatGap(from, to) {
  const { years, months, days } = diffParts(from, to);
  const u = (n, label) => `${n} ${label}${n === 1 ? "" : "s"}`;
  if (years > 0) return months > 0 ? `${u(years, "year")}, ${u(months, "month")}` : u(years, "year");
  if (months > 0) return days > 0 ? `${u(months, "month")}, ${u(days, "day")}` : u(months, "month");
  if (days > 0) return u(days, "day");
  return "today";
}

export function daysBetween(from, to) {
  return Math.round((new Date(to) - new Date(from)) / 86_400_000);
}

/** 0..1 progress of a voyage from `from` to `to` at `now`. */
export function progressBetween(from, to, now = Date.now()) {
  const start = new Date(from).getTime();
  const end = new Date(to).getTime();
  if (end <= start) return 1;
  return Math.max(0, Math.min(1, (now - start) / (end - start)));
}

/** Countdown label for a sealed chest. */
export function countdownLabel(deliveryDate, now = Date.now()) {
  const target = new Date(deliveryDate).getTime();
  if (target <= now) return "Washed ashore";
  const days = daysBetween(now, deliveryDate);
  if (days <= 7) return "Opening soon";
  return `Opens in ${formatGap(now, deliveryDate)}`;
}

/** "2 years, 4 months ago" — for the reveal's time context. */
export function timeAgo(date, now = Date.now()) {
  return `${formatGap(date, now)} ago`;
}

/** Next future occurrence of an anniversary's month/day. */
export function nextAnniversary(anniversary, now = new Date()) {
  if (!anniversary) return null;
  const a = new Date(anniversary);
  const candidate = new Date(now.getFullYear(), a.getMonth(), a.getDate());
  if (candidate <= now) candidate.setFullYear(candidate.getFullYear() + 1);
  return candidate;
}

export function formatDate(date) {
  return new Date(date).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}
