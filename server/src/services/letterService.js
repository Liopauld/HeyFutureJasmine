import { Letter } from "../models/Letter.js";
import { sendLetterEmail } from "./emailService.js";

const LOCK_WINDOW_MS = 24 * 60 * 60 * 1000;

/** A letter can be edited/cancelled up to 24h before its delivery date. */
export function canEditLetter(letter) {
  const timeToDelivery = new Date(letter.deliveryDate) - Date.now();
  return timeToDelivery > LOCK_WINDOW_MS;
}

/** Recipients that should receive the delivery email for a letter. */
export function recipientsFor(letter) {
  const senderEmail = letter.sender?.email;
  const set = new Set();
  if (letter.letterType === "us") {
    if (senderEmail) set.add(senderEmail.toLowerCase());
    if (letter.recipientEmail) set.add(letter.recipientEmail.toLowerCase());
  } else if (letter.letterType === "self") {
    if (senderEmail) set.add(senderEmail.toLowerCase());
    else if (letter.recipientEmail) set.add(letter.recipientEmail.toLowerCase());
  } else {
    if (letter.recipientEmail) set.add(letter.recipientEmail.toLowerCase());
  }
  return [...set];
}

/**
 * Deliver a letter exactly once. Atomically claims the letter by flipping its
 * status to "delivered" (only if it wasn't already), then sends notification
 * email(s). Safe to call concurrently from the BullMQ worker AND the cron sweep.
 *
 * @returns {Promise<boolean>} true if THIS call performed the delivery.
 */
export async function deliverLetter(letterId) {
  // Claim: only one caller wins the transition away from a non-delivered state.
  const claimed = await Letter.findOneAndUpdate(
    { _id: letterId, status: { $ne: "delivered" } },
    { $set: { status: "delivered", deliveredAt: new Date() } },
    { new: true }
  ).populate("sender attachments");

  if (!claimed) return false; // already delivered by someone else

  try {
    await sendLetterEmail(claimed);
  } catch (err) {
    // In-app delivery already succeeded; a failed email shouldn't undo it.
    console.warn(`Delivery email failed for letter ${letterId}:`, err.message || err);
  }
  return true;
}
