window.MEMSCalendar = {
  init() {
    loadCalendarFromICS();
  }
};

async function loadCalendarFromICS() {
  try {
    const response = await fetch("media/data/reachcalendar.ics", {
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error("Calendar file could not be loaded.");
    }

    const icsText = await response.text();
    const events = parseICSCalendar(icsText);

    renderICSCalendar(events);

    if (typeof setStatus === "function") {
      setStatus("Calendar Loaded", "good");
    }
  } catch (error) {
    console.error(error);

    if (typeof setStatus === "function") {
      setStatus("Calendar Error", "bad");
    }

    const heroDate = document.getElementById("calendarHeroDate");
    const heroText = document.getElementById("calendarHeroText");

    if (heroDate) heroDate.textContent = "Calendar Error";
    if (heroText) {
      heroText.textContent =
        "Could not load media/data/reachcalendar.ics. Make sure the file path is correct.";
    }
  }
}

function parseICSCalendar(icsText) {
  const unfolded = icsText.replace(/\r?\n[ \t]/g, "");
  const blocks = unfolded.match(/BEGIN:VEVENT[\s\S]*?END:VEVENT/g) || [];

  const today = startOfToday(new Date());
  const rangeEnd = new Date(today);
  rangeEnd.setDate(rangeEnd.getDate() + 45);

  let events = [];

  blocks.forEach(block => {
    const event = parseICSEvent(block);

    if (!event.summary || !event.start) return;
    if (event.summary.toLowerCase().startsWith("canceled:")) return;
    if (event.status && event.status.toUpperCase() === "CANCELLED") return;

    if (event.className && event.className.toUpperCase() === "PRIVATE") {
      event.summary = "Private Appointment";
      event.location = "";
      event.description = "";
    }

    if (event.rrule) {
      events.push(...expandRecurringEvent(event, today, rangeEnd));
    } else {
      events.push(event);
    }
  });

  return events
    .filter(event => event.start >= today && event.start <= rangeEnd)
    .sort((a, b) => a.start - b.start);
}

function parseICSEvent(block) {
  const event = {};

  event.summary = getICSValue(block, "SUMMARY");
  event.location = cleanICSValue(getICSValue(block, "LOCATION"));
  event.description = cleanICSValue(getICSValue(block, "DESCRIPTION"));
  event.status = getICSValue(block, "STATUS");
  event.className = getICSValue(block, "CLASS");
  event.rrule = getICSValue(block, "RRULE");

  const startRaw = getICSDateLine(block, "DTSTART");
  const endRaw = getICSDateLine(block, "DTEND");

  event.allDay = startRaw?.includes("VALUE=DATE") || false;
  event.start = parseICSDate(startRaw);
  event.end = parseICSDate(endRaw);

  return event;
}

function getICSValue(block, key) {
  const regex = new RegExp(`^${key}(?:;[^:]*)?:(.*)$`, "m");
  const match = block.match(regex);
  return match ? cleanICSValue(match[1]) : "";
}

function getICSDateLine(block, key) {
  const regex = new RegExp(`^${key}(?:;[^:]*)?:.*$`, "m");
  const match = block.match(regex);
  return match ? match[0] : "";
}

function parseICSDate(line) {
  if (!line) return null;

  const value = line.split(":").pop();

  if (/^\d{8}$/.test(value)) {
    const year = Number(value.slice(0, 4));
    const month = Number(value.slice(4, 6)) - 1;
    const day = Number(value.slice(6, 8));
    return new Date(year, month, day);
  }

  const year = Number(value.slice(0, 4));
  const month = Number(value.slice(4, 6)) - 1;
  const day = Number(value.slice(6, 8));
  const hour = Number(value.slice(9, 11) || 0);
  const minute = Number(value.slice(11, 13) || 0);

  return new Date(year, month, day, hour, minute);
}

function expandRecurringEvent(event, rangeStart, rangeEnd) {
  const results = [];
  const rule = parseRRule(event.rrule);

  if (!rule.freq) return results;

  const until = rule.until ? parseRRuleUntil(rule.until) : rangeEnd;
  const finalDate = until < rangeEnd ? until : rangeEnd;

  const cursor = new Date(event.start);
  const duration = event.end ? event.end - event.start : 0;

  while (cursor <= finalDate) {
    if (cursor >= rangeStart) {
      const copy = { ...event };
      copy.start = new Date(cursor);
      copy.end = new Date(cursor.getTime() + duration);
      results.push(copy);
    }

    if (rule.freq === "WEEKLY") {
      cursor.setDate(cursor.getDate() + 7 * (rule.interval || 1));
    } else if (rule.freq === "MONTHLY") {
      cursor.setMonth(cursor.getMonth() + (rule.interval || 1));
    } else {
      break;
    }
  }

  return results;
}

function parseRRule(rrule) {
  const parts = {};

  rrule.split(";").forEach(part => {
    const [key, value] = part.split("=");
    parts[key.toLowerCase()] = value;
  });

  return {
    freq: parts.freq,
    until: parts.until,
    interval: Number(parts.interval || 1)
  };
}

function parseRRuleUntil(value) {
  const year = Number(value.slice(0, 4));
  const month = Number(value.slice(4, 6)) - 1;
  const day = Number(value.slice(6, 8));
  const hour = Number(value.slice(9, 11) || 23);
  const minute = Number(value.slice(11, 13) || 59);

  return new Date(year, month, day, hour, minute);
}

function renderICSCalendar(events) {
  const now = new Date();
  const todayEvents = events.filter(event => isSameDay(event.start, now));
  const nextEvent = events[0];

  setText("calendarUpcomingCount", events.length);
  setText("calendarTodayCount", todayEvents.length);
  setText("calendarTodayStatus", todayEvents.length ? "Scheduled" : "Clear");

  setText("calendarHeroDate", nextEvent ? formatShortDate(nextEvent.start) : "No Events");

  setText(
    "calendarHeroText",
    nextEvent
      ? `Next up: ${nextEvent.summary} at ${formatCalendarTime(nextEvent)}${nextEvent.location ? ` — ${nextEvent.location}` : ""}.`
      : "No upcoming events found in the calendar feed."
  );

  setText("calendarNextTime", nextEvent ? formatCalendarTime(nextEvent) : "--");
  setText("calendarNextTitle", nextEvent ? nextEvent.summary : "Nothing upcoming.");

  const todayList = document.getElementById("calendarTodayList");
  const upcomingList = document.getElementById("calendarUpcomingList");

  if (todayList) {
    todayList.innerHTML = todayEvents.length
      ? todayEvents.map(renderICSCalendarRow).join("")
      : `
        <div class="list-row">
          <div class="row-icon">✓</div>
          <div>
            <div class="row-title">No events listed for today</div>
            <div class="row-detail">Calendar is clear for today.</div>
          </div>
          <div class="row-tag">Clear</div>
        </div>
      `;
  }

  if (upcomingList) {
    upcomingList.innerHTML = events.length
      ? events.slice(0, 10).map(renderICSCalendarRow).join("")
      : `
        <div class="list-row">
          <div class="row-icon">—</div>
          <div>
            <div class="row-title">No upcoming events</div>
            <div class="row-detail">Nothing found in the next 45 days.</div>
          </div>
          <div class="row-tag">Empty</div>
        </div>
      `;
  }
}

function renderICSCalendarRow(event) {
  return `
    <div class="list-row calendar-row">
      <div class="row-icon">${getCalendarIconFromTitle(event.summary)}</div>

      <div>
        <div class="row-title">${escapeHTML(event.summary)}</div>
        <div class="row-detail">
          ${formatFullDate(event.start)} · ${formatCalendarTime(event)}
          ${event.location ? ` · ${escapeHTML(event.location)}` : ""}
        </div>
      </div>

      <div class="row-tag">${getCalendarType(event.summary)}</div>
    </div>
  `;
}

function getCalendarType(title) {
  const lower = title.toLowerCase();

  if (lower.includes("rookie")) return "Rookie";
  if (lower.includes("board")) return "Board";
  if (lower.includes("headshot") || lower.includes("photo")) return "Media";
  if (lower.includes("meeting")) return "Meeting";
  if (lower.includes("ems week")) return "EMS Week";
  if (lower.includes("blocked")) return "Blocked";
  if (lower.includes("graduation")) return "Academy";
  if (lower.includes("private")) return "Private";

  return "Event";
}

function getCalendarIconFromTitle(title) {
  const type = getCalendarType(title);

  const icons = {
    Rookie: "R",
    Board: "B",
    Media: "M",
    Meeting: "◆",
    "EMS Week": "E",
    Blocked: "■",
    Academy: "A",
    Private: "P",
    Event: "•"
  };

  return icons[type] || "•";
}

function formatCalendarTime(event) {
  if (event.allDay) return "All day";

  return event.start.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit"
  });
}

function formatShortDate(date) {
  return date.toLocaleDateString([], {
    weekday: "short",
    month: "short",
    day: "numeric"
  });
}

function formatFullDate(date) {
  return date.toLocaleDateString([], {
    weekday: "short",
    month: "short",
    day: "numeric"
  });
}

function startOfToday(date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function cleanICSValue(value) {
  if (!value) return "";

  return value
    .replace(/\\n/g, " ")
    .replace(/\\,/g, ",")
    .replace(/\\;/g, ";")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeHTML(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = value;
}

window.MEMSCalendar.loadEvents = async function () {
  const response = await fetch("media/data/reachcalendar.ics", {
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("Calendar file could not be loaded.");
  }

  const icsText = await response.text();
  return parseICSCalendar(icsText);
};
