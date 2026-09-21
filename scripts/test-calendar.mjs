import assert from "node:assert/strict";
import {
  MIN_YEAR,
  MAX_YEAR,
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

// Qing years follow lunar New Year; the Republic begins on 1912-01-01.
for (const [date, era] of [
  ["1801-01-01", "清 嘉慶 5 年"],
  ["1801-02-13", "清 嘉慶 6 年"],
  ["1821-02-02", "清 嘉慶 25 年"],
  ["1821-02-03", "清 道光元年"],
  ["1851-01-31", "清 道光 30 年"],
  ["1851-02-01", "清 咸豐元年"],
  ["1862-01-29", "清 咸豐 11 年"],
  ["1862-01-30", "清 同治元年"],
  ["1875-02-05", "清 同治 13 年"],
  ["1875-02-06", "清 光緒元年"],
  ["1909-01-21", "清 光緒 34 年"],
  ["1909-01-22", "清 宣統元年"],
  ["1911-12-31", "清 宣統 3 年"],
  ["1912-01-01", "民國 1 年"],
  ["1945-10-24", "民國 34 年"],
  ["1945-10-25", "民國 34 年"],
  ["2026-09-21", "民國 115 年"],
  ["2100-12-31", "民國 189 年"],
]) assert.equal(dayInfo(date).era, era, date);

// Modern Japanese era boundaries, including both sides of each change.
for (const [date, era] of [
  ["1801-01-01", "寛政 13 年"],
  ["1851-07-01", "嘉永 4 年"],
  ["1873-01-01", "明治 6 年"],
  ["1912-07-29", "明治 45 年"],
  ["1912-07-30", "大正元年"],
  ["1926-12-24", "大正 15 年"],
  ["1926-12-25", "昭和元年"],
  ["1945-10-25", "昭和 20 年"],
  ["1989-01-07", "昭和 64 年"],
  ["1989-01-08", "平成元年"],
  ["2019-04-30", "平成 31 年"],
  ["2019-05-01", "令和元年"],
  ["2026-09-21", "令和 8 年"],
  ["2100-12-31", "令和 82 年"],
]) assert.equal(dayInfo(date).japaneseEra, era, date);
assert.deepEqual(
  [...new Set(monthDays(1912, 7).map((day) => day.japaneseEra))],
  ["明治 45 年", "大正元年"],
);

// Independent ICU Chinese-calendar spot checks; these are not a historical almanac audit.
const chineseCalendar = new Intl.DateTimeFormat("en-u-ca-chinese", {
  timeZone: "UTC",
  year: "numeric",
  month: "numeric",
  day: "numeric",
});
for (const [date, year, month, day] of [
  ["1801-01-01", 1800, 11, 17],
  ["1801-02-13", 1801, 1, 1],
  ["1851-01-01", 1850, 11, 29],
  ["1851-02-01", 1851, 1, 1],
]) {
  const result = dayInfo(date);
  assert.deepEqual(
    [result.lunarYear, result.lunarMonth, result.lunarDay],
    [year, month, day],
    date,
  );
  const parts = chineseCalendar.formatToParts(new Date(`${date}T12:00:00Z`));
  const get = (type) => Number(parts.find((part) => part.type === type).value);
  assert.deepEqual(
    [get("relatedYear"), get("month"), get("day")],
    [year, month, day],
  );
  assert.equal(fromLunar(year, month, day), date);
}

// Exercise every newly supported lunar month's first/last day, including leap months.
for (let year = 1801; year <= 1900; year++) {
  for (const month of lunarMonths(year)) {
    for (const day of [1, month.days]) {
      const date = fromLunar(year, month.value, day);
      const result = dayInfo(date);
      assert.deepEqual(
        [result.lunarYear, result.lunarMonth, result.lunarDay],
        [year, month.value, day],
        date,
      );
    }
  }
}
assert.equal(fromLunar(1851, -8, 1), "1851-09-25");
assert.equal(dayInfo("1851-10-23").lunarMonth, -8);
assert.equal(dayInfo("1851-10-24").lunarMonth, 9);

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
assert.throws(() => fromLunar(1800, 1, 1));
assert.throws(() => lunarMonths(1799));
assert.equal(monthDays(1804, 2).length, 29);
assert.equal(monthDays(1900, 2).length, 28);
assert.equal(monthDays(2024, 2).length, 29);
assert.equal(monthDays(2100, 2).length, 28);
for (const invalid of [
  "2026-02-29",
  "2100-02-29",
  "2026-13-01",
  "2026-01-32",
  "1800-12-31",
  "1900-02-29",
  "2101-01-01",
  "2026-2-1",
  "<script>",
])
  assert.throws(() => parseDate(invalid));
assert.equal(shiftMonth("2024-01-31", 1), "2024-02-29");
assert.equal(shiftMonth("2026-12-31", 1), "2027-01-31");
assert.equal(shiftDate("2024-02-28", 2), "2024-03-01");
assert.equal(shiftDate("1901-01-01", -1), "1900-12-31");
assert.equal(shiftMonth("1801-02-28", -1), "1801-01-28");
assert.throws(() => shiftDate("1801-01-01", -1));
assert.throws(() => shiftMonth("1801-01-01", -1));
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
for (let year = MIN_YEAR; year <= MAX_YEAR; year++) {
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
assert.throws(() => solarTerms(1800));
const has = (date, name) =>
  dayInfo(date).festivals.some((event) => event.name === name);
assert(has("2025-01-28", "除夕"));
assert(has("2026-02-16", "除夕"));
assert(!has("2026-02-15", "除夕"));
assert(has("2026-09-25", "中秋節"));
assert(has("2026-04-05", "清明節"));
assert(has("2026-05-10", "母親節"));
assert(has("2026-11-26", "感恩節（美國）"));
assert(has("1801-02-12", "除夕"));
assert(has("1801-02-13", "春節"));
assert(has("1851-09-10", "中秋節"));
assert(!has("1851-10-09", "中秋節"));
assert(!has("1801-10-10", "國慶日"));
console.log(
  `Calendar checks passed: ${MIN_YEAR}–${MAX_YEAR} terms, published times, lunar conversion, leap months, date boundaries, Taiwan timezone, festivals.`,
);
