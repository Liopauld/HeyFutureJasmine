import assert from "node:assert/strict";
import { test } from "node:test";
import { once } from "node:events";
import { MongoMemoryServer } from "mongodb-memory-server";

test("production deployment configuration", async (t) => {
  const mem = await MongoMemoryServer.create();
  const emails = [];
  let emailFailure = false;
  const originalFetch = globalThis.fetch;
  let server;
  let mongoose;

  process.env.MONGODB_URI = mem.getUri();
  process.env.NODE_ENV = "production";
  process.env.ENABLE_DEV_ROUTES = "true"; // Production must override this.
  process.env.TRUST_PROXY = "1";
  process.env.JWT_ACCESS_SECRET = "deployment_test_access_secret";
  process.env.JWT_REFRESH_SECRET = "deployment_test_refresh_secret";
  process.env.CLIENT_URLS = " https://frontend.example.test/ , https://other.example.test";
  process.env.RESEND_API_KEY = "re_deployment_test_mock_key";
  process.env.EMAIL_PROVIDER = "resend";
  // This test does not exercise the sweep (covered by smoke.js).
  process.env.SWEEP_MIN_INTERVAL_MS = "10000000000000000";
  delete process.env.CLIENT_URL;
  delete process.env.REDIS_HOST;
  delete process.env.CLOUDINARY_CLOUD_NAME;
  delete process.env.CLOUDINARY_API_KEY;
  delete process.env.CLOUDINARY_API_SECRET;

  globalThis.fetch = async (input, options) => {
    if (String(input) === "https://api.brevo.com/v3/smtp/email") {
      emails.push(JSON.parse(options.body));
      return new Response(JSON.stringify(emailFailure
        ? { code: "unauthorized", message: "Invalid API key" }
        : { messageId: "mock-brevo-email" }), {
        status: emailFailure ? 401 : 201, headers: { "Content-Type": "application/json" }
      });
    }
    if (String(input).startsWith("https://api.resend.com/")) {
      emails.push(JSON.parse(options.body));
      if (emailFailure) return new Response(JSON.stringify({
        name: "validation_error", message: "The sender domain is not verified"
      }), { status: 403, headers: { "Content-Type": "application/json" } });
      return new Response(JSON.stringify({ id: "mock-email" }), {
        status: 200, headers: { "Content-Type": "application/json" }
      });
    }
    return originalFetch(input, options);
  };

  try {
    const { default: app } = await import("../app.js");
    const { connectDb } = await import("../config/db.js");
    mongoose = (await import("mongoose")).default;
    await connectDb();
    // Test-only route exposes the IP Express passes to the actual rate limiters.
    app.get("/__deployment/ip", (req, res) => res.json({ ip: req.ip }));
    server = app.listen(0, "127.0.0.1");
    await once(server, "listening");
    const base = `http://127.0.0.1:${server.address().port}`;
    const post = (path, body, headers = {}) => fetch(`${base}/api${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify(body)
    });
    let accessToken;

    await t.test("registration uses the deployed email origin and secure cookie", async () => {
      const res = await post("/auth/register", {
        username: "DeploymentTest", email: "deployment@example.test", password: "testgrandline"
      });
      assert.equal(res.status, 201);
      accessToken = (await res.json()).accessToken;
      assert.ok(accessToken);
      assert.match(res.headers.get("set-cookie"), /HttpOnly/);
      assert.match(res.headers.get("set-cookie"), /Secure/);
      assert.match(res.headers.get("set-cookie"), /SameSite=None/);
      assert.match(emails[0].html, /https:\/\/frontend\.example\.test\/verify-email\//);
      assert.doesNotMatch(emails[0].html, /localhost/);
      assert.match(emails[0].html, />https:\/\/frontend\.example\.test\/verify-email\/[^<]+<\/div>/);
      assert.match(emails[0].text, /https:\/\/frontend\.example\.test\/verify-email\//);
    });

    await t.test("canonical CLIENT_URL overrides the CORS origin list for email links", async () => {
      const { sendPasswordResetEmail, sendLetterEmail } = await import("../services/emailService.js");
      process.env.CLIENT_URL = "https://canonical.example.test/";
      await sendPasswordResetEmail("deployment@example.test", "reset-token");
      assert.match(emails.at(-1).html, /https:\/\/canonical\.example\.test\/reset-password\/reset-token/);
      await sendLetterEmail({ letterType: "other", recipientEmail: "guest@example.test", unlockToken: "guest-token" });
      assert.match(emails.at(-1).html, /https:\/\/canonical\.example\.test\/unlock\/guest-token/);
      delete process.env.CLIENT_URL;
    });

    await t.test("saved profile survives logout, login, and token refresh", async () => {
      const headers = { Authorization: `Bearer ${accessToken}` };
      const changed = await fetch(`${base}/api/users/me`, {
        method: "PATCH", headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ displayName: "Saved Captain", anniversary: "2024-01-12" })
      });
      assert.equal(changed.status, 200);
      const { User } = await import("../models/User.js");
      const stored = await User.findOne({ email: "deployment@example.test" });
      assert.equal(stored.displayName, "Saved Captain");
      const loginRes = await post("/auth/login", {
        email: stored.email, password: "testgrandline"
      });
      const cookie = loginRes.headers.get("set-cookie").split(";")[0];
      await post("/auth/logout", {}, { Cookie: cookie });
      const relogin = await post("/auth/login", {
        email: stored.email, password: "testgrandline"
      });
      const session = await relogin.json();
      assert.equal(session.user.displayName, "Saved Captain");
      assert.equal(session.user.anniversary, "2024-01-12T00:00:00.000Z");
      assert.ok(!("passwordHash" in session.user));
      const refreshed = await post("/auth/refresh", {}, {
        Cookie: relogin.headers.get("set-cookie").split(";")[0]
      });
      assert.equal((await refreshed.json()).user.displayName, "Saved Captain");
    });

    await t.test("Resend rejection is reported instead of claiming password reset was sent", async () => {
      emailFailure = true;
      try {
        const res = await post("/auth/forgot-password", { email: "deployment@example.test" });
        assert.equal(res.status, 503);
        assert.match((await res.json()).message, /email/i);
      } finally { emailFailure = false; }
    });

    await t.test("verification failure leaves an account that can retry and verify", async () => {
      emailFailure = true;
      let account;
      try {
        const res = await post("/auth/register", {
          username: "EmailRetry", email: "retry@example.test", password: "testgrandline"
        });
        assert.equal(res.status, 201);
        account = await res.json();
        assert.equal(account.verificationEmailSent, false);
        const rejected = await post("/auth/resend-verification", {}, {
          Authorization: `Bearer ${account.accessToken}`
        });
        assert.equal(rejected.status, 503);
      } finally { emailFailure = false; }
      const { User } = await import("../models/User.js");
      const before = await User.findOne({ email: "retry@example.test" });
      const retry = await post("/auth/resend-verification", {}, {
        Authorization: `Bearer ${account.accessToken}`
      });
      assert.equal(retry.status, 200);
      assert.ok(emails.at(-1).html.includes(before.emailVerificationToken));
      const verified = await fetch(`${base}/api/auth/verify-email/${before.emailVerificationToken}`);
      assert.equal(verified.status, 200);
      assert.equal((await User.findById(before._id)).emailVerified, true);
      assert.equal((await post("/auth/resend-verification", {})).status, 401);
    });

    await t.test("Brevo sends verification through HTTP and surfaces rejection", async () => {
      process.env.EMAIL_PROVIDER = "brevo";
      process.env.BREVO_API_KEY = "mock-brevo-key";
      process.env.BREVO_SENDER_EMAIL = "sender@gmail.com";
      try {
        const res = await post("/auth/resend-verification", {}, {
          Authorization: `Bearer ${accessToken}`
        });
        assert.equal(res.status, 200);
        assert.equal(emails.at(-1).sender.email, "sender@gmail.com");
        assert.deepEqual(emails.at(-1).to, [{ email: "deployment@example.test" }]);
        assert.match(emails.at(-1).htmlContent, /https:\/\/frontend\.example\.test\/verify-email\//);
        const { User } = await import("../models/User.js");
        const user = await User.findOne({ email: "deployment@example.test" });
        const directUrl = `https://frontend.example.test/verify-email/${user.emailVerificationToken}`;
        assert.ok(emails.at(-1).htmlContent.includes(`>${directUrl}</div>`));
        assert.ok(emails.at(-1).textContent.includes(directUrl));
        const verified = await fetch(`${base}/api/auth/verify-email/${user.emailVerificationToken}`);
        assert.equal(verified.status, 200);
        assert.equal((await User.findById(user._id)).emailVerified, true);
        emailFailure = true;
        assert.equal((await post("/auth/forgot-password", {
          email: "deployment@example.test"
        })).status, 503);
        emailFailure = false;
        delete process.env.BREVO_API_KEY;
        assert.equal((await post("/auth/forgot-password", {
          email: "deployment@example.test"
        })).status, 503);
      } finally {
        emailFailure = false;
        process.env.EMAIL_PROVIDER = "resend";
        delete process.env.BREVO_API_KEY;
        delete process.env.BREVO_SENDER_EMAIL;
      }
    });

    await t.test("email failure does not report an already saved letter as a failed save", async () => {
      const { User } = await import("../models/User.js");
      await User.updateOne({ email: "deployment@example.test" }, { $set: { emailVerified: true } });
      emailFailure = true;
      try {
        const res = await post("/letters", {
          letterType: "self", body: "<p>Saved despite an email outage</p>",
          deliveryDate: new Date(Date.now() + 3 * 86400000).toISOString()
        }, { Authorization: `Bearer ${accessToken}` });
        assert.equal(res.status, 201);
        const { letter } = await res.json();
        const { Letter } = await import("../models/Letter.js");
        assert.equal((await Letter.findById(letter._id || letter.id)).status, "sealed");
      } finally { emailFailure = false; }
    });

    await t.test("production hides dev endpoints even when ENABLE_DEV_ROUTES=true", async () => {
      assert.equal((await post("/dev/sweep", {})).status, 404);
    });

    await t.test("only configured browser origins receive CORS credentials", async () => {
      const allowed = await fetch(`${base}/api/health`, { headers: { Origin: "https://other.example.test" } });
      assert.equal(allowed.status, 200);
      assert.equal(allowed.headers.get("access-control-allow-origin"), "https://other.example.test");
      assert.equal(allowed.headers.get("access-control-allow-credentials"), "true");
      const denied = await fetch(`${base}/api/health`, { headers: { Origin: "https://untrusted.example.test" } });
      assert.equal(denied.headers.get("access-control-allow-origin"), null);
    });

    await t.test("one proxy hop uses the nearest forwarded IP, ignoring spoofed prefixes", async () => {
      const res = await fetch(`${base}/__deployment/ip`, {
        headers: { "X-Forwarded-For": "203.0.113.99, 198.51.100.10" }
      });
      assert.equal((await res.json()).ip, "198.51.100.10");
    });

    await t.test("production login limits are isolated per forwarded client IP", async () => {
      for (let i = 0; i < 30; i++) {
        const res = await post("/auth/login", { email: "missing@example.test", password: "wrong" }, {
          "X-Forwarded-For": "198.51.100.20"
        });
        assert.equal(res.status, 401);
      }
      assert.equal((await post("/auth/login", { email: "missing@example.test", password: "wrong" }, {
        "X-Forwarded-For": "198.51.100.20"
      })).status, 429);
      assert.equal((await post("/auth/login", { email: "missing@example.test", password: "wrong" }, {
        "X-Forwarded-For": "198.51.100.21"
      })).status, 401);
    });

    const upload = (path, size, count = 1) => {
      const form = new FormData();
      for (let i = 0; i < count; i++) {
        form.append("file", new Blob([new Uint8Array(size)], { type: "image/png" }), `photo-${i}.png`);
      }
      return fetch(`${base}/api${path}`, {
        method: "POST", headers: { Authorization: `Bearer ${accessToken}` }, body: form
      });
    };

    await t.test("oversized attachments and avatars return a readable 413", async () => {
      for (const path of ["/uploads", "/users/me/avatar"]) {
        const res = await upload(path, 8 * 1024 * 1024 + 1);
        assert.equal(res.status, 413);
        assert.deepEqual(await res.json(), { message: "Files must be 8 MB or smaller." });
      }
    });

    await t.test("an attachment at the 8 MB boundary reaches the upload controller", async () => {
      const res = await upload("/uploads", 8 * 1024 * 1024);
      assert.equal(res.status, 503); // Cloudinary is deliberately absent here.
      assert.match((await res.json()).message, /Cloudinary/);
    });

    await t.test("multiple attachment files are rejected with 400", async () => {
      const res = await upload("/uploads", 10, 2);
      assert.equal(res.status, 400);
      assert.match((await res.json()).message, /one file/);
    });
  } finally {
    globalThis.fetch = originalFetch;
    if (server) await new Promise((resolve) => server.close(resolve));
    if (mongoose) await mongoose.disconnect();
    await mem.stop();
  }
});
