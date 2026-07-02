function buildEmailHtml({ title, body }) {
  return `
    <div style="font-family: Arial, sans-serif; background:#0b1d2e; color:#f0e6d3; padding:24px;">
      <div style="max-width:640px; margin:0 auto; background:#071322; border:1px solid #1a3a5c; border-radius:20px; padding:24px;">
        <h1 style="color:#f5c518; margin-top:0;">${title}</h1>
        ${body}
      </div>
    </div>
  `;
}

export async function sendEmail({ to, subject, body }) {
  console.log(`[email] to=${to} subject=${subject}`);
  console.log(buildEmailHtml({ title: subject, body }));
}

export async function sendVerificationEmail(email, token) {
  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
  const link = `${clientUrl}/verify-email/${token}`;
  await sendEmail({
    to: email,
    subject: "Verify your log pose, Nakama!",
    body: `<p>Set course by confirming your email.</p><p><a href="${link}" style="color:#f5c518;">Verify email</a></p>`
  });
}

export async function sendPasswordResetEmail(email, token) {
  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
  const link = `${clientUrl}/reset-password/${token}`;
  await sendEmail({
    to: email,
    subject: "A new course awaits",
    body: `<p>Use this link to reset your password.</p><p><a href="${link}" style="color:#f5c518;">Reset password</a></p>`
  });
}

export async function sendLetterSealedEmail(letter) {
  if (!letter) return;
  const bodyPreview = String(letter.body || "").slice(0, 100);
  await sendEmail({
    to: letter.sender?.email || letter.recipientEmail,
    subject: `⚓ Your treasure has been sealed, Captain ${letter.sender?.username || ""}!`,
    body: `<p>Your treasure is sealed and sailing.</p><p>Recipient: ${letter.recipientName || letter.recipientEmail}</p><p>Preview: ${bodyPreview}</p>`
  });
}

export async function sendLetterEmail(letter) {
  if (!letter) return;
  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
  const unlockPath = letter.unlockToken ? `${clientUrl}/unlock/${letter.unlockToken}` : `${clientUrl}/treasure/${letter._id}`;
  await sendEmail({
    to: letter.recipientEmail,
    subject: "A treasure from your past has arrived!",
    body: `<p>Your treasure letter has washed ashore.</p><p><a href="${unlockPath}" style="color:#f5c518;">Open your treasure chest</a></p>`
  });
}
