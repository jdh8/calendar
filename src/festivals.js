// ponytail: curated current recurrence rules; add dated source tables for historical holidays/leave.
// Years are the earliest supported use of each modern date/name; earlier variants are omitted.
const TW = "https://www.dgpa.gov.tw/information?pid=12572&uid=55";
const TRADITION = "https://www.taiwan.net.tw/m1.aspx?sno=0001020";
const UN = "https://www.un.org/en/observances/list-days-weeks";
const US =
  "https://www.opm.gov/policy-data-oversight/pay-leave/federal-holidays/";
const EASTER = "https://aa.usno.navy.mil/faq/easter";

export const festivalScope =
  "精選台灣及世界節慶，採現代通行日期規則；非歷年法定放假、補班補假或完整宗教節曆。已知的現代紀念日設起始年份，較早的名稱及日期變革未重建。";
export const festivalSources = [
  { name: "人事行政總處：台灣紀念日及節日", url: TW },
  { name: "交通部觀光署：傳統節慶", url: TRADITION },
  { name: "聯合國：國際日", url: UN },
  { name: "美國海軍天文台：復活節算法", url: EASTER },
];

// [month, day, name, first supported year, note, source]
const taiwanFixed = [
  [1, 1, "元旦", 1912, "中華民國開國紀念日；國曆新年。", TW],
  [2, 28, "和平紀念日", 1996, "紀念二二八事件；此處不判定放假。", TW],
  [
    3,
    12,
    "植樹節",
    1929,
    "台灣；現行三月十二日紀念日期。",
    "https://www.yunlin.gov.tw/News_Content.aspx?n=1246&s=255065",
  ],
  [
    3,
    29,
    "青年節",
    1944,
    "台灣；三月二十九日，紀念革命先烈。",
    "https://art.archives.gov.tw/tw/art/1719-15780.html",
  ],
  [
    4,
    4,
    "兒童節",
    1931,
    "台灣的兒童節；各地日期不同。",
    "https://news.immigration.gov.tw/NewsSection/Detail/65cd7889-6547-466b-b82a-9ebb12a1ee9f?category=9&lang=TW",
  ],
  [5, 1, "勞動節", 1890, "五月一日勞動節；此處不判定放假。", TW],
  [
    8,
    1,
    "原住民族日",
    2005,
    "台灣；紀念原住民族正名。",
    "https://www.ipc.gov.taipei/News.aspx?n=72DD8B6A7F09B30F&sms=88964D4C37471DCF",
  ],
  [8, 8, "父親節", 1945, "台灣；八月八日的「八八節」。", TW],
  [9, 3, "軍人節", 1955, "台灣；九月三日。", TW],
  [
    9,
    21,
    "國家防災日",
    2000,
    "台灣；紀念九二一地震、推廣防災。",
    "https://web.wra.gov.tw/wrafpc/News_Content_WrafpcStyle1.aspx?n=7859&s=49616",
  ],
  [9, 28, "教師節", 1952, "台灣；孔子誕辰紀念日。", TW],
  [10, 10, "國慶日", 1912, "中華民國國慶日。", TW],
  [
    10,
    25,
    "臺灣光復暨金門古寧頭大捷紀念日",
    2025,
    "台灣；採二〇二五年條例的合併名稱，未重建早期名稱。",
    TW,
  ],
  [12, 25, "行憲紀念日", 1947, "紀念中華民國憲法施行。", TW],
];

const worldFixed = [
  [
    2,
    14,
    "西洋情人節",
    0,
    "歐美起源、許多地區慶祝。",
    "https://www.loc.gov/item/today-in-history/february-14/",
  ],
  [
    2,
    21,
    "國際母語日",
    2000,
    "聯合國／UNESCO；重視語言與文化多樣性。",
    "https://www.un.org/pga/74/2020/02/21/annual-celebration-of-the-international-mother-language-day/",
  ],
  [3, 8, "國際婦女節", 1975, "聯合國自一九七五年起紀念；民間起源更早。", UN],
  [3, 20, "國際幸福日", 2013, "聯合國國際日。", UN],
  [
    3,
    22,
    "世界水日",
    1993,
    "聯合國；關注水資源。",
    "https://www.un.org/en/node/84118",
  ],
  [
    4,
    22,
    "世界地球日",
    1970,
    "全球環境倡議；一九七〇年首次舉行。",
    "https://www.earthday.org/history/",
  ],
  [
    4,
    23,
    "世界閱讀日",
    1996,
    "UNESCO 世界圖書與版權日。",
    "https://www.unesco.org/en/days/world-book-and-copyright",
  ],
  [5, 3, "世界新聞自由日", 1994, "聯合國；一九九三年十二月宣布設立。", UN],
  [
    6,
    5,
    "世界環境日",
    1973,
    "聯合國環境署；一九七三年首次慶祝。",
    "https://www.un.org/en/node/72312",
  ],
  [
    6,
    8,
    "世界海洋日",
    2009,
    "聯合國自二〇〇九年起紀念。",
    "https://digitallibrary.un.org/record/642982",
  ],
  [
    7,
    1,
    "加拿大國慶日",
    1983,
    "加拿大；現名於一九八二年十月確立，早期稱自治領日。",
    "https://www.canada.ca/en/canadian-heritage/campaigns/canada-day/about.html",
  ],
  [7, 4, "美國獨立日", 1777, "美國；七月四日，不含遇假日調移。", US],
  [
    7,
    14,
    "法國國慶日",
    1880,
    "法國；七月十四日。",
    "https://www.elysee.fr/en/french-presidency/bastille-day-14-july",
  ],
  [8, 9, "世界原住民族日", 1995, "聯合國國際日；與台灣八月一日不同。", UN],
  [8, 12, "國際青年日", 2000, "聯合國國際日。", UN],
  [
    9,
    21,
    "國際和平日",
    2002,
    "聯合國；自二〇〇二年固定為九月二十一日。",
    "https://www.un.org/en/peace-and-security/the-history-of-the-International-Day-of-Peace",
  ],
  [10, 24, "聯合國日", 1948, "紀念聯合國憲章生效。", UN],
  [
    10,
    31,
    "萬聖夜",
    0,
    "歐美等地；Halloween，為萬聖節前夕。",
    "https://blogs.loc.gov/loc/2008/10/maybe-i-will-go-as-crazy-newspaper-face/",
  ],
  [11, 20, "世界兒童日", 1954, "聯合國；與台灣四月四日兒童節不同。", UN],
  [
    12,
    1,
    "世界愛滋日",
    1988,
    "聯合國／WHO；一九八八年創立。",
    "https://www.un.org/en/node/98380",
  ],
  [
    12,
    10,
    "世界人權日",
    1950,
    "聯合國；紀念世界人權宣言。",
    "https://digitallibrary.un.org/record/210559?ln=en",
  ],
  [
    12,
    25,
    "聖誕節",
    0,
    "採西曆十二月二十五日的基督宗教與地區；並非所有教會同日。",
    US,
  ],
];

