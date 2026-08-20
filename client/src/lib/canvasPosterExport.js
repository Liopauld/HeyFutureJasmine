/**
 * Generates an authentic One Piece style Wanted Poster on HTML5 Canvas (1200x1600px).
 */
export async function generatePosterCanvas(user) {
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 1600;
  const ctx = canvas.getContext("2d");

  // 1. Parchment Background
  ctx.fillStyle = "#E4D4B2";
  ctx.fillRect(0, 0, 1200, 1600);

  // Gradient shading
  const grad = ctx.createRadialGradient(600, 800, 200, 600, 800, 900);
  grad.addColorStop(0, "rgba(255, 248, 220, 0.4)");
  grad.addColorStop(1, "rgba(180, 140, 90, 0.5)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1200, 1600);

  // Outer border
  ctx.strokeStyle = "#4A2F18";
  ctx.lineWidth = 14;
  ctx.strokeRect(40, 40, 1120, 1520);

  ctx.lineWidth = 4;
  ctx.strokeRect(60, 60, 1080, 1480);

  // 2. "WANTED" Header
  ctx.fillStyle = "#2D1B0E";
  ctx.font = "900 140px 'Cinzel Decorative', 'Georgia', serif";
  ctx.textAlign = "center";
  ctx.fillText("WANTED", 600, 220);

  // 3. Avatar Photo Box
  ctx.fillStyle = "#D4C29E";
  ctx.fillRect(150, 280, 900, 680);
  ctx.lineWidth = 6;
  ctx.strokeStyle = "#2D1B0E";
  ctx.strokeRect(150, 280, 900, 680);

  // Draw Avatar image if present
  if (user?.avatar?.url) {
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = user.avatar.url;
      });

      ctx.save();
      ctx.beginPath();
      ctx.rect(156, 286, 888, 668);
      ctx.clip();
      ctx.drawImage(img, 156, 286, 888, 668);
      ctx.restore();
    } catch {
      // Fallback silhouette
      ctx.fillStyle = "#4A2F18";
      ctx.font = "bold 80px sans-serif";
      ctx.fillText("🏴‍☠️", 600, 640);
    }
  } else {
    ctx.fillStyle = "#8C7355";
    ctx.font = "bold 120px sans-serif";
    ctx.fillText("☠️", 600, 650);
  }

  // 4. "DEAD OR ALIVE" Banner
  ctx.fillStyle = "#2D1B0E";
  ctx.font = "900 72px 'Cinzel Decorative', 'Georgia', serif";
  ctx.fillText("DEAD OR ALIVE", 600, 1050);

  // 5. Name
  const name = (user?.displayName || user?.username || "PIRATE").toUpperCase();
  ctx.font = "900 84px 'Cinzel Decorative', 'Georgia', serif";
  ctx.fillText(name, 600, 1180);

  // 6. Title / Rank
  const title = (user?.pirateTitle || "ROOKIE PIRATE").toUpperCase();
  ctx.font = "italic bold 36px 'Georgia', serif";
  ctx.fillStyle = "#5A3D28";
  ctx.fillText(`"${title}"`, 600, 1240);

  // 7. Bounty Value
  const bounty = Number(user?.bounty || 0).toLocaleString();
  ctx.font = "900 78px 'Courier New', monospace";
  ctx.fillStyle = "#2D1B0E";
  ctx.fillText(`฿ ${bounty}-`, 600, 1360);

  // 8. Footer Marine Seal
  ctx.font = "bold 28px 'Georgia', serif";
  ctx.fillStyle = "#6B4423";
  ctx.fillText("MARINE // GRAND LINE LOGBOOK", 600, 1480);

  return canvas;
}

export async function downloadPoster(user) {
  const canvas = await generatePosterCanvas(user);
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `HeyFutureJasmine_Wanted_${user?.username || "Pirate"}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function sharePoster(user) {
  const canvas = await generatePosterCanvas(user);
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
  const file = new File([blob], `HeyFutureJasmine_Wanted_${user?.username || "Pirate"}.png`, {
    type: "image/png"
  });

  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    await navigator.share({
      title: `${user?.displayName || user?.username}'s Wanted Poster`,
      text: `Check out my pirate bounty on HeyFutureJasmine! ฿${Number(user?.bounty || 0).toLocaleString()}`,
      files: [file]
    });
    return true;
  } else {
    // Fallback to direct download
    await downloadPoster(user);
    return false;
  }
}
