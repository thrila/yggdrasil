import { test } from "node:test";
import assert from "node:assert/strict";
import { interestMatchers, matchInterests } from "../shared/interests.js";

const job = (title: string, tags: string[] = [], org = "Acme", location = "Remote") => ({ title, tags, org, location });

test("phrases and punctuation variants match as one interest", () => {
  const m = interestMatchers(["Product Manager", "node.js", "full stack", "c++", " ", "react"]);
  assert.deepEqual(matchInterests(job("Senior Product Manager, Payments"), m), ["product manager"]);
  assert.deepEqual(matchInterests(job("NodeJS Developer"), m), ["node.js"]);
  assert.deepEqual(matchInterests(job("Full-Stack Engineer"), m), ["full stack"]);
  assert.deepEqual(matchInterests(job("C++ Systems Engineer"), m), ["c++"]);
  assert.deepEqual(matchInterests(job("React Native Engineer"), m), ["react"]);
});

test("keywords match whole words only, and tags count too", () => {
  const m = interestMatchers(["go", "rust", "lagos"]);
  assert.deepEqual(matchInterests(job("Google Ads Specialist"), m), []);
  assert.deepEqual(matchInterests(job("Go / Rust Engineer"), m), ["go", "rust"]);
  assert.deepEqual(matchInterests(job("Engineer", ["rust"], "Acme", "Lagos, Nigeria"), m), ["rust", "lagos"]);
  assert.deepEqual(matchInterests(job("Trusty Engineer"), m), []);
});
