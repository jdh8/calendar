import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import {
  MIN_YEAR, MAX_YEAR, OFFICIAL_SOURCE, TERM_NAMES, parseDate,
} from "../src/calendar.js";

const japaneseNames = "小寒 大寒 立春 雨水 啓蟄 春分 清明 穀雨 立夏 小満 芒種 夏至 小暑 大暑 立秋 処暑 白露 秋分 寒露 霜降 立冬 小雪 大雪 冬至".split(" ");

export function parseTerms(html, year) {
  assert(html.includes("標準時:UT+8<sup>h</sup>"), `${year}: expected UT+8`);
  const table = html.match(/<table\b[^>]*id="phenom"[^>]*>([\s\S]*?)<\/table>/)?.[1];
  assert(table, `${year}: missing phenomena table`);
  const terms = [];
  for (const row of table.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/g)) {
    const cells = [...row[1].matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/g)]
      .map((cell) => cell[1].trim());
    if (cells[3] !== "二十四節気") continue;
    const index = terms.length;
    const date = cells[0].replaceAll("/", "-");
    assert.equal(parseDate(date).year, year);
    assert.match(cells[1], /^(?:(?:[01]\d|2[0-3]):[0-5]\d|24:00)$/);
    assert.equal(cells[2], "太陽");
    assert.equal(
      cells[5], `${japaneseNames[index]}(黄経${(285 + index * 15) % 360}°)`,
    );
    // Preserve the event's date when its rounded minute is 24:00.
    terms.push({ name: TERM_NAMES[index], date, time: cells[1] });
  }
  assert.equal(terms.length, 24, `${year}: expected 24 solar terms`);
  return terms;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const data = {};
  // Three requests at a time; publish the dataset only after all years validate.
  for (let start = MIN_YEAR; start <= MAX_YEAR; start += 3) {
    await Promise.all(Array.from(
      { length: Math.min(3, MAX_YEAR - start + 1) },
      async (_, i) => {
        const year = start + i;
        const response = await fetch(`${OFFICIAL_SOURCE}?year=${year}&lst=8`, {
          signal: AbortSignal.timeout(30000),
        });
        assert(response.ok, `${year}: HTTP ${response.status}`);
        data[year] = parseTerms(
          new TextDecoder("euc-jp").decode(await response.arrayBuffer()), year,
        );
      },
    ));
    if ((start - MIN_YEAR + 3) % 30 === 0) console.log(`Fetched through ${start + 2}`);
  }
  await writeFile(
    new URL("../src/official-terms.json", import.meta.url),
    JSON.stringify(data, null, 2) + "\n",
  );
  console.log(`Saved ${(MAX_YEAR - MIN_YEAR + 1) * 24} NAOJ solar terms in UT+8.`);
}
