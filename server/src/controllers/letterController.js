import crypto from "node:crypto";
import DOMPurify from "isomorphic-dompurify";
import { Letter } from "../models/Letter.js";
import { User } from "../models/User.js";
import { Attachment } from "../models/Attachment.js";
import { scheduleDelivery, letterQueue } from "../jobs/letterQueue.js";
import { canEditLetter } from "../services/letterService.js";
import { sendLetterSealedEmail } from "../services/emailService.js";

/** Light pirate-rank progression by letters sent. */
function rankFor(count) {
  if (count >= 51) return { title: "Pirate King", bounty: 1_500_000_000 };
  if (count >= 26) return { title: "Yonko Scribe", bounty: 1_000_000_000 };
  if (count >= 11) return { title: "Warlord of Letters", bounty: 300_000_000 };
  if (count >= 4) return { title: "Sea Dog", bounty: 50_000_000 };
  if (count >= 1) return { title: "Rookie Pirate", bounty: 1_000_000 };
  return { title: "Landlubber", bounty: 0 };
}

function senderView(sender) {
  if (!sender || typeof sender !== "object" || !sender.username) return undefined;
  return {
    id: sender._id,
    username: sender.username,
    displayName: sender.displayName || sender.username,
    avatar: sender.avatar || null
  };
}

/** Shape a letter for the client. `redactBody` hides content for sealed chests. */
function buildLetterPreview(letter, { redactBody = false } = {}) {
  return {
    _id: letter._id,
    sender: letter.sender?._id || letter.sender,
    senderInfo: senderView(letter.sender),
    letterType: letter.letterType,
    isSelfLetter: letter.isSelfLetter,
    recipientEmail: letter.recipientEmail,
    recipientName: letter.recipientName,
    subject: letter.subject,
    body: redactBody ? "" : letter.body,
    sealed: letter.status !== "delivered",
    attachments: redactBody ? [] : letter.attachments,
    song: redactBody ? undefined : letter.song,
    replyTo: letter.replyTo?._id || letter.replyTo || null,
    deliveryDate: letter.deliveryDate,
    sentAt: letter.sentAt,
    deliveredAt: letter.deliveredAt,
    openedAt: letter.openedAt,
    status: letter.status,
    visibility: letter.visibility,
    unlockToken: letter.unlockToken,
    likes: letter.likes,
    capsuleTheme: letter.capsuleTheme,
    createdAt: letter.createdAt
  };
}

function relationTo(letter, user) {
  const isSender = String(letter.sender?._id || letter.sender) === String(user.id);
  const isRecipient =
    letter.recipientEmail?.toLowerCase() === String(user.email || "").toLowerCase();
  return { isSender, isRecipient };
}

export async function createLetter(req, res, next) {
  try {
    const sender = await User.findById(req.user.id).populate("partner");
    if (!sender?.emailVerified) {
      return res.status(403).json({ message: "Verify your email before setting sail" });
    }

    const letterType = ["self", "partner", "us"].includes(req.body.letterType)
      ? req.body.letterType
      : req.body.isSelfLetter === false
        ? "partner"
        : "self";

    // Resolve recipient from the letter type.
    let recipientEmail;
    let recipientName;
    if (letterType === "self") {
      recipientEmail = sender.email;
      recipientName = sender.displayName || sender.username;
    } else {
      if (!sender.partner) {
        return res.status(400).json({ message: "Pair with your partner before writing to them" });
      }
      recipientEmail = sender.partner.email;
      recipientName = sender.partner.displayName || sender.partner.username;
    }

    const deliveryDate = new Date(req.body.deliveryDate);
    if (Number.isNaN(deliveryDate.getTime()) || deliveryDate.getTime() <= Date.now()) {
      return res.status(400).json({ message: "Chart a delivery date in the future" });
    }

    const body = DOMPurify.sanitize(req.body.body || "");
    if (!body.trim()) {
      return res.status(400).json({ message: "Your letter needs some words" });
    }

    // Only mint an unlock token when the recipient isn't a registered user.
    let unlockToken;
    if (letterType !== "self") {
      const recipientUser = await User.findOne({ email: recipientEmail });
      if (!recipientUser) unlockToken = crypto.randomUUID();
    }

    // Validate optional song.
    let song;
    if (req.body.song?.url) {
      song = {
        provider: ["spotify", "youtube", "apple", "other"].includes(req.body.song.provider)
          ? req.body.song.provider
          : "other",
        url: req.body.song.url,
        title: req.body.song.title,
        artist: req.body.song.artist
      };
    }

    const letter = await Letter.create({
      sender: sender._id,
      letterType,
      isSelfLetter: letterType === "self",
      recipientEmail: String(recipientEmail).toLowerCase(),
      recipientName,
      subject: req.body.subject || "A Treasure From Your Past",
      body,
      deliveryDate,
      visibility: req.body.visibility || "private",
      unlockToken,
      capsuleTheme: req.body.capsuleTheme || "default",
      song,
      replyTo: req.body.replyTo || null
    });

    // Link uploaded attachments (only ones this user owns and that are unassigned).
    if (Array.isArray(req.body.attachments) && req.body.attachments.length) {
      const owned = await Attachment.find({
        _id: { $in: req.body.attachments },
        uploader: sender._id
      });
      const ids = owned.map((a) => a._id);
      if (ids.length) {
        await Attachment.updateMany({ _id: { $in: ids } }, { $set: { letter: letter._id } });
        letter.attachments = ids;
      }
    }

    // Schedule precise delivery (no-op without Redis; the sweep covers it).
    const jobId = await scheduleDelivery(letter);
    if (jobId) letter.jobId = jobId;
    await letter.save();

    // Light gamification: bump rank by total letters sent.
    const count = await Letter.countDocuments({ sender: sender._id });
    const { title, bounty } = rankFor(count);
    sender.pirateTitle = title;
    sender.bounty = bounty;
    await sender.save();

    await sendLetterSealedEmail({
      ...letter.toObject(),
      sender: { email: sender.email, username: sender.username }
    });

    const populated = await letter.populate("attachments");
    return res.status(201).json({ letter: buildLetterPreview(populated) });
  } catch (error) {
    return next(error);
  }
}

