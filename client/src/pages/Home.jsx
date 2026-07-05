import { Link } from "react-router-dom";
import { PenLine, ScrollText, Feather, Anchor, Sparkles } from "lucide-react";
import { useAuth } from "../hooks/useAuth.js";

const steps = [
  { icon: Feather, title: "Write", desc: "Pour a moment onto the parchment — a memory, a promise, a hope." },
  { icon: Anchor, title: "Seal & set sail", desc: "Choose the day it arrives. Lock it in a chest and let it go." },
  { icon: Sparkles, title: "Wash ashore", desc: "On the destined day the chest returns, and the words find you again." }
];

export default function Home() {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="space-y-20">
      <section className="relative flex animate-fade-up flex-col items-center pt-8 text-center sm:pt-16">
        <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-gold/25 bg-gold/5 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-gold">
          <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-gold" />
          The Grand Line of Time
        </p>
        <h1 className="max-w-3xl font-display text-4xl leading-tight text-gold-sheen sm:text-6xl">
          Seal your words.
          <br />
          Let the tides carry them.
        </h1>
        <p className="mt-5 max-w-xl font-serif text-lg italic text-text-secondary">
          Letters to your future selves — and to each other. Written today, sealed in a chest,
          delivered when the tides are finally right.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {isAuthenticated ? (
            <>
              <Link to="/write" className="wax-seal animate-wax-pulse text-sm uppercase tracking-wider">
                <PenLine className="h-4 w-4" /> Write a Letter
              </Link>
              <Link
                to="/log"
                className="inline-flex items-center gap-2 rounded-full border border-gold px-6 py-3 text-gold transition hover:bg-gold hover:text-ocean"
              >
                <ScrollText className="h-4 w-4" /> Our Log
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/register"
                className="rounded-full bg-straw-red px-6 py-3 font-medium text-white transition hover:brightness-110"
              >
                Join the Crew
              </Link>
              <Link
                to="/login"
                className="rounded-full border border-gold px-6 py-3 text-gold transition hover:bg-gold hover:text-ocean"
              >
                Board Ship
              </Link>
            </>
          )}
        </div>
        {isAuthenticated ? (
          <p className="mt-4 text-sm text-text-muted">Fair winds, {user?.displayName || user?.username}.</p>
        ) : null}

        <div className="mt-10 w-full max-w-lg animate-fade-up" style={{ animationDelay: "150ms" }}>
          <HeroScene />
        </div>
      </section>

      <section>
        <div className="grid gap-4 sm:grid-cols-3">
          {steps.map(({ icon: Icon, title, desc }, i) => (
            <div
              key={title}
              className="group animate-fade-up rounded-2xl border border-grand-line bg-gradient-to-b from-grand-line/25 to-deep-sea/60 p-6 text-center transition duration-300 hover:-translate-y-1 hover:border-gold/40 hover:shadow-glow"
              style={{ animationDelay: `${200 + i * 130}ms` }}
            >
              <div className="relative mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full border border-gold/30 bg-ocean transition group-hover:border-gold/60">
                <Icon className="h-6 w-6 text-gold" />
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gold font-display text-xs text-ocean">
                  {i + 1}
                </span>
              </div>
              <p className="font-display text-xl text-gold">{title}</p>
              <p className="mt-1 text-sm text-text-secondary">{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function HeroScene() {
  return (
    <svg
      viewBox="0 0 420 210"
      className="mx-auto w-full [mask-image:radial-gradient(ellipse_65%_75%_at_center,black_55%,transparent_98%)]"
      fill="none"
      aria-hidden="true"
    >
      {/* Moon and its halo */}
      <circle cx="346" cy="46" r="36" fill="var(--color-gold)" opacity=".07" />
      <circle cx="346" cy="46" r="20" fill="#f1e4d6" opacity=".85" />
      <circle cx="339" cy="40" r="3.5" fill="#dcc6a0" opacity=".5" />
      <circle cx="352" cy="52" r="2.5" fill="#dcc6a0" opacity=".4" />

      {/* Stars */}
      {[[28, 34], [70, 16], [118, 52], [166, 24], [252, 40], [296, 14], [388, 84], [46, 78], [206, 10]].map(
        ([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={i % 3 ? 1.2 : 1.8} fill="#f4e8d2" opacity=".55" />
        )
      )}

      {/* Back wave */}
      <path
        d="M0,166 Q26,156 52,166 T105,166 T158,166 T210,166 T262,166 T315,166 T368,166 T420,166 L420,210 L0,210 Z"
        fill="#2b1e42"
      />

      {/* The ship, riding between the wave layers */}
      <g className="animate-bob" style={{ transformBox: "fill-box", transformOrigin: "center" }}>
        <line x1="183" y1="140" x2="183" y2="62" stroke="#3a1f08" strokeWidth="3" strokeLinecap="round" />
        <line x1="228" y1="140" x2="228" y2="34" stroke="#3a1f08" strokeWidth="3" strokeLinecap="round" />
        <path d="M228,38 L228,130 L180,106 Z" fill="#f5eacf" opacity=".95" />
        <path d="M183,66 L183,132 L145,112 Z" fill="#f5eacf" opacity=".9" />
        <circle cx="212" cy="90" r="9" fill="#0f0a1c" />
        <text x="212" y="94" textAnchor="middle" fontSize="10" fill="#f5eacf">
          ☠
        </text>
        <polygon points="228,34 228,47 247,40" fill="#d4302f" />
        <line x1="266" y1="148" x2="292" y2="136" stroke="#3a1f08" strokeWidth="2.5" strokeLinecap="round" />
        <rect x="153" y="140" width="114" height="7" rx="2" fill="#2e1707" />
        <path d="M148,146 C168,153 252,153 272,146 L263,172 Q210,182 157,172 Z" fill="#211002" stroke="#3a1f08" />
        <circle cx="154" cy="147" r="8" fill="#f5c518" opacity=".25" />
        <circle cx="154" cy="147" r="3.5" fill="#f5c518" />
      </g>

      {/* Front wave with a faint gold crest */}
      <path
        d="M0,184 Q26,174 52,184 T105,184 T158,184 T210,184 T262,184 T315,184 T368,184 T420,184 L420,210 L0,210 Z"
        fill="#171028"
      />
      <path
        d="M0,184 Q26,174 52,184 T105,184 T158,184 T210,184 T262,184 T315,184 T368,184 T420,184"
        stroke="rgba(245,166,35,.3)"
        strokeWidth="1.5"
      />
    </svg>
  );
}
