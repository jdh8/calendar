import {
  MIN_YEAR,
  MAX_YEAR,
  OFFICIAL_SOURCE,
  pad,
  dateKey,
  parseDate,
  todayInTaiwan,
  shiftDate,
  shiftMonth,
  solarTerms,
  lunarMonths,
  fromLunar,
  dayInfo,
  monthDays,
  daysInMonth,
} from "./calendar.js";

const $ = (selector) => document.querySelector(selector);
const escape = (text) =>
  String(text).replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        char
      ],
  );
const weekdays = "日一二三四五六";
const months = "一 二 三 四 五 六 七 八 九 十 十一 十二".split(" ");
const englishMonths =
  "JANUARY FEBRUARY MARCH APRIL MAY JUNE JULY AUGUST SEPTEMBER OCTOBER NOVEMBER DECEMBER".split(
    " ",
  );
const categoryNames = { term: "節氣", taiwan: "台灣", world: "世界" };
let selected = todayInTaiwan();
let activeView = "calendar";
let days = [];
const filters = new Set(["term", "taiwan", "world"]);
const requested = new URL(location.href).searchParams.get("date");
if (requested) {
  try {
    parseDate(requested);
    selected = requested;
  } catch {
    $("#status").textContent = "網址中的日期無效，已顯示今天。";
  }
}

$("#month").innerHTML = months
  .map((name, index) => `<option value="${index + 1}">${name}月</option>`)
  .join("");
$("#official-link").href = `${OFFICIAL_SOURCE}?lst=8`;

function eventsForDay(info) {
  const events = [...info.festivals];
  if (info.term)
    events.unshift({
      ...info.term,
      category: "term",
      note: `${info.term.time} · 台灣時間`,
    });
  return events.filter((event) => filters.has(event.category));
}

function navigate(value, focusDay = false) {
  try {
    parseDate(value);
    selected = value;
    $("#status").textContent = "";
    const url = new URL(location.href);
    url.searchParams.set("date", value);
    history.replaceState(null, "", url);
    render();
    if (focusDay) $(`[data-date="${value}"]`)?.focus({ preventScroll: true });
  } catch (error) {
    $("#status").textContent = error.message;
  }
}

function setView(view) {
  activeView = view;
  $("#calendar-view").hidden = view !== "calendar";
  $("#terms-view").hidden = view !== "terms";
  for (const name of ["calendar", "terms"]) {
    $(`#${name}-tab`).classList.toggle("active", name === view);
    $(`#${name}-tab`).setAttribute("aria-pressed", String(name === view));
  }
  render();
}

function render() {
  const { year, month } = parseDate(selected);
  days = monthDays(year, month);
  const info = days.find((day) => day.date === selected);
  $("#year").value = year;
  $("#month").value = month;
  $("#month").disabled = activeView === "terms";
  $("#month-number").textContent = activeView === "terms" ? "24" : month;
  $("#month-title").textContent =
    activeView === "terms"
      ? `${year} 年 · 二十四節氣`
      : `${year} 年 ${months[month - 1]}月`;
  const eraDays =
    activeView === "calendar"
      ? days
      : [dayInfo(dateKey(year, 1, 1)), dayInfo(dateKey(year, 12, 31))];
  const eras = [...new Set(eraDays.map((day) => day.era))].join(" ／ ");
  const japaneseEras = [...new Set(eraDays.map((day) => day.japaneseEra))].join(" ／ ");
  // Non-breaking spaces keep each piece whole when the subtitle wraps.
  $("#month-subtitle").textContent = [
    ...(activeView === "calendar" ? [englishMonths[month - 1]] : []),
    eras,
    `日本 ${japaneseEras}${year < 1873 ? "（西曆推算）" : ""}`,
  ]
    .map((piece) => piece.replaceAll(" ", "\u00a0"))
    .join(" · ");
  $("#previous").disabled =
    year === MIN_YEAR && (activeView === "terms" || month === 1);
  $("#next").disabled =
    year === MAX_YEAR && (activeView === "terms" || month === 12);
  $("#previous-year").disabled = year === MIN_YEAR;
  $("#next-year").disabled = year === MAX_YEAR;
  // ponytail: ‹ › already step a year in the terms view
  $("#previous-year").hidden = $("#next-year").hidden = activeView === "terms";
  $("#previous").setAttribute(
    "aria-label",
    activeView === "terms" ? "上一年" : "上一個月",
  );
  $("#next").setAttribute(
    "aria-label",
    activeView === "terms" ? "下一年" : "下一個月",
  );
  renderCalendar(info);
  renderDetail(info);
  renderEvents();
  renderTerms(year);
  document.title = `${year} 年 ${month} 月・日常萬年曆`;
}

