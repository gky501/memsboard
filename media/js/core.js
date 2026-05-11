const appRoot = document.getElementById("appRoot");
const pageTitle = document.getElementById("pageTitle");
const refreshStatus = document.getElementById("refreshStatus");

const loadedAssets = new Set();

const apps = {
  summary: {
    title: "Summary",
    render: renderSummary
  },

  weather: {
    title: "Weather",
    render: () => renderPlaceholder(
      "Weather",
      "Service-area weather, NWS alerts, radar, affected stations, Tempest conditions, and warning timing will live here."
    )
  },

  analytics: {
    title: "Analytics",
    render: () => renderPlaceholder(
      "Analytics",
      "Google Analytics, Meta insights, link tracking, top pages, campaigns, careers traffic, and audience reach will live here."
    )
  },

  media: {
    title: "Media Watch",
    render: () => renderPlaceholder(
      "Media Watch",
      "Google News, MEMS mentions, EMS industry stories, local public safety news, and keyword monitoring will live here."
    )
  },

  calendar: {
    title: "Calendar",
    render: renderCalendar
  },

  tools: {
    title: "Tools",
    render: renderTools
  }
};

function loadCSS(path) {
  if (!path || loadedAssets.has(path)) return;

  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = path;
  document.head.appendChild(link);

  loadedAssets.add(path);
}

function loadJS(path) {
  if (!path || loadedAssets.has(path)) return;

  const script = document.createElement("script");
  script.src = path;
  script.defer = true;
  document.body.appendChild(script);

  loadedAssets.add(path);
}

function loadApp(appName) {
  const app = apps[appName];

  if (!app) {
    console.warn(`App not found: ${appName}`);
    return;
  }

  pageTitle.textContent = app.title;

  if (app.css) loadCSS(app.css);
  if (app.js) loadJS(app.js);

  appRoot.innerHTML = app.render();

  document.querySelectorAll(".tab-btn").forEach((button) => {
    button.classList.toggle("active", button.dataset.app === appName);
  });

  setStatus("Live", "good");
}

