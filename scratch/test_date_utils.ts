import { buildISTDeadlineISO, parseISTDeadlineParts, formatDeadlineDisplay } from '../src/utils/date-utils';

console.log("=== TEST 1: 15-10-2026 09:30 AM ===");
const iso1 = buildISTDeadlineISO('2026-10-15', '09:30', 'AM');
console.log("ISO 1:", iso1);
console.log("Formatted:", formatDeadlineDisplay(iso1));
console.log("Parsed back:", parseISTDeadlineParts(iso1));

console.log("\n=== TEST 2: 15-10-2026 09:30 PM ===");
const iso2 = buildISTDeadlineISO('2026-10-15', '09:30', 'PM');
console.log("ISO 2:", iso2);
console.log("Formatted:", formatDeadlineDisplay(iso2));
console.log("Parsed back:", parseISTDeadlineParts(iso2));

console.log("\n=== TEST 3: 15-10-2026 12:00 AM (Midnight) ===");
const iso3 = buildISTDeadlineISO('2026-10-15', '12:00', 'AM');
console.log("ISO 3:", iso3);
console.log("Formatted:", formatDeadlineDisplay(iso3));
console.log("Parsed back:", parseISTDeadlineParts(iso3));

console.log("\n=== TEST 4: 15-10-2026 12:00 PM (Noon) ===");
const iso4 = buildISTDeadlineISO('2026-10-15', '12:00', 'PM');
console.log("ISO 4:", iso4);
console.log("Formatted:", formatDeadlineDisplay(iso4));
console.log("Parsed back:", parseISTDeadlineParts(iso4));
