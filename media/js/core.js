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
    render: () => renderPlaceholder(
      "Calendar",
      "Today’s schedule, upcoming events, board meetings, academy dates, media needs, and reminders will live here."
    )
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