function renderSummary() {
  return `
    <section class="dashboard-grid app-screen">

      <article class="card hero-card">
        <div class="hero-status">
          <span class="status-dot good"></span>
          System Normal
        </div>

        <div class="hero-message">
          <h2>Here for Life.</h2>
          <p>
            MEMS command summary with public reach, weather awareness, schedule,
            media monitoring, and system status in one display.
          </p>
        </div>

        <div class="metric-line">
          <span>Board Mode</span>
          <span>Desk / Yodeck Ready</span>
        </div>
      </article>

      <article class="card mini-card">
        <p class="card-title">Website Reach</p>
        <div class="card-big-number">--</div>
        <p class="card-subtext">Google Analytics connection pending.</p>
        <div class="metric-line">
          <span>Source</span>
          <span>GA4</span>
        </div>
      </article>

      <article class="card mini-card">
        <p class="card-title">Social Reach</p>
        <div class="card-big-number">--</div>
        <p class="card-subtext">Meta analytics connection pending.</p>
        <div class="metric-line">
          <span>Source</span>
          <span>Meta</span>
        </div>
      </article>

      <article class="card mini-card">
        <p class="card-title">Weather</p>
        <div class="card-big-number">OK</div>
        <p class="card-subtext">No active service-area alert data connected yet.</p>
        <div class="metric-line">
          <span>Status</span>
          <span>Pending</span>
        </div>
      </article>

      <article class="card mini-card">
        <p class="card-title">Calendar</p>
        <div class="card-big-number">--</div>
        <p class="card-subtext">Today’s events will show here.</p>
        <div class="metric-line">
          <span>Next Event</span>
          <span>Pending</span>
        </div>
      </article>

      <article class="card wide-card">
        <p class="card-title">Watchlist</p>

        <div class="card-list">
          <div class="list-row">
            <div class="row-icon">N</div>
            <div>
              <div class="row-title">MEMS Mentions</div>
              <div class="row-detail">Google News keyword tracking will appear here.</div>
            </div>
            <div class="row-tag">News</div>
          </div>

          <div class="list-row">
            <div class="row-icon">L</div>
            <div>
              <div class="row-title">State Legislation</div>
              <div class="row-detail">EMS, ambulance, trauma, Medicaid, and public safety bills.</div>
            </div>
            <div class="row-tag">Bills</div>
          </div>

          <div class="list-row">
            <div class="row-icon">R</div>
            <div>
              <div class="row-title">Recruiting Traffic</div>
              <div class="row-detail">Careers, Rookie School, and campaign performance.</div>
            </div>
            <div class="row-tag">Reach</div>
          </div>
        </div>
      </article>

      <article class="card wide-card">
        <p class="card-title">Today at MEMS</p>

        <div class="card-list">
          <div class="list-row">
            <div class="row-icon">1</div>
            <div>
              <div class="row-title">Calendar feed pending</div>
              <div class="row-detail">Google Calendar events will populate this card.</div>
            </div>
            <div class="row-tag">Today</div>
          </div>

          <div class="list-row">
            <div class="row-icon">2</div>
            <div>
              <div class="row-title">Content queue pending</div>
              <div class="row-detail">Upcoming posts, photo needs, and reminders can appear here.</div>
            </div>
            <div class="row-tag">PIO</div>
          </div>

          <div class="list-row">
            <div class="row-icon">3</div>
            <div>
              <div class="row-title">Systems check pending</div>
              <div class="row-detail">Website, feeds, and Yodeck status can appear here.</div>
            </div>
            <div class="row-tag">Status</div>
          </div>
        </div>
      </article>

    </section>
  `;
}
function renderCalendar() {
  const events = [
    {
      title: "Pinning Ceremony",
      date: "2026-05-12",
      time: "14:30",
      location: "Classroom 3",
      type: "Internal",
      note: "Captains and majors recognition"
    },
    {
      title: "Rookie 55 Classroom Photos",
      date: "2026-05-13",
      time: "09:00",
      location: "EMS Academy",
      type: "Media",
      note: "Classroom / candid coverage"
    },
    {
      title: "LRAA Board Meeting",
      date: "2026-05-20",
      time: "16:00",
      location: "MEMS HQ",
      type: "Board",
      note: "Agenda and public notice check"
    },
    {
      title: "Rookie 56 Applications Review",
      date: "2026-05-22",
      time: "10:00",
      location: "Recruiting",
      type: "Recruiting",
      note: "Check interest list and campaign traffic"
    },
    {
      title: "Paramedic Academy Content",
      date: "2026-05-27",
      time: "13:00",
      location: "EMS Academy",
      type: "Content",
      note: "Graduation / cohort follow-up"
    }
  ];

  const now = new Date();

  const upcomingEvents = events
    .map(event => {
      const eventDate = new Date(`${event.date}T${event.time}:00`);
      return {
        ...event,
        eventDate
      };
    })
    .filter(event => event.eventDate >= startOfToday(now))
    .sort((a, b) => a.eventDate - b.eventDate);

  const todayEvents = upcomingEvents.filter(event => isSameDay(event.eventDate, now));
  const nextEvent = upcomingEvents[0];

  const todayRows = todayEvents.length
    ? todayEvents.map(renderCalendarRow).join("")
    : `
      <div class="list-row">
        <div class="row-icon">✓</div>
        <div>
          <div class="row-title">No events listed for today</div>
          <div class="row-detail">Calendar is clear, or the Google Calendar feed has not been connected yet.</div>
        </div>
        <div class="row-tag">Today</div>
      </div>
    `;

  const upcomingRows = upcomingEvents.slice(0, 6).map(renderCalendarRow).join("");

  return `
    <section class="dashboard-grid app-screen">

      <article class="card hero-card calendar-hero">
        <div class="hero-status">
          <span class="status-dot good"></span>
          Calendar Active
        </div>

        <div class="hero-message">
          <h2>${nextEvent ? formatShortDate(nextEvent.eventDate) : "No Events"}</h2>
          <p>
            ${nextEvent
              ? `Next up: ${nextEvent.title} at ${formatTime(nextEvent.eventDate)} — ${nextEvent.location}.`
              : "No upcoming calendar events are currently loaded."
            }
          </p>
        </div>

        <div class="metric-line">
          <span>Upcoming Events</span>
          <span>${upcomingEvents.length}</span>
        </div>
      </article>

      <article class="card mini-card">
        <p class="card-title">Today</p>
        <div class="card-big-number">${todayEvents.length}</div>
        <p class="card-subtext">Events currently listed for today.</p>
        <div class="metric-line">
          <span>Status</span>
          <span>${todayEvents.length ? "Scheduled" : "Clear"}</span>
        </div>
      </article>

      <article class="card mini-card">
        <p class="card-title">Next Event</p>
        <div class="card-big-number">${nextEvent ? formatTime(nextEvent.eventDate) : "--"}</div>
        <p class="card-subtext">${nextEvent ? nextEvent.title : "Nothing upcoming."}</p>
        <div class="metric-line">
          <span>Type</span>
          <span>${nextEvent ? nextEvent.type : "None"}</span>
        </div>
      </article>

      <article class="card wide-card">
        <p class="card-title">Today at MEMS</p>

        <div class="card-list">
          ${todayRows}
        </div>
      </article>

      <article class="card wide-card">
        <p class="card-title">Upcoming</p>

        <div class="card-list">
          ${upcomingRows || `
            <div class="list-row">
              <div class="row-icon">—</div>
              <div>
                <div class="row-title">No upcoming events</div>
                <div class="row-detail">Add events to the calendar list or connect a Google Calendar feed.</div>
              </div>
              <div class="row-tag">Empty</div>
            </div>
          `}
        </div>
      </article>

    </section>
  `;
}

