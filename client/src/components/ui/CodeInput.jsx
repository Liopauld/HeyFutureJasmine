import { useRef } from "react";

export function CodeInput({ value, onChange, length = 8, disabled = false }) {
  const inputs = useRef([]);

  const handleChange = (e, index) => {
    const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (!val) {
      const next = value.split("");
      next[index] = "";
      onChange(next.join(""));
      return;
    }

    const chars = val.split("");
    const current = value.padEnd(length, " ").split("");

    for (let i = 0; i < chars.length && index + i < length; i++) {
      current[index + i] = chars[i];
    }

    const nextVal = current.join("").trim();
    onChange(nextVal);

    const nextIndex = Math.min(index + chars.length, length - 1);
    inputs.current[nextIndex]?.focus();
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !value[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const paste = e.clipboardData.getData("text").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, length);
    onChange(paste);
    if (paste.length > 0) {
      const targetIdx = Math.min(paste.length, length - 1);
      inputs.current[targetIdx]?.focus();
    }
  };

  return (
    <div className="flex items-center justify-center gap-1.5 sm:gap-2" onPaste={handlePaste}>
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => (inputs.current[i] = el)}
          type="text"
          maxLength={1}
          disabled={disabled}
          value={value[i] || ""}
          onChange={(e) => handleChange(e, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          className="h-10 w-8 sm:h-12 sm:w-10 rounded-xl border border-amber-500/30 bg-ocean-abyss/80 text-center font-mono text-lg font-bold uppercase text-amber-300 shadow-inner focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold disabled:opacity-50"
        />
      ))}
    </div>
  );
}

export default CodeInput;