const lunarFestivals = [
  [1, 1, "春節", "農曆正月初一。"],
  [1, 2, "初二・回娘家", "農曆正月初二；台灣年節習俗。"],
  [1, 15, "元宵節", "農曆正月十五。"],
  [4, 8, "佛陀誕辰", "台灣農曆四月初八習俗；各地佛誕日期不同。"],
  [5, 5, "端午節", "農曆五月初五。"],
  [7, 7, "七夕", "農曆七月初七。"],
  [7, 15, "中元節", "農曆七月十五。"],
  [8, 15, "中秋節", "農曆八月十五。"],
  [9, 9, "重陽節", "農曆九月初九。"],
];

// Gregorian ecclesiastical Easter, Oudin (1940), as published by USNO.
function easterDate(year) {
  const floor = Math.floor;
  const century = floor(year / 100);
  const golden = year % 19;
  const correction = floor((century - 17) / 25);
  let moon =
    (century -
      floor(century / 4) -
      floor((century - correction) / 3) +
      19 * golden +
      15) %
    30;
  moon -=
    floor(moon / 28) *
    (1 - floor(moon / 28) * floor(29 / (moon + 1)) * floor((21 - golden) / 11));
  const weekday =
    (year + floor(year / 4) + moon + 2 - century + floor(century / 4)) % 7;
  const offset = moon - weekday;
  const month = 3 + floor((offset + 40) / 44);
  return { month, day: offset + 28 - 31 * floor(month / 4) };
}

/** weekday: 0 (Sunday)–6; lunarMonth: negative for leap months. Inputs are calendar-engine dates. */
export function festivalsForDate({
  year,
  month,
  day,
  weekday,
  lunarMonth,
  lunarDay,
  isLunarYearEnd,
  solarTerm,
}) {
  const result = [];
  const add = (name, category, note, source) =>
    result.push({ name, category, note, source });
  for (const [category, entries] of [
    ["taiwan", taiwanFixed],
    ["world", worldFixed],
  ]) {
    for (const [m, d, name, since, note, source] of entries) {
      if (month === m && day === d && year >= since)
        add(name, category, note, source);
    }
  }
  if (lunarMonth > 0) {
    for (const [m, d, name, note] of lunarFestivals) {
      if (lunarMonth === m && lunarDay === d)
        add(name, "taiwan", note, m === 4 ? TW : TRADITION);
    }
  }
  if (isLunarYearEnd)
    add(
      "除夕",
      "taiwan",
      "農曆年最後一天，依次日是否正月初一判定。",
      TRADITION,
    );
  if (solarTerm === "清明")
    add("清明節", "taiwan", "依清明節氣在台灣時間的日期判定。", TRADITION);
  if (solarTerm === "冬至")
    add("冬至", "taiwan", "依冬至節氣在台灣時間的日期判定。", TRADITION);
  const week = Math.ceil(day / 7);
  if (weekday === 0 && month === 5 && week === 2 && year >= 1914)
    add("母親節", "taiwan", "台灣等地；五月第二個星期日。", TW);
  if (weekday === 0 && month === 8 && week === 4 && year >= 2010)
    add(
      "祖父母節",
      "taiwan",
      "台灣；八月第四個星期日。",
      "https://www.nmmst.gov.tw/chhtml/newsdetail/29/4586",
    );
  if (weekday === 0 && month === 6 && week === 3 && year >= 1972)
    add(
      "父親節（美國）",
      "world",
      "美國現行紀念日；六月第三個星期日。",
      "https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title36-section109&num=0&edition=prelim",
    );
  if (weekday === 4 && month === 11 && week === 4 && year >= 1942)
    add(
      "感恩節（美國）",
      "world",
      "美國；採一九四二年起十一月第四個星期四的聯邦規則。",
      "https://www.archives.gov/legislative/features/thanksgiving",
    );
  if (year >= 1583 && (month === 3 || month === 4)) {
    const easter = easterDate(year);
    if (month === easter.month && day === easter.day)
      add(
        "復活節（西方教會）",
        "world",
        "採格里曆教會算法；與天文滿月、東方教會算法不同。",
        EASTER,
      );
  }
  return result;
}
