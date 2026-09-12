import { Resend } from "resend";

const rawApiKey = process.env.RESEND_API_KEY;
const isRealResendKey =
  rawApiKey &&
  rawApiKey !== "your_resend_api_key" &&
  !rawApiKey.startsWith("your_") &&
  rawApiKey.trim().length > 10;
const resend = isRealResendKey ? new Resend(rawApiKey.trim()) : null;
const FROM = process.env.EMAIL_FROM || "HeyFutureJasmine <no-reply@heyfuturejasmine.app>";

function clientUrl() {
  return (process.env.CLIENT_URL || "http://localhost:5173").replace(/\/$/, "");
}

/** Parchment-styled HTML email shell. */
function shell({ heading, intro, ctaText, ctaUrl, footnote }) {
  return `
  <div style="background:#070f1a;padding:32px 16px;font-family:'DM Sans',Arial,sans-serif;">
    <div style="max-width:560px;margin:0 auto;background:#f5eacf;border:1px solid #dfc9a0;border-radius:18px;
                padding:32px;color:#2c1a0e;box-shadow:0 12px 40px rgba(0,0,0,.4);">
      <div style="font-size:22px;color:#c9920a;font-weight:700;letter-spacing:.02em;margin-bottom:14px;">
        ⚓ ${heading}
      </div>
      <div style="font-size:15px;line-height:1.7;color:#3a2a18;">${intro}</div>
      ${
        ctaText && ctaUrl
          ? `<div style="margin:26px 0 6px;">
               <a href="${ctaUrl}" style="display:inline-block;background:#d4302f;color:#fff;text-decoration:none;
                  font-weight:600;padding:12px 22px;border-radius:999px;font-size:14px;">${ctaText}</a>
             </div>`
          : ""
      }
      ${
        footnote
          ? `<div style="margin-top:22px;padding-top:16px;border-top:1px solid #dfc9a0;font-size:12px;color:#8a7355;">${footnote}</div>`
          : ""
      }
    </div>
    <div style="max-width:560px;margin:14px auto 0;text-align:center;font-size:11px;color:#5a7a90;">
      HeyFutureJasmine! — messages across the tides of time.
    </div>
  </div>`;
}

/** Low-level send. Falls back to console logging when Resend isn't configured or fails. */
export async function sendEmail({ to, subject, html }) {
  const recipients = Array.isArray(to) ? to : [to];
  if (!resend) {
    console.log(`\n[email:dev] → ${recipients.join(", ")}\n[subject] ${subject}\n`);
    return { mocked: true };
  }
  try {
    return await resend.emails.send({ from: FROM, to: recipients, subject, html });
  } catch (err) {
    console.warn(`Resend email delivery failed (${err.message}). Logging to console instead.`);
    console.log(`\n[email:dev] → ${recipients.join(", ")}\n[subject] ${subject}\n`);
    return { mocked: true, error: err.message };
  }
}

export async function sendVerificationEmail(email, token) {
  await sendEmail({
    to: email,
    subject: "Verify your Log Pose, nakama",
    html: shell({
      heading: "Confirm your email",
      intro: "One tap sets your course. Confirm your email to start sealing treasures.",
      ctaText: "Verify email",
      ctaUrl: `${clientUrl()}/verify-email/${token}`,
      footnote: "If you didn't sign up, you can ignore this message."
    })
  });
}

export async function sendPasswordResetEmail(email, token) {
  await sendEmail({
    to: email,
    subject: "A new course for your password",
    html: shell({
      heading: "Reset your password",
      intro: "Use the link below to chart a new password. It expires in one hour.",
      ctaText: "Reset password",
      ctaUrl: `${clientUrl()}/reset-password/${token}`,
      footnote: "Didn't request this? Your password is unchanged."
    })
  });
}

/** Confirmation sent right after a letter is sealed. */
export async function sendLetterSealedEmail(letter) {
  if (!letter) return;
  const to = letter.sender?.email || letter.recipientEmail;
  const when = new Date(letter.deliveryDate).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
  const preview = String(letter.body || "").replace(/<[^>]*>/g, "").slice(0, 120);
  await sendEmail({
    to,
    subject: "⚓ Your treasure is sealed and sailing",
    html: shell({
      heading: "Sealed and set to sail",
      intro: `Your letter is locked in its chest, bound for <strong>${when}</strong>.<br/><br/>
              <em style="color:#6b563a;">"${preview}${preview.length >= 120 ? "…" : ""}"</em>`,
      ctaText: "View in your log",
      ctaUrl: `${clientUrl()}/log`,
      footnote: "You can edit or cancel until 24 hours before delivery."
    })
  });
}

/** Delivery email — sent when a chest reaches its date. */
export async function sendLetterEmail(letter) {
  if (!letter) return;

  // Recipients depend on letter type (self → sender, partner → recipient, us → both).
  const senderEmail = letter.sender?.email;
  const recipients = new Set();
  if (letter.letterType === "us") {
    if (senderEmail) recipients.add(senderEmail.toLowerCase());
    if (letter.recipientEmail) recipients.add(letter.recipientEmail.toLowerCase());
  } else if (letter.letterType === "self") {
    recipients.add((senderEmail || letter.recipientEmail || "").toLowerCase());
  } else {
    if (letter.recipientEmail) recipients.add(letter.recipientEmail.toLowerCase());
  }
  const to = [...recipients].filter(Boolean);
  if (!to.length) return;

  const openUrl = letter.unlockToken
    ? `${clientUrl()}/unlock/${letter.unlockToken}`
    : `${clientUrl()}/treasure/${letter._id}`;

  await sendEmail({
    to,
    subject: "🏴‍☠️ A treasure from your past has washed ashore",
    html: shell({
      heading: "Your chest has reached the shore",
      intro: "The tides carried it all this way. Open it when you're ready.",
      ctaText: "Open your treasure",
      ctaUrl: openUrl
    })
  });
}
