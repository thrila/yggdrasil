import { test } from "node:test";
import assert from "node:assert/strict";
import { browserNotifyState, createBrowserApi } from "../src/browser-api.js";
import type { PreviewStorage } from "../src/browser-api.js";

const storage = () => {
  const values = new Map<string, string>();
  const shim: PreviewStorage & { values: Map<string, string> } = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => { values.set(key, value); },
    values,
  };
  return shim;
};

test("preview separates jobs from funding and labels every synthetic item", async () => {
  const api = createBrowserApi(storage());
  const worldwide = await api.jobs("worldwide");
  const nigeria = await api.jobs("nigeria");
  const funding = await api.jobs("grants");
  assert.ok(worldwide.length > 0 && nigeria.length > 0 && funding.length > 0);
  assert.ok([...worldwide, ...nigeria].every((item) => item.kind === "job"));
  assert.deepEqual(new Set(funding.map((item) => item.kind)), new Set(["grant", "hackathon"]));
  // No URL: a sample row must never be clickable as if it were a real posting.
  assert.ok([...worldwide, ...nigeria, ...funding].every((item) => item.sample && !item.url));
});

test("interest preferences persist and update scores without storing secrets", async () => {
  const saved = storage();
  const api = createBrowserApi(saved);
  let updates = 0;
  const off = api.onUpdated(() => updates++);
  await api.setSettings({ interests: [" PYTHON ", "python"], xQueries: ["private query"] });
  assert.equal(updates, 1);
  off();
  const restored = createBrowserApi(saved);
  assert.deepEqual((await restored.getSettings()).interests, ["python"]);
  assert.equal((await restored.jobs("worldwide"))[0]!.score, 0);
  assert.equal((await restored.jobs("nigeria")).find((item) => item.tags.includes("python"))!.score, 1);
  await assert.rejects(api.setSettings({ interests: ["rust"], xaiKey: "secret" }), /API keys/);
  assert.deepEqual([...saved.values.values()], ['["python"]']);
  await api.setSettings({ interests: [] });
  assert.equal(updates, 1);
});

test("preview reports notification support without claiming the desktop app is required", async () => {
  const state = browserNotifyState();
  assert.equal(typeof state.supported, "boolean");
  assert.ok(state.reason.length > 0, "always explains itself");
  // node has no Notification global, so the unsupported branch is what a bare runtime gets.
  if (typeof Notification === "undefined") assert.equal(state.supported, false);
  // The preview must never claim to be able to raise a live alert on its own.
  const api = createBrowserApi();
  await assert.rejects(api.testNotification(), /.+/);
});

test("desktop operations fail explicitly and malformed storage preserves defaults", async () => {
  const api = createBrowserApi({ getItem: () => "{broken", setItem() { /* storage that only throws */ } });
  assert.ok((await api.getSettings()).interests.includes("rust"));
  await assert.rejects(api.addSource("https://example.com/feed"), /desktop app/);
  await assert.rejects(api.refresh(), /desktop app/);
  assert.ok((await createBrowserApi().jobs("worldwide")).length > 0);
  // Notifications are opt-in and off by default, in the preview as in the app.
  const settings = await createBrowserApi().getSettings();
  assert.equal(settings.notifications, false);
  assert.equal(typeof settings.refreshMinutes, "number");
});