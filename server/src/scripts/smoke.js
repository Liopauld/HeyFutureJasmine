/**
 * End-to-end smoke test against an in-memory MongoDB (no Docker/Redis needed).
 * Exercises the real HTTP API: auth → verify → pair → write → access control →
 * force-deliver → reveal → the cron delivery sweep.
 *
 * Run: npm run smoke
 */
import { MongoMemoryServer } from "mongodb-memory-server";

const results = [];
const check = (label, cond) => {
  results.push({ label, ok: !!cond });
  console.log(`${cond ? "✓" : "✗"} ${label}`);
};

async function main() {
  const mem = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mem.getUri();
  process.env.JWT_ACCESS_SECRET = "test_access_secret";
  process.env.JWT_REFRESH_SECRET = "test_refresh_secret";
  process.env.NODE_ENV = "test";
  process.env.ENABLE_DEV_ROUTES = "true";
  process.env.CLIENT_URL = "http://localhost:5173";
  delete process.env.REDIS_HOST; // exercise the sweep path, not BullMQ

  const { default: app } = await import("../app.js");
  const { connectDb } = await import("../config/db.js");
  const { User } = await import("../models/User.js");
  const { Letter } = await import("../models/Letter.js");
  const { Attachment } = await import("../models/Attachment.js");
  await connectDb();

  const server = app.listen(0);
  const port = server.address().port;
  const base = `http://localhost:${port}/api`;

  const req = async (method, path, { token, body } = {}) => {
    const res = await fetch(base + path, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: body ? JSON.stringify(body) : undefined
    });
    let data = null;
    try {
      data = await res.json();
    } catch {
      /* 204 etc. */
    }
    return { status: res.status, data };
  };

  try {
    // Health
    check("health responds ok", (await req("GET", "/health")).data?.status === "ok");

    // Register two accounts
    const paul = (await req("POST", "/auth/register", {
      body: { username: "PaulTest", email: "paul.test@x.io", password: "grandline" }
    })).data;
    const jasmine = (await req("POST", "/auth/register", {
      body: { username: "JasmineTest", email: "jasmine.test@x.io", password: "grandline" }
    })).data;
    check("register returns access tokens", paul?.accessToken && jasmine?.accessToken);

    // Verify emails via the real endpoint (fetch tokens from DB)
    const paulDoc = await User.findOne({ email: "paul.test@x.io" });
    const jasDoc = await User.findOne({ email: "jasmine.test@x.io" });
    const verify = await req("GET", `/auth/verify-email/${paulDoc.emailVerificationToken}`);
    await req("GET", `/auth/verify-email/${jasDoc.emailVerificationToken}`);
    check("email verification succeeds", verify.status === 200);

    // Pair them (HFJ-008)
    const invite = await req("POST", "/users/me/pair/invite", { token: paul.accessToken });
    check("invite code is 8 characters uppercase", invite.status === 200 && invite.data.code?.length === 8);

    // Self-pairing guard
    const selfPair = await req("POST", "/users/me/pair/accept", {
      token: paul.accessToken,
      body: { code: invite.data.code }
    });
    check("self-pairing is rejected (400)", selfPair.status === 400);

    const accept = await req("POST", "/users/me/pair/accept", {
      token: jasmine.accessToken,
      body: { code: invite.data.code }
    });
    check("partner pairing links the couple", accept.status === 200 && accept.data.partner);

    // Mutual partner IDs in DB
    const pDoc = await User.findOne({ email: "paul.test@x.io" });
    const jDoc = await User.findOne({ email: "jasmine.test@x.io" });
    check("mutual partner ObjectIds set in database", String(pDoc.partner) === String(jDoc._id) && String(jDoc.partner) === String(pDoc._id));

    // Paul writes a partner letter to Jasmine (future date) with a song
    const soon = new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString();
    const created = await req("POST", "/letters", {
      token: paul.accessToken,
      body: {
        letterType: "partner",
        subject: "Test treasure",
        body: "<p>Hello future you.</p>",
        deliveryDate: soon,
        song: { url: "https://open.spotify.com/track/abc123", title: "Our song" }
      }
    });
    const letterId = created.data?.letter?._id;
    check("create partner letter", created.status === 201 && letterId);
    check("recipient resolved to partner email", created.data?.letter?.recipientEmail === "jasmine.test@x.io");

    // Access control: recipient can't peek before delivery
    const peek = await req("GET", `/letters/${letterId}`, { token: jasmine.accessToken });
    check("sealed letter is hidden from recipient (423)", peek.status === 423);

    // Non-partner can't view at all
    const nami = (await req("POST", "/auth/register", {
      body: { username: "NamiTest", email: "nami.test@x.io", password: "grandline" }
    })).data;
    const outsider = await req("GET", `/letters/${letterId}`, { token: nami.accessToken });
    check("private letter forbidden to outsider (403)", outsider.status === 403);

    // Consumed code cannot be reused
    const reusedCode = await req("POST", "/users/me/pair/accept", {
      token: nami.accessToken,
      body: { code: invite.data.code }
    });
    check("consumed pairing code is rejected", reusedCode.status === 404 || reusedCode.status === 409);

    // The sender can't peek at their own sealed chest either — only the edit view
    // hands the words back, and only inside the 24h window.
    const senderPeek = await req("GET", `/letters/${letterId}`, { token: paul.accessToken });
    check(
      "sender sees own sealed letter redacted",
      senderPeek.status === 200 &&
        senderPeek.data?.letter?.sealed === true &&
        senderPeek.data?.letter?.body === ""
    );

    const editView = await req("GET", `/letters/${letterId}/edit`, { token: paul.accessToken });
    check(
      "edit view returns the full body to the sender",
      editView.status === 200 && editView.data?.letter?.body?.includes("future you")
    );
    const editOther = await req("GET", `/letters/${letterId}/edit`, { token: jasmine.accessToken });
    check("edit view forbidden to the recipient (403)", editOther.status === 403);

    // Editing inside the window
    const edited = await req("PATCH", `/letters/${letterId}`, {
      token: paul.accessToken,
      body: { subject: "Edited treasure", body: "<p>Hello future you, again.</p>" }
    });
    check(
      "sender can edit a chest outside the lock window",
      edited.status === 200 && edited.data?.letter?.subject === "Edited treasure"
    );

    // Inside 24h the chest is locked for both editing and reading back
    const lockedLetter = await Letter.create({
      sender: paulDoc._id,
      letterType: "self",
      isSelfLetter: true,
      recipientEmail: "paul.test@x.io",
      recipientName: "Paul",
      subject: "Locked",
      body: "<p>almost there</p>",
      deliveryDate: new Date(Date.now() + 2 * 3600 * 1000),
      status: "sealed"
    });
    const lockedEdit = await req("GET", `/letters/${lockedLetter._id}/edit`, {
      token: paul.accessToken
    });
    check("edit view is 423 once inside the lock window", lockedEdit.status === 423);
    const lockedPatch = await req("PATCH", `/letters/${lockedLetter._id}`, {
      token: paul.accessToken,
      body: { subject: "Too late" }
    });
    check("patch is 423 once inside the lock window", lockedPatch.status === 423);
    const lockedDelete = await req("DELETE", `/letters/${lockedLetter._id}`, {
      token: paul.accessToken
    });
    check("delete is 423 once inside the lock window", lockedDelete.status === 423);

    // Force-deliver (dev) then reveal
    const forced = await req("POST", `/dev/deliver/${letterId}`, { token: paul.accessToken });
    check("force-deliver succeeds", forced.status === 200 && forced.data.delivered === true);

    const reveal = await req("GET", `/letters/${letterId}`, { token: jasmine.accessToken });
    check("recipient can open delivered letter", reveal.status === 200);
    check("revealed letter includes the body", reveal.data?.letter?.body?.includes("future you"));
    check("opening stamps openedAt", Boolean(reveal.data?.letter?.openedAt));

    // Sweep: insert an overdue sealed letter directly, then run the sweep
    const overdue = await Letter.create({
      sender: jasDoc._id,
      letterType: "self",
      isSelfLetter: true,
      recipientEmail: "jasmine.test@x.io",
      recipientName: "Jasmine",
      subject: "Overdue",
      body: "<p>past</p>",
      deliveryDate: new Date(Date.now() - 60_000),
      status: "sealed"
    });
    const swept = await req("POST", "/dev/sweep", { token: jasmine.accessToken });
    const overdueAfter = await Letter.findById(overdue._id);
    check("sweep delivers overdue letters", swept.data.delivered >= 1 && overdueAfter.status === "delivered");

    // Idempotency: a second sweep delivers nothing new
    const swept2 = await req("POST", "/dev/sweep", { token: jasmine.accessToken });
    check("sweep is idempotent (no double-send)", swept2.data.delivered === 0);

    // Request-triggered sweep: the safety net for a host that sleeps the process
    // and kills the cron. Any request — even the health check — catches up.
    const { resetSweepThrottle } = await import("../middleware/sweepOnRequest.js");
    const stranded = await Letter.create({
      sender: paulDoc._id,
      letterType: "self",
      isSelfLetter: true,
      recipientEmail: "paul.test@x.io",
      recipientName: "Paul",
      subject: "Stranded",
      body: "<p>the cron never ran</p>",
      deliveryDate: new Date(Date.now() - 60_000),
      status: "sealed"
    });
    resetSweepThrottle();
    await req("GET", "/health");
    // The middleware is fire-and-forget; give it a beat to finish.
    await new Promise((resolve) => setTimeout(resolve, 300));
    const strandedAfter = await Letter.findById(stranded._id);
    check("a plain request delivers an overdue letter", strandedAfter.status === "delivered");

    // Public Noticeboard & Trident Likes E2E Tests (HFJ-001)
    const publicLetter = await Letter.create({
      sender: paulDoc._id,
      letterType: "self",
      isSelfLetter: true,
      recipientEmail: "paul.test@x.io",
      recipientName: "Paul",
      subject: "A Tale from Jaya",
      body: "<p>Legends say the golden bell rings in the clouds.</p>",
      deliveryDate: new Date(Date.now() - 3600_000),
      deliveredAt: new Date(),
      status: "delivered",
      visibility: "public_anonymous",
      likes: 5
    });

    const publicFeed = await req("GET", "/letters/public");
    const foundPublic = publicFeed.data?.letters?.find((l) => l._id === String(publicLetter._id));
    check("public noticeboard returns delivered public letter", Boolean(foundPublic));
    check("anonymous public letter hides sender identity", foundPublic?.senderInfo?.isAnonymous === true);
    check("private letters are not returned in public noticeboard", !publicFeed.data?.letters?.some((l) => l._id === String(lockedLetter._id)));

    // Trident Salute
    const likeRes = await req("POST", `/letters/${publicLetter._id}/like`);
    check("trident salute increments likes counter", likeRes.status === 200 && likeRes.data?.likes === 6);

    // External Recipient & Guest Unlock E2E Tests (HFJ-002)
    const guestDeliveryDate = new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString();
    const guestLetterRes = await req("POST", "/letters", {
      token: paul.accessToken,
      body: {
        letterType: "other",
        recipientEmail: "sanji.chef@baratie.sea",
        recipientName: "Sanji",
        addToCrew: true,
        subject: "Recipes of the All Blue",
        body: "<p>Feed anyone who is hungry on the sea.</p>",
        deliveryDate: guestDeliveryDate
      }
    });

    const guestLetterId = guestLetterRes.data?.letter?._id;
    const guestUnlockToken = guestLetterRes.data?.letter?.unlockToken;
    check("create external recipient letter returns unlock token", guestLetterRes.status === 201 && Boolean(guestUnlockToken));

    // Verify sender's crewMembers array was updated
    const updatedPaulDoc = await User.findOne({ email: "paul.test@x.io" });
    const crewAdded = updatedPaulDoc?.crewMembers?.some((c) => c.email === "sanji.chef@baratie.sea");
    check("recipient saved to sender crew address book", Boolean(crewAdded));

    // Sealed guest letter cannot be unlocked before delivery (423)
    const preDeliverUnlock = await req("GET", `/letters/unlock/${guestUnlockToken}`);
    check("guest unlock fails before delivery (423)", preDeliverUnlock.status === 423);

    // Force deliver guest letter
    await req("POST", `/dev/deliver/${guestLetterId}`, { token: paul.accessToken });

    // Guest accesses without auth token
    const guestUnlockRes = await req("GET", `/letters/unlock/${guestUnlockToken}`);
    check("unauthenticated guest unlock succeeds once delivered", guestUnlockRes.status === 200);
    check("guest unlocked letter reveals body", guestUnlockRes.data?.letter?.body?.includes("Feed anyone"));

    // Invalid unlock token returns 404
    const invalidTokenRes = await req("GET", "/letters/unlock/non-existent-uuid-token");
    check("invalid unlock token returns 404", invalidTokenRes.status === 404);

    // Dev SuperPeek & Dev Route E2E Tests (HFJ-003)
    const futureCapsule = await Letter.create({
      sender: paulDoc._id,
      letterType: "self",
      isSelfLetter: true,
      recipientEmail: "paul.test@x.io",
      recipientName: "Paul",
      subject: "Secret Pirate Map",
      body: "<p>Hidden treasure is buried at coordinates 42, -71.</p>",
      deliveryDate: new Date(Date.now() + 5 * 365 * 24 * 3600 * 1000), // 5 years in future
      status: "sealed"
    });

    // SuperPeek returns full body in dev mode
    const peekRes = await req("GET", `/dev/peek/${futureCapsule._id}`, { token: paul.accessToken });
    check("superpeek returns unredacted body for sealed letter", peekRes.status === 200 && peekRes.data?.letter?.body?.includes("Hidden treasure"));
    check("superpeek letter is marked as superPeek", peekRes.data?.letter?.superPeek === true);

    // Verify letter in DB is still sealed
    const futureDocAfter = await Letter.findById(futureCapsule._id);
    check("superpeek does not modify sealed status in database", futureDocAfter.status === "sealed");

    // Pirate Rank Progression & Bounty Showcase E2E Tests (HFJ-004)
    const { rankFor } = await import("../controllers/letterController.js");
    check("rankFor: 0 letters = Landlubber (฿0)", rankFor(0).title === "Landlubber" && rankFor(0).bounty === 0);
    check("rankFor: 1 letter = Rookie Pirate (฿1,000,000)", rankFor(1).title === "Rookie Pirate" && rankFor(1).bounty === 1_000_000);
    check("rankFor: 4 letters = Sea Dog (฿50,000,000)", rankFor(4).title === "Sea Dog" && rankFor(4).bounty === 50_000_000);
    check("rankFor: 11 letters = Warlord of Letters (฿300,000,000)", rankFor(11).title === "Warlord of Letters" && rankFor(11).bounty === 300_000_000);
    check("rankFor: 26 letters = Yonko Scribe (฿1,000,000,000)", rankFor(26).title === "Yonko Scribe" && rankFor(26).bounty === 1_000_000_000);
    check("rankFor: 51 letters = Pirate King (฿1,500,000,000)", rankFor(51).title === "Pirate King" && rankFor(51).bounty === 1_500_000_000);

    // Register a fresh pirate to verify starting rank
    const luffy = (await req("POST", "/auth/register", {
      body: { username: "MonkeyDLuffy", email: "luffy@sunny.sea", password: "grandlinepirate" }
    })).data;
    const luffyDoc = await User.findOne({ email: "luffy@sunny.sea" });
    check("new user starts as Landlubber with 0 bounty", luffyDoc.pirateTitle === "Landlubber" && luffyDoc.bounty === 0);

    // Verify email and create first letter -> rank updates to Rookie Pirate
    await req("GET", `/auth/verify-email/${luffyDoc.emailVerificationToken}`);
    await req("POST", "/letters", {
      token: luffy.accessToken,
      body: {
        letterType: "self",
        subject: "Becoming Pirate King",
        body: "<p>I will find the One Piece!</p>",
        deliveryDate: new Date(Date.now() + 10 * 24 * 3600 * 1000).toISOString()
      }
    });

    const luffyDocAfter = await User.findOne({ email: "luffy@sunny.sea" });
    check("user profile automatically bumps to Rookie Pirate (฿1,000,000)", luffyDocAfter.pirateTitle === "Rookie Pirate" && luffyDocAfter.bounty === 1_000_000);

    // Saved Crew Management & Address Book E2E Tests (HFJ-009)
    const addCrewRes = await req("POST", "/users/me/crew", {
      token: paul.accessToken,
      body: { name: "Roronoa Zoro", email: "zoro@sunny.sea" }
    });
    check("add crew member returns 201 with updated list", addCrewRes.status === 201 && addCrewRes.data?.crewMembers?.some((c) => c.email === "zoro@sunny.sea"));

    // Prevent duplicate emails
    const dupCrewRes = await req("POST", "/users/me/crew", {
      token: paul.accessToken,
      body: { name: "Zoro Duplicate", email: "zoro@sunny.sea" }
    });
    check("duplicate crew email is rejected (400)", dupCrewRes.status === 400);

    // Get crew list
    const getCrewRes = await req("GET", "/users/me/crew", { token: paul.accessToken });
    const zoroMember = getCrewRes.data?.crewMembers?.find((c) => c.email === "zoro@sunny.sea");
    check("get crew returns saved members", getCrewRes.status === 200 && Boolean(zoroMember));

    // Remove crew member
    if (zoroMember) {
      const delCrewRes = await req("DELETE", `/users/me/crew/${zoroMember._id}`, { token: paul.accessToken });
      check("delete crew member returns 204", delCrewRes.status === 204);
    }

    // Shared Anniversary & Couple Capsule Milestones E2E Tests (HFJ-010)
    const patchAnnivRes = await req("PATCH", "/users/me", {
      token: paul.accessToken,
      body: { anniversary: "2023-11-14T00:00:00.000Z" }
    });
    check("update anniversary returns updated user", patchAnnivRes.status === 200 && patchAnnivRes.data?.user?.anniversary);

    // Verify synced to partner automatically
    const updatedJasDoc = await User.findOne({ email: "jasmine.test@x.io" });
    check("shared anniversary automatically syncs to partner", Boolean(updatedJasDoc.anniversary));

    // Voice Memo & Audio Waveform E2E Tests (HFJ-011)
    const voiceAttachment = await Attachment.create({
      uploader: paulDoc._id,
      cloudinaryPublicId: "hfj_voice_test_123",
      url: "http://res.cloudinary.com/demo/video/upload/voice-note.webm",
      secureUrl: "https://res.cloudinary.com/demo/video/upload/voice-note.webm",
      resourceType: "video",
      kind: "voice",
      duration: 12.5,
      originalName: "voice-note.webm",
      fileSize: 45000,
      format: "webm"
    });
    check("create voice attachment with kind 'voice' and resourceType 'video'", voiceAttachment.kind === "voice" && voiceAttachment.resourceType === "video");

    // Link voice attachment to letter
    const voiceLetter = await Letter.create({
      sender: paulDoc._id,
      letterType: "self",
      isSelfLetter: true,
      recipientEmail: "paul.test@x.io",
      recipientName: "Paul",
      subject: "Voice From The Sea",
      body: "<p>Listen to the tide.</p>",
      deliveryDate: new Date(Date.now() + 1000),
      attachments: [voiceAttachment._id],
      status: "delivered",
      deliveredAt: new Date()
    });

    const voiceLetterRes = await req("GET", `/letters/${voiceLetter._id}`, { token: paul.accessToken });
    check("delivered letter populates voice attachment", voiceLetterRes.data?.letter?.attachments?.some((a) => a.kind === "voice"));

    // Photo Attachment Pipeline E2E Tests (HFJ-012)
    const photoAttachment = await Attachment.create({
      uploader: paulDoc._id,
      cloudinaryPublicId: "hfj_photo_test_456",
      url: "http://res.cloudinary.com/demo/image/upload/sunny-voyage.jpg",
      secureUrl: "https://res.cloudinary.com/demo/image/upload/sunny-voyage.jpg",
      resourceType: "image",
      kind: "photo",
      originalName: "sunny-voyage.jpg",
      fileSize: 120000,
      format: "jpg"
    });
    check("create photo attachment with kind 'photo' and resourceType 'image'", photoAttachment.kind === "photo" && photoAttachment.resourceType === "image");

    // Attachment delete endpoint requires authentication and ownership
    const delPhotoRes = await req("DELETE", `/uploads/${photoAttachment._id}`, { token: paul.accessToken });
    check("delete attachment returns 204", delPhotoRes.status === 204);

    // Song Embeds & Media Integrations E2E Tests (HFJ-013)
    const songLetter = await Letter.create({
      sender: paulDoc._id,
      letterType: "self",
      isSelfLetter: true,
      recipientEmail: "paul.test@x.io",
      recipientName: "Paul",
      subject: "Grand Line Anthem",
      body: "<p>Listen to our pirate anthem!</p>",
      deliveryDate: new Date(Date.now() + 1000),
      song: {
        provider: "spotify",
        url: "https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT",
        title: "We Are!",
        artist: "Hiroshi Kitadani"
      },
      status: "delivered",
      deliveredAt: new Date()
    });

    const songLetterRes = await req("GET", `/letters/${songLetter._id}`, { token: paul.accessToken });
    check("delivered letter preserves song embed metadata", songLetterRes.data?.letter?.song?.title === "We Are!" && songLetterRes.data?.letter?.song?.provider === "spotify");

    // Reply Threading E2E Tests (HFJ-015)
    const replyLetter = await Letter.create({
      sender: paulDoc._id,
      letterType: "self",
      isSelfLetter: true,
      recipientEmail: "paul.test@x.io",
      recipientName: "Paul",
      subject: "Re: Grand Line Anthem",
      body: "<p>Remembering that anthem from 10 years ago.</p>",
      deliveryDate: new Date(Date.now() + 1000),
      replyTo: songLetter._id,
      status: "delivered",
      deliveredAt: new Date()
    });

    const replyLetterRes = await req("GET", `/letters/${replyLetter._id}`, { token: paul.accessToken });
    check("delivered reply letter populates parent letter thread preview", replyLetterRes.data?.letter?.replyTo?.subject === "Grand Line Anthem");
  } finally {
    server.close();
    const mongoose = (await import("mongoose")).default;
    await mongoose.disconnect();
    await mem.stop();
  }

  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} checks passed.`);
  process.exit(failed.length ? 1 : 0);
}

main().catch((err) => {
  console.error("Smoke test crashed:", err);
  process.exit(1);
});
