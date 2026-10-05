// Notification and schedule rules. Pure functions, so they run without a display server.
import { test } from "node:test";
import assert from "node:assert/strict";
import { canNotify, inQuietHours, newSince, notificationBody } from "../electron/notify.cjs";
import { clampRefreshMinutes, refreshIntervalMs } from "../shared/types.js";
import type { Job } from "../shared/types.js";

const base = { enabled: true, quietFrom: 22, quietTo: 8, minNew: 1, windowFocused: false, unsupported: false };

const job = (over: Partial<Job> = {}): Job => ({
  id: "a", title: "Rust Engineer", org: "Acme", location: "Remote Worldwide", url: "https://jobs.example/1",
  source: "ATS", posted: "", kind: "job", tags: ["remote"], first_seen: 1000, last_seen: 1000, active: true, ...over,
});

test("notifications are opt-in and never fire while the window has focus", () => {
  const at = new Date("2026-10-05T12:00:00");
  assert.equal(canNotify(base, at), true);
  assert.equal(canNotify({ ...base, enabled: false }, at), false, "off unless explicitly enabled");
  assert.equal(canNotify({ ...base, unsupported: true }, at), false, "respect an unavailable notification server");
  assert.equal(canNotify({ ...base, windowFocused: true }, at), false, "the user is already looking at the list");
});

test("quiet hours wrap past midnight", () => {
  const at = (h: number) => new Date(`2026-10-05T${String(h).padStart(2, "0")}:30:00`);
  assert.equal(inQuietHours(at(23), 22, 8), true);
  assert.equal(inQuietHours(at(3), 22, 8), true, "after midnight");
  assert.equal(inQuietHours(at(7), 22, 8), true, "until the end hour");
  assert.equal(inQuietHours(at(8), 22, 8), false);
  assert.equal(inQuietHours(at(12), 22, 8), false);
  // A non-wrapping window, e.g. a daytime meeting.
  assert.equal(inQuietHours(at(10), 9, 17), true);
  assert.equal(inQuietHours(at(20), 9, 17), false);
});

test("only listings discovered during the last run are news", () => {
  const older = job({ id: "old", first_seen: 1000 });
  const fresh = job({ id: "fresh", first_seen: 2000 });
  assert.deepEqual(newSince([older, fresh], 1500).map((j) => j.id), ["fresh"]);
  assert.equal(newSince([older, fresh], 3000).length, 0);
  // Closed listings are not worth interrupting anyone for.
  assert.equal(newSince([job({ first_seen: 2000, active: false })], 1500).length, 0);
  // Nor is a role that requires being somewhere the Worldwide tab does not cover.
  assert.equal(newSince([job({ first_seen: 2000, location: "Lagos, Nigeria", tags: ["nigeria"] })], 1500).length, 0);
  assert.equal(newSince([job({ first_seen: 2000, tags: ["remote"] })], 1500).length, 1, "remote still counts");
  // Grants have no location constraint, so they notify wherever they are listed.
  const grant = job({ id: "g", kind: "grant", tags: ["grant", "africa-ok"], first_seen: 2000 });
  assert.deepEqual(newSince([grant], 1500).map((j) => j.id), ["g"]);
  // The list is capped so one busy source cannot produce an unreadable alert.
  const many = Array.from({ length: 9 }, (_, i) => job({ id: `n${i}`, first_seen: 2000 + i }));
  assert.equal(newSince(many, 1500).length, 5);
});

test("the summary is one notification, not one per listing", () => {
  assert.deepEqual(notificationBody([job({ title: "Rust Engineer" })]),
    { title: "1 new listing", body: "Rust Engineer · Acme" });
  const many = notificationBody([job({ id: "1" }), job({ id: "2" }), job({ id: "3" }), job({ id: "4" })]);
  assert.equal(many.title, "4 new listings");
  assert.match(many.body, /\+1 more/, "summarises the tail rather than listing every one");
});

test("the search interval is clamped to a polite range and migrates from hours", () => {
  assert.equal(clampRefreshMinutes(1), 15, "floored so sources are not hammered");
  assert.equal(clampRefreshMinutes(99999), 1440);
  assert.equal(clampRefreshMinutes(180), 180);
  assert.equal(clampRefreshMinutes("nonsense"), 180);
  assert.equal(refreshIntervalMs({ refreshMinutes: 30 }), 30 * 60e3);
  // A settings file written before minute-based intervals carries refreshHours only.
  assert.equal(refreshIntervalMs({ refreshHours: 6 }), 360 * 60e3);
});
