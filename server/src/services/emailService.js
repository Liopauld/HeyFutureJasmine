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
  const primaryOrigin = process.env.CLIENT_URLS?.split(",").find((origin) => origin.trim());
  return (process.env.CLIENT_URL?.trim() || primaryOrigin?.trim() || "http://localhost:5173")
    .replace(/\/$/, "");
}

/** Parchment-styled HTML email shell. */
function shell({ heading, intro, ctaText, ctaUrl, footnote, showDirectUrl = false }) {
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
        showDirectUrl && ctaUrl
          ? `<div style="margin-top:18px;font-size:13px;color:#3a2a18;">
               If the button doesn't open, copy and paste this address into your browser:
               <div style="margin-top:8px;word-break:break-all;">${ctaUrl}</div>
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

/** Only local development may mock email. Production failures must be visible. */
export async function sendEmail({ to, subject, html, text }) {
  const recipients = Array.isArray(to) ? to : [to];
  if (process.env.EMAIL_PROVIDER === "brevo") {
    try {
      const apiKey = process.env.BREVO_API_KEY?.trim();
      const senderEmail = process.env.BREVO_SENDER_EMAIL?.trim();
      if (!apiKey || !senderEmail) throw new Error("BREVO_API_KEY and BREVO_SENDER_EMAIL are required");
      const response = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: { "api-key": apiKey, "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          sender: { name: "HeyFutureJasmine", email: senderEmail },
          to: recipients.map((email) => ({ email })), subject, htmlContent: html,
          ...(text ? { textContent: text } : {})
        }),
        signal: AbortSignal.timeout(15000)
      });
      const result = await response.json();
      if (!response.ok || !result.messageId) throw new Error(result.message || `Brevo rejected the email (${response.status})`);
      return { data: { id: result.messageId } };
    } catch (err) {
      console.warn(`[email] Brevo send failed: ${err.message}`);
      const error = new Error("Email could not be sent. Please try again later.");
      error.status = 503;
      throw error;
    }
  }
  if (!resend) {
    if (process.env.NODE_ENV === "production") {
      const error = new Error("Email sending is not configured. Please try again later.");
      error.status = 503;
      console.warn("[email] RESEND_API_KEY is missing or invalid");
      throw error;
    }
    console.log(`\n[email:dev] → ${recipients.join(", ")}\n[subject] ${subject}\n`);
    return { mocked: true };
  }
  try {
    const result = await resend.emails.send({ from: FROM, to: recipients, subject, html, ...(text ? { text } : {}) });
    if (result.error) throw new Error(result.error.message || "Resend rejected the email");
    if (!result.data?.id) throw new Error("Resend did not accept the email");
    return result;
  } catch (err) {
    console.warn(`[email] Resend send failed: ${err.message}`);
    const error = new Error("Email could not be sent. Please try again later.");
    error.status = 503;
    throw error;
  }
}

export async function sendVerificationEmail(email, token) {
  const verificationUrl = `${clientUrl()}/verify-email/${token}`;
  return sendEmail({
    to: email,
    subject: "Verify your Log Pose, nakama",
    text: `Confirm your email by copying and pasting this address into your browser:\n\n${verificationUrl}\n\nIf you didn't sign up, you can ignore this message.`,
    html: shell({
      heading: "Confirm your email",
      intro: "One tap sets your course. Confirm your email to start sealing treasures.",
      ctaText: "Verify email",
      ctaUrl: verificationUrl,
      showDirectUrl: true,
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
