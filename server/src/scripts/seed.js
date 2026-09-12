import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDb } from "../config/db.js";
import { User } from "../models/User.js";
import { Letter } from "../models/Letter.js";
import { hashPassword } from "../utils/hash.js";

dotenv.config();

const PASSWORD = "grandline";
const days = (n) => new Date(Date.now() + n * 24 * 60 * 60 * 1000);

async function seed() {
  await connectDb();

  const paulEmail = "paul@heyfuturejasmine.app";
  const jasmineEmail = "jasmine@heyfuturejasmine.app";

  // Idempotent: wipe prior seed users + their letters.
  const prior = await User.find({ email: { $in: [paulEmail, jasmineEmail] } }).select("_id");
  const priorIds = prior.map((u) => u._id);
  if (priorIds.length) {
    await Letter.deleteMany({ sender: { $in: priorIds } });
    await User.deleteMany({ _id: { $in: priorIds } });
  }

  const passwordHash = await hashPassword(PASSWORD);

  const [paul, jasmine] = await User.create([
    {
      username: "Paul",
      displayName: "Paul",
      email: paulEmail,
      passwordHash,
      emailVerified: true,
      pirateTitle: "Sea Dog",
      anniversary: new Date("2023-02-14")
    },
    {
      username: "Jasmine",
      displayName: "Jasmine",
      email: jasmineEmail,
      passwordHash,
      emailVerified: true,
      pirateTitle: "Sea Dog",
      anniversary: new Date("2023-02-14")
    }
  ]);

  // Pair them.
  paul.partner = jasmine._id;
  jasmine.partner = paul._id;
  await Promise.all([paul.save(), jasmine.save()]);

  await Letter.create([
    // Delivered self-letter (Jasmine can open this immediately).
    {
      sender: jasmine._id,
      letterType: "self",
      isSelfLetter: true,
      recipientEmail: jasmineEmail,
      recipientName: "Jasmine",
      subject: "To the girl who was scared to begin",
      body: "<p>If you're reading this, the tides finally turned. I hope you're proud of how far you sailed.</p><p>Remember the mornings that felt impossible? You made it through every one.</p>",
      deliveryDate: days(-30),
      sentAt: days(-395),
      status: "delivered",
      deliveredAt: days(-30),
      capsuleTheme: "gold"
    },
    // Delivered partner letter (a treasure from Paul, waiting for Jasmine to open).
    {
      sender: paul._id,
      letterType: "partner",
      isSelfLetter: false,
      recipientEmail: jasmineEmail,
      recipientName: "Jasmine",
      subject: "Read this when you get home",
      body: "<p>By the time this washes ashore, we'll have a whole year more of stories. I wrote it so future-us would remember this exact ordinary Tuesday.</p>",
      deliveryDate: days(-2),
      sentAt: days(-90),
      status: "delivered",
      deliveredAt: days(-2),
      capsuleTheme: "scroll"
    },
    // Sealed partner letter (still sailing).
    {
      sender: paul._id,
      letterType: "partner",
      isSelfLetter: false,
      recipientEmail: jasmineEmail,
      recipientName: "Jasmine",
      subject: "Do not open till you miss me",
      body: "<p>Sealed for a rainy day. You'll know when.</p>",
      deliveryDate: days(45),
      status: "sealed",
      capsuleTheme: "default"
    },
    // Sealed "us" capsule, opened together next anniversary-ish.
    {
      sender: jasmine._id,
      letterType: "us",
      isSelfLetter: false,
      recipientEmail: paulEmail,
      recipientName: "Paul",
      subject: "For us, a year from now",
      body: "<p>Let's read this together and see how many of our plans came true.</p>",
      deliveryDate: days(365),
      status: "sealed",
      capsuleTheme: "skypiea"
    },
    // Public delivered letters on the Noticeboard
    {
      sender: paul._id,
      letterType: "self",
      isSelfLetter: true,
      recipientEmail: paulEmail,
      recipientName: "Paul",
      subject: "A message to any voyager braving the Grand Line",
      body: "<p>The sea is endless, but with true nakama by your side, no storm is insurmountable. Never give up on your dreams!</p>",
      deliveryDate: days(-10),
      sentAt: days(-180),
      status: "delivered",
      deliveredAt: days(-10),
      capsuleTheme: "gold",
      visibility: "public_named",
      likes: 12
    },
    {
      sender: jasmine._id,
      letterType: "self",
      isSelfLetter: true,
      recipientEmail: jasmineEmail,
      recipientName: "Jasmine",
      subject: "Finding light in the darkest waters",
      body: "<p>Remember why you embarked on this voyage. Every sunrise over the ocean brings new hope and new treasures.</p>",
      deliveryDate: days(-5),
      sentAt: days(-60),
      status: "delivered",
      deliveredAt: days(-5),
      capsuleTheme: "skypiea",
      visibility: "public_named",
      likes: 24
    }
  ]);

  console.log("\n🌊 Seed complete.");
  console.log("   Paul     →", paulEmail, "/", PASSWORD);
  console.log("   Jasmine  →", jasmineEmail, "/", PASSWORD);
  console.log("   (paired, email-verified, with sample letters)\n");

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
