import { test } from "node:test";
import assert from "node:assert/strict";
import { jobbermanItems, relativeDate } from "../electron/collect.cjs";

// Trimmed from a real card: attributes wrap across lines, which the parser must allow.
const card = (slug: string, title: string, when: string, place = "Lagos", pay = "Confidential") => `
  <div class="flex flex-wrap col-span-1 mb-5"
    data-cy="listing-cards-components"
    aria-labelledby="job-1-title">
    <a
      href="https://www.jobberman.com/listings/${slug}"
      class="block break-words"
      data-cy="listing-title-link"
      title="${title}"><p class="text-lg font-medium">${title}</p></a>
    </div>
    <p
      class="text-sm text-blue-700 text-loading-animate inline-block mt-3"> Woye Group </p>
    <div class="flex flex-wrap mt-3 text-sm text-gray-500 md:py-0">
      <span class="mb-3 px-3 py-1 rounded bg-brand-secondary-100 mr-2"> ${place} </span>
      <span class="mb-3 px-3 py-1 rounded bg-brand-secondary-100 mr-2">Full Time</span>
      <span class="mb-3 px-3 py-1 rounded bg-brand-secondary-100 mr-2">${pay}</span>
    </div>
    <p class="text-sm text-gray-500 text-loading-animate inline-block"> Software &amp; Data </p>
    <p class="text-sm font-normal text-gray-700 text-loading-animate">${when}</p>
    <p class="text-sm font-normal text-gray-700 md:text-gray-500 md:pl-5">Build Woye Group&#039;s platform</p>
  </div>`;

const now = Date.parse("2026-10-30T12:00:00Z");

test("Jobberman cards become Nigerian listings with category, pay and summary", () => {
  const [a, b] = jobbermanItems(`<html>Jobberman${card("dev-1", "Backend Developer", "Yesterday")}${card("dev-2", "Data Analyst", "3 days ago", "Abuja", "NGN 300,000")}</html>`, now);
  assert.equal(a!.url, "https://www.jobberman.com/listings/dev-1");
  assert.equal(a!.org, "Woye Group");
  assert.equal(a!.location, "Lagos, Nigeria");
  assert.equal(a!.posted, "2026-10-29T12:00:00.000Z");
  assert.equal(a!.text, "Software & Data. Full Time. Build Woye Group's platform");
  assert.match(b!.text, /NGN 300,000/);
  assert.equal(b!.posted, "2026-10-27T12:00:00.000Z");
});

test("a page that is not a Jobberman listing page is an error, an empty one is not", () => {
  assert.throws(() => jobbermanItems("<html>Access denied</html>"), /Jobberman/);
  assert.deepEqual(jobbermanItems("<html>Jobberman: no jobs match</html>"), []);
});

test("relative dates parse and unknown labels stay undated", () => {
  assert.equal(relativeDate("Today", now), "2026-10-30T12:00:00.000Z");
  assert.equal(relativeDate("2 weeks ago", now), "2026-10-16T12:00:00.000Z");
  assert.equal(relativeDate("Featured", now), "");
});
