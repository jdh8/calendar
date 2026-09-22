import lunar from "lunar-javascript";
import officialTerms from "./official-terms.json" with { type: "json" };
import { festivalsForDate } from "./festivals.js";

const { Solar, Lunar, LunarYear, LunarMonth } = lunar;
const japaneseYear = new Intl.DateTimeFormat("ja-JP-u-ca-japanese", {
  timeZone: "UTC",
  era: "long",
  year: "numeric",
});
const qingEras = [
  [1909, "宣統"],
  [1875, "光緒"],
  [1862, "同治"],
  [1851, "咸豐"],
  [1821, "道光"],
  [1796, "嘉慶"],
];
export const MIN_YEAR = 1801;
export const MAX_YEAR = 2100;
export const OFFICIAL_SOURCE =
  "https://eco.mtk.nao.ac.jp/cgi-bin/koyomi/cande/phenomena_sy.cgi";
export const TERM_NAMES =
  "小寒 大寒 立春 雨水 驚蟄 春分 清明 穀雨 立夏 小滿 芒種 夏至 小暑 大暑 立秋 處暑 白露 秋分 寒露 霜降 立冬 小雪 大雪 冬至".split(
    " ",
  );
export const pad = (value) => String(value).padStart(2, "0");
// Tropical zodiac boundaries are the twelve 中氣 (solar longitude multiples of 30°).
export const ZODIAC = {
  雨水: "雙魚",
  春分: "牡羊",
  穀雨: "金牛",
  小滿: "雙子",
  夏至: "巨蟹",
  大暑: "獅子",
  處暑: "處女",
  秋分: "天秤",
  霜降: "天蠍",
  小雪: "射手",
  冬至: "摩羯",
  大寒: "水瓶",
};
const traditional = (value) =>
  value.replace(
    /[闰腊马龙鸡猪惊蛰谷满种处]/g,
    (c) =>
      ({
        闰: "閏",
        腊: "臘",
        马: "馬",
        龙: "龍",
        鸡: "雞",
        猪: "豬",
        惊: "驚",
        蛰: "蟄",
        谷: "穀",
        满: "滿",
        种: "種",
        处: "處",
      })[c],
  );
export const dateKey = (year, month, day) =>
  `${year}-${pad(month)}-${pad(day)}`;
export const daysInMonth = (year, month) =>
  new Date(Date.UTC(year, month, 0)).getUTCDate();

export function parseDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value))
    throw new RangeError("請輸入有效日期。");
  const [year, month, day] = value.split("-").map(Number);
  if (
    year < MIN_YEAR ||
    year > MAX_YEAR ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > daysInMonth(year, month)
  ) {
    throw new RangeError(`日期範圍為 ${MIN_YEAR}–${MAX_YEAR} 年。`);
  }
  return { year, month, day };
}

export function todayInTaiwan(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const get = (type) => parts.find((p) => p.type === type).value;
  return `${get("year")}-${get("month")}-${get("day")}`;
}

export function shiftDate(value, days) {
  const { year, month, day } = parseDate(value);
  const result = new Date(Date.UTC(year, month - 1, day + days))
    .toISOString()
    .slice(0, 10);
  parseDate(result);
  return result;
}

export function shiftMonth(value, amount) {
  const { year, month, day } = parseDate(value);
  const next = new Date(Date.UTC(year, month - 1 + amount, 1));
  const y = next.getUTCFullYear(),
    m = next.getUTCMonth() + 1;
  const result = dateKey(y, m, Math.min(day, daysInMonth(y, m)));
  parseDate(result);
  return result;
}

const termsCache = new Map();
export function solarTerms(year) {
  if (!Number.isInteger(year) || year < MIN_YEAR || year > MAX_YEAR)
    throw new RangeError("年份超出範圍。");
  if (!termsCache.has(year)) {
    termsCache.set(
      year,
      officialTerms[year].map((term) => ({
        ...term,
        source: `${OFFICIAL_SOURCE}?year=${year}&lst=8`,
      })),
    );
  }
  return termsCache.get(year);
}

export function lunarMonths(year) {
  if (!Number.isInteger(year) || year < MIN_YEAR - 1 || year > MAX_YEAR)
    throw new RangeError(`農曆年份範圍為 ${MIN_YEAR - 1}–${MAX_YEAR} 年。`);
  return LunarYear.fromYear(year)
    .getMonths()
    .filter((month) => month.getYear() === year)
    .map((month) => ({
      value: month.getMonth(),
      days: month.getDayCount(),
      name: `${month.getMonth() < 0 ? "閏" : ""}${"正 二 三 四 五 六 七 八 九 十 冬 臘".split(" ")[Math.abs(month.getMonth()) - 1]}月`,
    }));
}

export function fromLunar(year, month, day) {
  const selected = lunarMonths(year).find((item) => item.value === month);
  if (!selected || !Number.isInteger(day) || day < 1 || day > selected.days)
    throw new RangeError("這個農曆日期不存在，請確認閏月與大小月。");
  const value = Lunar.fromYmd(year, month, day).getSolar().toYmd();
  parseDate(value);
  return value;
}

function eraLabel(year, lunarYear) {
  if (year >= 1912) return `民國 ${year - 1911} 年`;
  const [start, name] = qingEras.find(([start]) => lunarYear >= start);
  const count = lunarYear - start + 1;
  return `清 ${name}${count === 1 ? "元年" : ` ${count} 年`}`;
}

export function zodiac(value) {
  const majors = solarTerms(parseDate(value).year).filter(
    (term) => ZODIAC[term.name],
  );
  // Before 大寒 the sign comes from last year's 冬至; no need to load that year.
  const from = majors.findLast((term) => term.date < value)?.name || "冬至";
  const change = majors.find((term) => term.date === value);
  return {
    name: ZODIAC[from],
    from,
    change: change ? { name: ZODIAC[change.name], term: change.name, time: change.time } : null,
  };
}

export function dayInfo(value) {
  const { year, month, day } = parseDate(value);
  const solar = Solar.fromYmd(year, month, day);
  const l = solar.getLunar();
  const lunarMonth = l.getMonth(),
    lunarDay = l.getDay();
  const term = solarTerms(year).find((item) => item.date === value);
  const isLunarYearEnd =
    lunarMonth === 12 &&
    lunarDay === LunarMonth.fromYm(l.getYear(), 12).getDayCount();
  const info = {
    date: value,
    era: eraLabel(year, l.getYear()),
    // ponytail: Intl uses a proleptic calendar before 1873; a historical Japanese lunisolar calendar needs separate data.
    japaneseEra: japaneseYear
      .format(new Date(`${value}T00:00:00Z`))
      .replace(/(\d+)/, " $1 "),
    year,
    month,
    day,
    weekday: new Date(Date.UTC(year, month - 1, day)).getUTCDay(),
    lunarYear: l.getYear(),
    lunarMonth,
    lunarDay,
    isLunarYearEnd,
    solarTerm: term?.name || null,
    lunarMonthName: `${traditional(l.getMonthInChinese())}月`,
    lunarDayName: l.getDayInChinese(),
    ganZhi: l.getYearInGanZhi(),
    animal: traditional(l.getYearShengXiao()),
    zodiac: zodiac(value),
    term,
  };
  return { ...info, festivals: festivalsForDate(info) };
}

export function monthDays(year, month) {
  parseDate(dateKey(year, month, 1));
  return Array.from({ length: daysInMonth(year, month) }, (_, index) =>
    dayInfo(dateKey(year, month, index + 1)),
  );
}
