import Button from "./Button.jsx";

export default function WaxSealButton({ children, className = "", loading = false, ...props }) {
  const pulseClass = loading ? "" : "pulse";
  const disabled = loading || props.disabled;

  return (
    <Button
      {...props}
      disabled={disabled}
      className={`wax-seal ${pulseClass} ${loading ? "opacity-60" : ""} ${className}`}
    >
      {loading ? "Charting the Course..." : children}
    </Button>
  );
}
