import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { test } from "node:test";

const source = readFileSync(new URL("../public/sw.js", import.meta.url), "utf8");

function worker({ cacheFails = false, offline = false } = {}) {
  const listeners = {};
  const writes = [];
  const response = { status: 200, type: "basic", clone: () => ({ cached: true }) };
  runInNewContext(source, {
    URL, Response,
    self: { addEventListener: (type, handler) => { listeners[type] = handler; } },
    caches: {
      match: async () => undefined,
      open: async () => ({ put: async (request) => {
        writes.push(request.url);
        if (cacheFails) throw new Error("Cache quota exceeded");
      } })
    },
    fetch: async () => {
      if (offline) throw new Error("Offline");
      return response;
    }
  });
  return { listeners, writes, response };
}

test("service worker ignores extension, mutation, and API requests", () => {
  const { listeners } = worker();
  for (const [url, method] of [
    ["chrome-extension://example/script.js", "GET"],
    ["https://example.test/form", "POST"],
    ["https://api.example.test/api/users/me", "GET"]
  ]) {
    listeners.fetch({ request: { url, method }, respondWith: () => assert.fail("Request must pass through") });
  }
});

test("cache failure does not discard a successful asset response", async () => {
  const { listeners, writes, response } = worker({ cacheFails: true });
  const pending = [];
  let result;
  listeners.fetch({
    request: { url: "https://example.test/assets/app.js", method: "GET" },
    respondWith: (promise) => { result = promise; },
    waitUntil: (promise) => pending.push(promise)
  });
  assert.equal(await result, response);
  await Promise.all(pending);
  assert.deepEqual(writes, ["https://example.test/assets/app.js"]);
});

test("offline asset failure returns a valid error Response", async () => {
  const { listeners } = worker({ offline: true });
  let result;
  listeners.fetch({
    request: { url: "https://example.test/assets/app.js", method: "GET" },
    respondWith: (promise) => { result = promise; }
  });
  assert.equal((await result).type, "error");
});