function renderCalendar(info) {
  const today = todayInTaiwan();
  const offset = days[0].weekday;
  const count = Math.ceil((offset + days.length) / 7) * 7;
  const cells = Array.from({ length: count }, (_, index) => {
    const day = days[index - offset];
    if (!day) return '<td class="empty-day" aria-hidden="true"></td>';
    const events = eventsForDay(day);
    const labels = events
      .slice(0, 2)
      .map(
        (event) =>
          `<span class="day-event ${event.category}">${escape(event.name)}${event.category === "term" ? `<small>${event.time}</small>` : ""}</span>`,
      )
      .join("");
    const description = `${day.date} 星期${weekdays[day.weekday]}，農曆${day.lunarMonthName}${day.lunarDayName}${events.length ? "，" + events.map((event) => event.name + (event.time ? " " + event.time : "")).join("，") : ""}`;
    return `<td class="${day.weekday === 0 || day.weekday === 6 ? "weekend" : ""}"><button class="day ${day.date === selected ? "selected" : ""} ${day.date === today ? "is-today" : ""}" data-date="${day.date}" tabindex="${day.date === selected ? 0 : -1}" aria-label="${escape(description)}" aria-pressed="${day.date === selected}" ${day.date === today ? 'aria-current="date"' : ""}><span class="day-top"><span class="day-number">${day.day}</span>${day.date === today ? '<span class="today-marker">今</span>' : ""}</span><span class="lunar-label">${day.lunarDay === 1 ? day.lunarMonthName : day.lunarDayName}</span><span class="day-events">${labels}${events.length > 2 ? `<span class="more-events">+${events.length - 2} 項</span>` : ""}</span></button></td>`;
  });
  $("#calendar-body").innerHTML = Array.from(
    { length: count / 7 },
    (_, row) => `<tr>${cells.slice(row * 7, row * 7 + 7).join("")}</tr>`,
  ).join("");
  $(".calendar-table").setAttribute(
    "aria-label",
    `${info.year}年${info.month}月西曆與農曆對照月曆`,
  );
}

function renderDetail(info) {
  const currentTerms = solarTerms(info.year);
  const nextTerm =
    currentTerms.find((term) => term.date > info.date) ||
    (info.year < MAX_YEAR ? solarTerms(info.year + 1)[0] : null);
  // Day details always retain all events; filters only control the overview.
  const events = info.festivals;
  $("#day-detail").innerHTML =
    `<div class="detail-top"><span class="eyebrow">${info.date === todayInTaiwan() ? "TODAY" : "SELECTED DAY"}</span><span class="detail-weekday">星期${weekdays[info.weekday]}</span></div><div class="detail-number">${info.day}<span class="day-stamp" aria-hidden="true">日<br>常</span></div><p class="detail-date">${info.year} 年 ${info.month} 月 ${info.day} 日<br>${info.era}<br>日本 ${info.japaneseEra}${info.year < 1873 ? "（西曆推算）" : ""}</p><div class="lunar-detail"><span class="eyebrow">農曆</span><h3>${info.lunarMonthName}${info.lunarDayName}</h3><p>${info.ganZhi}年 · 肖${info.animal}</p><p class="zodiac">${info.zodiac.change ? `${info.zodiac.name}座 → ${info.zodiac.change.name}座 · ${info.zodiac.change.term} ${info.zodiac.change.time} 起` : `${info.zodiac.name}座 · ${info.zodiac.from}起`}</p></div><div class="detail-events">${info.term ? `<div class="detail-event"><span class="pill term">節氣</span><h4>${info.term.name} <time>${info.term.time}</time></h4><p>台灣時間</p></div>` : ""}${events.map((event) => `<div class="detail-event"><span class="pill ${event.category}">${categoryNames[event.category]}</span><h4>${escape(event.name)}</h4><p>${escape(event.note)}</p><a href="${escape(event.source)}" target="_blank" rel="noopener">查看來源 ↗</a></div>`).join("")}${!info.term && !events.length ? '<p class="quiet-day">平常的日子，也值得好好度過。<br><small>這一天沒有收錄的節慶。</small></p>' : ""}</div>${nextTerm ? `<button class="next-term" data-jump="${nextTerm.date}"><span class="eyebrow">下一個節氣 <span aria-hidden="true">↗</span></span><strong>${nextTerm.name}<span class="sun-symbol" aria-hidden="true">☼</span></strong><span>${Number(nextTerm.date.slice(5, 7))} 月 ${Number(nextTerm.date.slice(8))} 日 · ${nextTerm.time}</span><small>UTC+8</small></button>` : ""}`;
}

function renderEvents() {
  const events = days.flatMap((day) =>
    eventsForDay(day).map((event) => ({
      ...event,
      date: day.date,
      day: day.day,
      weekday: day.weekday,
    })),
  );
  $("#month-events").innerHTML = events.length
    ? events
        .map(
          (event) =>
            `<button class="event-row" data-jump="${event.date}"><span class="event-date">${event.day}<small>週${weekdays[event.weekday]}</small></span><span class="event-description"><strong>${escape(event.name)}</strong><small>${event.category === "term" ? `${event.time} · 台灣時間` : escape(event.note)}</small></span><span class="pill ${event.category}">${categoryNames[event.category]}</span><span class="event-arrow" aria-hidden="true">↗</span></button>`,
        )
        .join("")
    : '<p class="empty-state">這個月沒有符合篩選的項目。可開啟上方分類，看看其他日子。</p>';
}

