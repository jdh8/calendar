import assert from "node:assert/strict";
import { festivalsForDate } from "../src/festivals.js";

function events(date, lunar = {}) {
  const [year, month, day] = date.split("-").map(Number);
  return festivalsForDate({
    date,
    year,
    month,
    day,
    weekday: new Date(`${date}T12:00:00Z`).getUTCDay(),
    ...lunar,
  });
}
const has = (date, name, lunar) =>
  events(date, lunar).some((event) => event.name === name);
assert(has("2026-05-10", "母親節"));
assert(!has("2026-05-03", "母親節"));
assert(has("2026-06-21", "父親節（美國）"));
assert(has("2026-11-26", "感恩節（美國）"));
assert(!has("1941-11-27", "感恩節（美國）"));
assert(has("2026-08-23", "祖父母節"));
assert(has("2026-03-29", "青年節"));
assert(has("2026-10-25", "臺灣光復暨金門古寧頭大捷紀念日"));
assert(!has("2024-10-25", "臺灣光復暨金門古寧頭大捷紀念日"));
for (const date of [
  "1818-03-22",
  "1943-04-25",
  "1954-04-18",
  "1962-04-22",
  "2000-04-23",
  "2024-03-31",
  "2025-04-20",
  "2026-04-05",
  "2038-04-25",
  "2100-03-28",
]) {
  assert(has(date, "復活節（西方教會）"), `Easter ${date}`);
}
assert(has("2026-06-19", "端午節", { lunarMonth: 5, lunarDay: 5 }));
assert(!has("2026-06-19", "端午節", { lunarMonth: -5, lunarDay: 5 }));
assert(
  has("2026-02-16", "除夕", {
    lunarMonth: 12,
    lunarDay: 29,
    isLunarYearEnd: true,
  }),
);
assert(
  !has("2026-02-15", "除夕", {
    lunarMonth: 12,
    lunarDay: 28,
    isLunarYearEnd: false,
  }),
);
assert(has("2026-04-05", "清明節", { solarTerm: "清明" }));
assert(!has("2026-04-04", "清明節"));
assert(!has("1901-08-01", "原住民族日"));
assert(!has("1992-03-22", "世界水日"));
assert(has("1993-03-22", "世界水日"));
assert(has("2026-12-25", "聖誕節") && has("2026-12-25", "行憲紀念日"));
for (let month = 1; month <= 12; month++) {
  for (let day = 1; day <= 28; day++) {
    const date = `2026-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    for (const event of events(date)) {
      assert(["taiwan", "world"].includes(event.category));
      assert(event.name && event.note && event.source.startsWith("https://"));
    }
  }
}
console.log("Festival checks passed.");
