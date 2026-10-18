import test from "node:test";
import assert from "node:assert/strict";
import {
  buildISTDeadlineISO,
  parseISTDeadlineParts,
  formatDeadlineDisplay,
  calculateDeadlineCountdown,
  parseEventEndDateTime,
  isEventOver,
  isEventLive,
  getEffectiveEventStatus,
  isUserEligibleForEvent,
} from "../src/lib/utils/index";

test("date-utils: buildISTDeadlineISO converts date, 12h time and period to valid UTC ISO", () => {
  const iso = buildISTDeadlineISO("2026-10-25", "10:30", "AM");
  assert.ok(iso !== null);
  // 10:30 AM IST (UTC+5:30) is 05:00 UTC
  assert.equal(iso, "2026-10-25T05:00:00.000Z");

  const isoPM = buildISTDeadlineISO("2026-10-25", "10:30", "PM");
  assert.ok(isoPM !== null);
  // 10:30 PM IST (UTC+5:30) is 17:00 UTC
  assert.equal(isoPM, "2026-10-25T17:00:00.000Z");

  // Invalid date should return null
  assert.equal(buildISTDeadlineISO("invalid-date", "10:30", "AM"), null);
});

test("date-utils: parseISTDeadlineParts correctly formats into IST components", () => {
  const iso = "2026-10-25T05:00:00.000Z"; // 10:30 AM IST
  const parts = parseISTDeadlineParts(iso);
  assert.ok(parts !== null);
  assert.equal(parts?.date, "2026-10-25");
  assert.equal(parts?.time, "10:30");
  assert.equal(parts?.period, "AM");

  assert.equal(parseISTDeadlineParts(null), null);
  assert.equal(parseISTDeadlineParts(undefined), null);
});

test("date-utils: calculateDeadlineCountdown returns closed when past", () => {
  const pastIso = "2020-01-01T00:00:00.000Z";
  const result = calculateDeadlineCountdown(pastIso);
  assert.equal(result.isClosed, true);
  assert.equal(result.text, "Registration Closed");
});

test("event-status: evaluates live and completed states", () => {
  // Explicit COMPLETED status
  assert.equal(isEventOver({ status: "COMPLETED", date: "2099-01-01" }), true);
  assert.equal(getEffectiveEventStatus({ status: "COMPLETED", date: "2099-01-01" }), "COMPLETED");

  // Future LIVE event
  const futureEvent = { status: "LIVE", date: "2099-01-01", time: "11:59 PM" };
  assert.equal(isEventOver(futureEvent), false);
  assert.equal(isEventLive(futureEvent), true);
  assert.equal(getEffectiveEventStatus(futureEvent), "LIVE");

  // Past event with LIVE status should be considered over and effectively COMPLETED
  const pastEvent = { status: "LIVE", date: "2020-01-01", time: "10:00 AM" };
  assert.equal(isEventOver(pastEvent), true);
  assert.equal(isEventLive(pastEvent), false);
  assert.equal(getEffectiveEventStatus(pastEvent), "COMPLETED");
});

test("eligibility: department access control", () => {
  // If allowedDepts is empty, anyone is eligible
  assert.equal(isUserEligibleForEvent("CSE", ""), true);
  assert.equal(isUserEligibleForEvent("CSE", null), true);

  // If userDept is empty and restriction is present, user is ineligible
  assert.equal(isUserEligibleForEvent("", "CSE, ISE"), false);
  assert.equal(isUserEligibleForEvent(null, "CSE, ISE"), false);

  // Matching department code
  assert.equal(isUserEligibleForEvent("CSE", "CSE, ISE, ECE"), true);
  assert.equal(isUserEligibleForEvent("MECH", "CSE, ISE, ECE"), false);
});
