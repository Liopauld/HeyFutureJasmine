/**
 * App-wide deep-ocean backdrop: a sparse starfield up top and two gold
 * wave layers drifting along the bottom. Fixed and behind everything
 * (-z-10); purely decorative.
 */

// [left vw, top vh, size px, twinkles]
const STARS = [
  [4, 18, 2, false],
  [9, 42, 1.5, false],
  [13, 9, 2, true],
  [19, 30, 1.5, false],
  [26, 15, 2, false],
  [31, 48, 1.5, false],
  [37, 7, 1.5, true],
  [44, 26, 2, false],
  [52, 12, 1.5, false],
  [58, 38, 2, false],
  [64, 6, 1.5, true],
  [71, 22, 2, false],
  [77, 45, 1.5, false],
  [83, 11, 2, true],
  [88, 33, 1.5, false],
  [93, 19, 2, false],
  [97, 40, 1.5, false],
  [48, 52, 1.5, false]
];

const WAVE_PATH =
  "M0,145 C250,105 500,165 750,135 C1000,105 1250,155 1500,128 C1750,100 2000,155 2250,135 C2500,115 2700,145 2880,128 L2880,230 L0,230 Z";

export default function OceanBackground() {
  return (
    <div aria-hidden="true" className="ocean-bg pointer-events-none fixed inset-0 -z-10">
      {/* Starfield */}
      {STARS.map(([left, top, size, twinkle], i) => (
        <span
          key={i}
          className={`absolute rounded-full bg-parchment ${twinkle ? "animate-pulse-dot" : ""}`}
          style={{
            left: `${left}vw`,
            top: `${top}vh`,
            width: size,
            height: size,
            opacity: twinkle ? 0.5 : 0.28,
            animationDelay: `${i * 0.7}s`
          }}
        />
      ))}

      {/* Faint glow where the sea meets the hull of the page */}
      <div className="absolute inset-x-0 bottom-0 h-72 bg-[radial-gradient(ellipse_at_50%_115%,rgba(245,166,35,0.07),transparent_65%)]" />

      {/* Two drifting wave layers */}
      <div className="absolute inset-x-0 bottom-0 h-40 overflow-hidden opacity-[0.07]">
        <svg
          className="absolute bottom-0 left-0 h-40 w-[200%] animate-wave-slow"
          viewBox="0 0 2880 230"
          preserveAspectRatio="none"
        >
          <path fill="var(--color-gold)" d={WAVE_PATH} />
        </svg>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-28 overflow-hidden opacity-[0.1]">
        <svg
          className="absolute bottom-0 left-[-35%] h-28 w-[200%] animate-wave"
          viewBox="0 0 2880 230"
          preserveAspectRatio="none"
        >
          <path fill="var(--color-gold-dark)" d={WAVE_PATH} />
        </svg>
      </div>
    </div>
  );
}