function renderTerms(year) {
  const terms = solarTerms(year);
  $("#terms-title").textContent = `${year} 年，一年的二十四個時刻`;
  $("#terms-source").href = terms[0].source;
  $("#year-terms").innerHTML = terms
    .map(
      (term, index) =>
        `<button class="term-card ${term.date.slice(0, 7) === selected.slice(0, 7) ? "current-month" : ""}" data-jump="${term.date}"><span class="term-index">${pad(index + 1)}</span><strong>${term.name}</strong><span>${Number(term.date.slice(5, 7))} 月 ${Number(term.date.slice(8))} 日</span><time>${term.time}</time><small>UTC+8</small></button>`,
    )
    .join("");
}

$(".month-controls").addEventListener("input", () => {
  if (!$("#year").validity.valid) return;
  const year = Number($("#year").value),
    month = Number($("#month").value);
  navigate(
    dateKey(
      year,
      month,
      Math.min(parseDate(selected).day, daysInMonth(year, month)),
    ),
  );
});
for (const [id, months] of [
  ["previous-year", -12],
  ["previous", -1],
  ["next", 1],
  ["next-year", 12],
]) {
  $(`#${id}`).addEventListener("click", () => {
    try {
      navigate(
        shiftMonth(selected, activeView === "terms" ? Math.sign(months) * 12 : months),
      );
    } catch (error) {
      $("#status").textContent = error.message;
    }
  });
}
$("#today").addEventListener("click", () => {
  setView("calendar");
  navigate(todayInTaiwan());
});
$("#calendar-tab").addEventListener("click", () => setView("calendar"));
$("#terms-tab").addEventListener("click", () => setView("terms"));
$("#calendar-body").addEventListener("click", (event) => {
  const button = event.target.closest("[data-date]");
  if (button) navigate(button.dataset.date, true);
});
$("#calendar-body").addEventListener("keydown", (event) => {
  const amounts = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
  if (!(event.key in amounts) && event.key !== "Home" && event.key !== "End")
    return;
  event.preventDefault();
  try {
    const { year, month } = parseDate(selected);
    navigate(
      event.key === "Home"
        ? dateKey(year, month, 1)
        : event.key === "End"
          ? dateKey(year, month, daysInMonth(year, month))
          : shiftDate(selected, amounts[event.key]),
      true,
    );
  } catch {
    /* The calendar stops at its documented year boundaries. */
  }
});
document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-jump]");
  if (button) {
    setView("calendar");
    navigate(button.dataset.jump, true);
    $(".workspace-toolbar").scrollIntoView({
      behavior: "instant",
      block: "start",
    });
  }
});
$(".filters").addEventListener("change", (event) => {
  event.target.checked
    ? filters.add(event.target.value)
    : filters.delete(event.target.value);
  render();
});
for (const selector of ["#about-button", "#footer-about"])
  $(selector).addEventListener("click", () => $("#about-dialog").showModal());
document
  .querySelectorAll(".close-dialog")
  .forEach((button) =>
    button.addEventListener("click", () => button.closest("dialog").close()),
  );

function updateLunarFields(preferredMonth, preferredDay = 1) {
  try {
    const year = Number($("#lunar-year").value);
    const choices = lunarMonths(year);
    const chosen =
      choices.find((item) => item.value === Number(preferredMonth)) ||
      choices[0];
    $("#lunar-month").innerHTML = choices
      .map(
        (item) =>
          `<option value="${item.value}">${item.name}${item.days === 30 ? "（大）" : "（小）"}</option>`,
      )
      .join("");
    $("#lunar-month").value = chosen.value;
    $("#lunar-day").innerHTML = Array.from(
      { length: chosen.days },
      (_, i) => `<option value="${i + 1}">${i + 1} 日</option>`,
    ).join("");
    $("#lunar-day").value = Math.min(Number(preferredDay), chosen.days);
    $("#conversion-error").textContent = "";
  } catch (error) {
    $("#conversion-error").textContent = error.message;
  }
}
$("#jump-button").addEventListener("click", () => {
  const info = dayInfo(selected);
  $("#solar-date").value = selected;
  $("#lunar-year").value = info.lunarYear;
  updateLunarFields(info.lunarMonth, info.lunarDay);
  $("#jump-dialog").showModal();
});
$("#lunar-year").addEventListener("input", () =>
  updateLunarFields($("#lunar-month").value, $("#lunar-day").value),
);
$("#lunar-month").addEventListener("change", () =>
  updateLunarFields($("#lunar-month").value, $("#lunar-day").value),
);
for (const kind of ["solar", "lunar"]) {
  $(`#${kind}-form`).addEventListener("submit", (event) => {
    event.preventDefault();
    try {
      const value =
        kind === "solar"
          ? $("#solar-date").value
          : fromLunar(
              Number($("#lunar-year").value),
              Number($("#lunar-month").value),
              Number($("#lunar-day").value),
            );
      parseDate(value);
      $("#jump-dialog").close();
      setView("calendar");
      navigate(value, true);
    } catch (error) {
      $("#conversion-error").textContent = error.message;
    }
  });
}
render();
