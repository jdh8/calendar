import assert from "node:assert/strict";
import {
  parseDate,
  todayInTaiwan,
  shiftDate,
  shiftMonth,
  solarTerms,
  dayInfo,
  fromLunar,
  lunarMonths,
  monthDays,
  TERM_NAMES,
} from "../src/calendar.js";

// HKO Gregorian–lunar tables: https://www.hko.gov.hk/en/gts/time/conversion.htm
for (const [date, year, month, day] of [
  ["1901-01-01", 1900, 11, 11],
  ["2024-02-10", 2024, 1, 1],
  ["2025-01-28", 2024, 12, 29],
  ["2025-01-29", 2025, 1, 1],
  ["2025-07-25", 2025, -6, 1],
  ["2025-08-22", 2025, -6, 29],
  ["2026-02-16", 2025, 12, 29],
  ["2026-02-17", 2026, 1, 1],
  ["2026-06-19", 2026, 5, 5],
  ["2026-09-25", 2026, 8, 15],
  ["2033-12-22", 2033, -11, 1],
  ["2100-12-31", 2100, 12, 1],
]) {
  const result = dayInfo(date);
  assert.deepEqual(
    [result.lunarYear, result.lunarMonth, result.lunarDay],
    [year, month, day],
    date,
  );
  assert.equal(fromLunar(year, month, day), date);
}
assert.equal(lunarMonths(2025).find((month) => month.value === -6).days, 29);
assert.throws(() => fromLunar(2025, -6, 30));
assert.throws(() => fromLunar(2026, -6, 1));
assert.throws(() => fromLunar(1900, 1, 1));
assert.equal(monthDays(2024, 2).length, 29);
assert.equal(monthDays(2100, 2).length, 28);
for (const invalid of [
  "2026-02-29",
  "2100-02-29",
  "2026-13-01",
  "2026-01-32",
  "1900-12-31",
  "2101-01-01",
  "2026-2-1",
  "<script>",
])
  assert.throws(() => parseDate(invalid));
assert.equal(shiftMonth("2024-01-31", 1), "2024-02-29");
assert.equal(shiftMonth("2026-12-31", 1), "2027-01-31");
assert.equal(shiftDate("2024-02-28", 2), "2024-03-01");
assert.throws(() => shiftDate("1901-01-01", -1));
assert.throws(() => shiftMonth("2100-12-31", 1));
assert.equal(todayInTaiwan(new Date("2026-09-20T16:00:00Z")), "2026-09-21");
assert.equal(todayInTaiwan(new Date("2026-09-20T15:59:59Z")), "2026-09-20");

// Taipei Astronomical Museum 2021–2030 almanac, pages 7 and 11; independent published minute values.
for (const [year, name, date, time] of [
  [2024, "春分", "2024-03-20", "11:06"],
  [2026, "小寒", "2026-01-05", "16:23"],
  [2026, "雨水", "2026-02-18", "23:52"],
  [2026, "清明", "2026-04-05", "02:40"],
  [2026, "夏至", "2026-06-21", "16:25"],
  [2026, "秋分", "2026-09-23", "08:05"],
  [2026, "冬至", "2026-12-22", "04:50"],
]) {
  const term = solarTerms(year).find((entry) => entry.name === name);
  assert.equal(term.date, date);
  assert.equal(term.time, time);
  assert.equal(term.official, true);
}
for (let year = 1901; year <= 2100; year++) {
  const terms = solarTerms(year);
  assert.deepEqual(
    terms.map((term) => term.name),
    TERM_NAMES,
    `24 ordered terms, ${year}`,
  );
  for (const term of terms) {
    assert.equal(parseDate(term.date).year, year);
    assert.match(term.time, /^(?:[01]\d|2[0-3]):[0-5]\d$/);
    assert.equal(term.official, year >= 2021 && year <= 2030);
  }
}
assert.throws(() => solarTerms(2101));
const has = (date, name) =>
  dayInfo(date).festivals.some((event) => event.name === name);
assert(has("2025-01-28", "除夕"));
assert(has("2026-02-16", "除夕"));
assert(!has("2026-02-15", "除夕"));
assert(has("2026-09-25", "中秋節"));
assert(has("2026-04-05", "清明節"));
assert(has("2026-05-10", "母親節"));
assert(has("2026-11-26", "感恩節（美國）"));
console.log(
  "Calendar checks passed: 1901–2100 terms, published times, lunar conversion, leap months, date boundaries, Taiwan timezone, festivals.",
);