export async function getLetters(req, res, next) {
  try {
    const user = await User.findById(req.user.id);
    const letters = await Letter.find({
      $or: [{ sender: req.user.id }, { recipientEmail: user.email }]
    })
      .sort({ createdAt: -1 })
      .populate("sender attachments");

    // Redact the body of any chest that hasn't been delivered — the dashboard
    // shows sealed chests, never their contents.
    const previews = letters.map((letter) =>
      buildLetterPreview(letter, { redactBody: letter.status !== "delivered" })
    );
    return res.json({ letters: previews });
  } catch (error) {
    return next(error);
  }
}

export async function getLetterById(req, res, next) {
  try {
    const letter = await Letter.findById(req.params.id).populate("sender attachments");
    if (!letter) return res.status(404).json({ message: "Letter not found" });

    const { isSender, isRecipient } = relationTo(letter, req.user);

    if (letter.visibility === "private" && !isSender && !isRecipient) {
      return res.status(403).json({ message: "Captain, this chest isn't yours to open" });
    }

    // Recipients cannot peek before delivery — that would spoil the surprise.
    if (letter.status !== "delivered" && !isSender) {
      const when = new Date(letter.deliveryDate).toLocaleDateString();
      return res.status(423).json({ message: `This chest is still sealed. It opens on ${when}.` });
    }

    // Stamp the first opening (the reveal moment) when a recipient opens it.
    if (letter.status === "delivered" && isRecipient && !letter.openedAt) {
      letter.openedAt = new Date();
      await letter.save();
    }

    return res.json({ letter: buildLetterPreview(letter) });
  } catch (error) {
    return next(error);
  }
}

export async function getPublicLetters(req, res, next) {
  try {
    const letters = await Letter.find({
      visibility: { $in: ["public_anonymous", "public_named"] },
      status: "delivered"
    })
      .sort({ deliveredAt: -1, likes: -1 })
      .limit(40)
      .populate("sender");

    const normalized = letters.map((letter) => ({
      ...buildLetterPreview(letter),
      publicAuthor:
        letter.visibility === "public_named"
          ? letter.sender?.username || "Unknown Captain"
          : "Ghost of Jaya",
      preview: String(letter.body || "").replace(/<[^>]*>/g, "").slice(0, 140)
    }));

    return res.json({ letters: normalized });
  } catch (error) {
    return next(error);
  }
}

export async function unlockLetter(req, res, next) {
  try {
    const letter = await Letter.findOne({ unlockToken: req.params.token }).populate(
      "sender attachments"
    );
    if (!letter) return res.status(404).json({ message: "Treasure not found" });
    if (letter.status !== "delivered") {
      const when = new Date(letter.deliveryDate).toLocaleDateString();
      return res.status(423).json({ message: `This chest is still sealed. It opens on ${when}.` });
    }

    if (!letter.openedAt) {
      letter.openedAt = new Date();
      await letter.save();
    }

    return res.json({ letter: buildLetterPreview(letter) });
  } catch (error) {
    return next(error);
  }
}

export async function updateLetter(req, res, next) {
  try {
    const letter = await Letter.findById(req.params.id);
    if (!letter) return res.status(404).json({ message: "Letter not found" });
    if (String(letter.sender) !== String(req.user.id)) {
      return res.status(403).json({ message: "Only the sender can alter this treasure" });
    }
    if (!canEditLetter(letter)) {
      return res.status(423).json({ message: "This chest is already sealed for delivery" });
    }

    if (req.body.body) letter.body = DOMPurify.sanitize(req.body.body);
    if (req.body.subject !== undefined) letter.subject = req.body.subject;
    if (req.body.deliveryDate) letter.deliveryDate = new Date(req.body.deliveryDate);
    if (req.body.visibility) letter.visibility = req.body.visibility;
    if (req.body.capsuleTheme) letter.capsuleTheme = req.body.capsuleTheme;
    if (req.body.song?.url !== undefined) letter.song = req.body.song;

    await letter.save();
    return res.json({ letter: buildLetterPreview(letter) });
  } catch (error) {
    return next(error);
  }
}

export async function deleteLetter(req, res, next) {
  try {
    const letter = await Letter.findById(req.params.id);
    if (!letter) return res.status(404).json({ message: "Letter not found" });
    if (String(letter.sender) !== String(req.user.id)) {
      return res.status(403).json({ message: "Only the sender can abandon this chest" });
    }
    if (!canEditLetter(letter)) {
      return res.status(423).json({ message: "This chest is already sealed for delivery" });
    }

    if (letter.jobId && letterQueue) {
      await letterQueue.remove(`letter-${letter._id}`).catch(() => {});
    }
    await letter.deleteOne();
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
}

export async function likeLetter(req, res, next) {
  try {
    const letter = await Letter.findById(req.params.id);
    if (!letter || !["public_anonymous", "public_named"].includes(letter.visibility)) {
      return res.status(404).json({ message: "Letter not found" });
    }
    letter.likes += 1;
    await letter.save();
    return res.json({ likes: letter.likes });
  } catch (error) {
    return next(error);
  }
}
