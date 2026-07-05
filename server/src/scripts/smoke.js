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

    // Pair them
    const invite = await req("POST", "/users/me/pair/invite", { token: paul.accessToken });
    const accept = await req("POST", "/users/me/pair/accept", {
      token: jasmine.accessToken,
      body: { code: invite.data.code }
    });
    check("partner pairing links the couple", accept.status === 200 && accept.data.partner);

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
