import { useEffect, useRef } from "react";

export function GoldConfetti({ active = true, onComplete }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let animationId;
    const count = 90;
    const colors = ["#F5A623", "#F8E71C", "#FFD700", "#FFF8DC", "#E67E22", "#D4AF37"];

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = Array.from({ length: count }, () => ({
      x: canvas.width / 2 + (Math.random() - 0.5) * 100,
      y: canvas.height / 2 + 50,
      vx: (Math.random() - 0.5) * 16,
      vy: -Math.random() * 18 - 8,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      vrot: (Math.random() - 0.5) * 12,
      opacity: 1,
      gravity: 0.45
    }));

    let frame = 0;
    const maxFrames = 180;

    const render = () => {
      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      let alive = 0;
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.vx *= 0.98;
        p.rotation += p.vrot;
        if (frame > 90) p.opacity -= 0.012;

        if (p.opacity > 0 && p.y < canvas.height + 50) {
          alive++;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.globalAlpha = Math.max(0, p.opacity);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
          ctx.restore();
        }
      }

      if (alive > 0 && frame < maxFrames) {
        animationId = requestAnimationFrame(render);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (onComplete) onComplete();
      }
    };

    animationId = requestAnimationFrame(render);

    const handleResize = () => {
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
    };
  }, [active, onComplete]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-50 h-full w-full"
      aria-hidden="true"
    />
  );
}

export default GoldConfetti;
