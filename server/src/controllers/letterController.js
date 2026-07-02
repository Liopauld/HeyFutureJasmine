import crypto from "node:crypto";
import DOMPurify from "isomorphic-dompurify";
import { Letter } from "../models/Letter.js";
import { User } from "../models/User.js";
import { scheduleDelivery, letterQueue } from "../jobs/letterQueue.js";
import { canEditLetter } from "../services/letterService.js";
import { sendLetterSealedEmail } from "../services/emailService.js";

function buildLetterPreview(letter) {
  return {
    _id: letter._id,
    sender: letter.sender,
    recipientEmail: letter.recipientEmail,
    recipientName: letter.recipientName,
    isSelfLetter: letter.isSelfLetter,
    subject: letter.subject,
    body: letter.body,
    attachments: letter.attachments,
    deliveryDate: letter.deliveryDate,
    sentAt: letter.sentAt,
    deliveredAt: letter.deliveredAt,
    status: letter.status,
    visibility: letter.visibility,
    unlockToken: letter.unlockToken,
    likes: letter.likes,
    capsuleTheme: letter.capsuleTheme
  };
}

function isOwnerOrRecipient(letter, user) {
  const sameSender = String(letter.sender?._id || letter.sender) === String(user.id);
  const sameRecipient = letter.recipientEmail?.toLowerCase() === String(user.email || "").toLowerCase();
  return sameSender || sameRecipient;
}

export async function createLetter(req, res, next) {
  try {
    const sender = await User.findById(req.user.id);
    if (!sender?.emailVerified) {
      return res.status(403).json({ message: "Verify your email before setting sail" });
    }

    const deliveryDate = new Date(req.body.deliveryDate);
    const minDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    if (Number.isNaN(deliveryDate.getTime()) || deliveryDate < minDate) {
      return res.status(400).json({ message: "Delivery date must be at least 7 days in the future" });
    }

    const body = DOMPurify.sanitize(req.body.body || "");
    const unlockToken = req.body.isSelfLetter ? undefined : crypto.randomUUID();

    const letter = await Letter.create({
      sender: sender._id,
      recipientEmail: String(req.body.recipientEmail || sender.email).toLowerCase(),
      recipientName: req.body.recipientName || sender.username,
      isSelfLetter: req.body.isSelfLetter ?? true,
      subject: req.body.subject || "A Treasure From Your Past",
      body,
      deliveryDate,
      visibility: req.body.visibility || "private",
      unlockToken,
      capsuleTheme: req.body.capsuleTheme || "default"
    });

    const jobId = await scheduleDelivery(letter);
    letter.jobId = jobId;
    await letter.save();

    await sendLetterSealedEmail({ ...letter.toObject(), sender: { email: sender.email, username: sender.username } });

    return res.status(201).json({ letter: buildLetterPreview(letter) });
  } catch (error) {
    return next(error);
  }
}

export async function getLetters(req, res, next) {
  try {
    const user = await User.findById(req.user.id);
    const letters = await Letter.find({
      $or: [
        { sender: req.user.id },
        { recipientEmail: user.email }
      ]
    }).sort({ createdAt: -1 });

    return res.json({ letters: letters.map(buildLetterPreview) });
  } catch (error) {
    return next(error);
  }
}

export async function getLetterById(req, res, next) {
  try {
    const letter = await Letter.findById(req.params.id).populate("sender attachments");
    if (!letter) {
      return res.status(404).json({ message: "Letter not found" });
    }

    if (letter.visibility === "private" && !isOwnerOrRecipient(letter, req.user)) {
      return res.status(403).json({ message: "Captain, this chest is locked" });
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
      preview: letter.body.slice(0, 140)
    }));

    return res.json({ letters: normalized });
  } catch (error) {
    return next(error);
  }
}

export async function unlockLetter(req, res, next) {
  try {
    const letter = await Letter.findOne({ unlockToken: req.params.token }).populate("sender attachments");
    if (!letter) {
      return res.status(404).json({ message: "Treasure not found" });
    }

    letter.unlockToken = undefined;
    await letter.save();

    return res.json({ letter: buildLetterPreview(letter) });
  } catch (error) {
    return next(error);
  }
}

export async function updateLetter(req, res, next) {
  try {
    const letter = await Letter.findById(req.params.id);
    if (!letter) {
      return res.status(404).json({ message: "Letter not found" });
    }
    if (String(letter.sender) !== String(req.user.id)) {
      return res.status(403).json({ message: "Only the sender can alter this treasure" });
    }
    if (!canEditLetter(letter)) {
      return res.status(423).json({ message: "This chest is already sealed for delivery" });
    }

    if (req.body.body) {
      letter.body = DOMPurify.sanitize(req.body.body);
    }
    if (req.body.subject !== undefined) letter.subject = req.body.subject;
    if (req.body.deliveryDate) letter.deliveryDate = new Date(req.body.deliveryDate);
    if (req.body.visibility) letter.visibility = req.body.visibility;
    if (req.body.capsuleTheme) letter.capsuleTheme = req.body.capsuleTheme;
    if (req.body.recipientEmail) letter.recipientEmail = String(req.body.recipientEmail).toLowerCase();
    if (req.body.recipientName !== undefined) letter.recipientName = req.body.recipientName;

    await letter.save();
    return res.json({ letter: buildLetterPreview(letter) });
  } catch (error) {
    return next(error);
  }
}

export async function deleteLetter(req, res, next) {
  try {
    const letter = await Letter.findById(req.params.id);
    if (!letter) {
      return res.status(404).json({ message: "Letter not found" });
    }
    if (String(letter.sender) !== String(req.user.id)) {
      return res.status(403).json({ message: "Only the sender can abandon this chest" });
    }
    if (!canEditLetter(letter)) {
      return res.status(423).json({ message: "This chest is already sealed for delivery" });
    }

    if (letter.jobId) {
      await letterQueue.removeJobs(`letter-${letter._id}`);
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
