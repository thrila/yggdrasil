import { test } from "node:test";
import assert from "node:assert/strict";
import { devpostItems, workingNomadsItems } from "../electron/collect.cjs";

test("Working Nomads listings are remote and keep their applicant regions", () => {
  const [j] = workingNomadsItems([{ url: "https://www.workingnomads.com/job/go/1/", title: "Rust Developer", company_name: "Acme",
    location: "Europe, the U.S.", tags: "rust,backend", description: "<p>Build things</p>", pub_date: "2026-10-29T09:50:51-04:00" }]);
  assert.equal(j!.location, "Europe, the U.S. Remote");
  assert.equal(j!.posted, "2026-10-29T13:50:51.000Z");
  assert.match(j!.text, /Build things rust,backend/);
  assert.throws(() => workingNomadsItems("Redirecting..."), /Working Nomads/);
});

test("Devpost hackathons close a day after their stated end date", () => {
  const [h, open] = devpostItems({ hackathons: [
    { title: "AI Hack", url: "https://ai.devpost.com/", organization_name: "nebius", submission_period_dates: "Aug 26 - Oct 30, 2026",
      displayed_location: { location: "Online" }, themes: [{ name: "Machine Learning/AI" }], prize_amount: "$<span>50,000</span>" },
    { title: "Spanning", url: "https://y.devpost.com/", submission_period_dates: "Dec 20, 2026 - Jan 05, 2027", displayed_location: { location: "Lagos" } },
  ] });
  assert.equal(h!.location, "Online, worldwide");
  assert.equal(h!.deadlineLabel, "Aug 26 - Oct 30, 2026");
  assert.ok(Date.parse(h!.deadline!) > Date.parse("2026-10-31T00:00:00Z"));
  assert.match(h!.text, /Machine Learning\/AI.*50,000/);
  assert.equal(new Date(open!.deadline!).getUTCFullYear(), 2027);
});
