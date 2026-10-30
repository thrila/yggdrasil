import { test } from "node:test";
import assert from "node:assert/strict";
import { elsewhereLinks } from "../shared/elsewhere.js";

test("search links carry the query and the tab's location", () => {
  const [li, indeed] = elsewhereLinks("nigeria", "rust engineer");
  assert.equal(new URL(li!.url).searchParams.get("keywords"), "rust engineer");
  assert.equal(new URL(li!.url).searchParams.get("location"), "Nigeria");
  assert.equal(new URL(indeed!.url).hostname, "ng.indeed.com");
  assert.equal(new URL(elsewhereLinks("worldwide", "")[0]!.url).searchParams.get("f_WT"), "2");
});

test("grants have no job-board search links", () => {
  assert.deepEqual(elsewhereLinks("grants", "zk"), []);
});

test("the Interested tab has no job-board search links", () => {
  assert.deepEqual(elsewhereLinks("interested", "rust"), []);
});