function renderCalendarRow(event) {
  return `
    <div class="list-row calendar-row">
      <div class="row-icon">${getCalendarIcon(event.type)}</div>

      <div>
        <div class="row-title">${event.title}</div>
        <div class="row-detail">
          ${formatFullDate(event.eventDate)} · ${formatTime(event.eventDate)} · ${event.location}
          ${event.note ? `<br>${event.note}` : ""}
        </div>
      </div>

      <div class="row-tag">${event.type}</div>
    </div>
  `;
}

function getCalendarIcon(type) {
  const icons = {
    Internal: "I",
    Media: "M",
    Board: "B",
    Recruiting: "R",
    Content: "C"
  };

  return icons[type] || "•";
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

function formatTime(date) {
  return date.toLocaleTimeString([], {
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
function renderTools() {
  const tools = [
    ["Joomla Admin", "Website management shortcut"],
    ["Google Analytics", "GA4 traffic and audience data"],
    ["Meta Business Suite", "Facebook and Instagram analytics"],
    ["Microsoft Clarity", "Human traffic and session recordings"],
    ["Rebrandly", "Campaign link tracking"],
    ["JazzHR", "Recruiting and job feed"],
    ["Yodeck", "Display management"],
    ["Cloudflare", "Pages, DNS, and site status"],
    ["GitHub", "Code and dashboard projects"]
  ];

  const rows = tools.map((tool) => `
    <div class="list-row">
      <div class="row-icon">↗</div>
      <div>
        <div class="row-title">${tool[0]}</div>
        <div class="row-detail">${tool[1]}</div>
      </div>
      <div class="row-tag">Tool</div>
    </div>
  `).join("");

  return `
    <section class="app-screen">
      <article class="card full-card" style="height: 100%;">
        <p class="card-title">Quick Launch</p>
        <div class="card-big-number">Tools</div>
        <p class="card-subtext">
          Touch-friendly launcher area for the systems used most often.
          Links can be wired in once the layout is locked.
        </p>

        <div class="card-list">
          ${rows}
        </div>
      </article>
    </section>
  `;
}

function renderPlaceholder(title, description) {
  return `
    <section class="app-screen">
      <div class="placeholder-panel">
        <div>
          <h2>${title}</h2>
          <p>${description}</p>
        </div>
      </div>
    </section>
  `;
}

function updateClock() {
  const now = new Date();

  document.getElementById("clockTime").textContent =
    now.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit"
    });

  document.getElementById("clockDate").textContent =
    now.toLocaleDateString([], {
      weekday: "long",
      month: "short",
      day: "numeric"
    });
}

function setStatus(text, type = "good") {
  const dotClass = type === "bad" ? "bad" : type === "warn" ? "warn" : "good";

  refreshStatus.innerHTML = `
    <span class="status-dot ${dotClass}"></span>
    ${text}
  `;
}

document.querySelectorAll(".tab-btn").forEach((button) => {
  button.addEventListener("click", () => {
    loadApp(button.dataset.app);
  });
});

updateClock();
setInterval(updateClock, 1000);

loadApp("summary");
