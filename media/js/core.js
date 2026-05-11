const appRoot = document.getElementById("appRoot");
const pageTitle = document.getElementById("pageTitle");
const loadedAssets = new Set();
const REFRESH_EVERY_MS = 5 * 60 * 1000;
const INACTIVITY_RESET_MS = 60 * 60 * 1000;

const STORAGE_KEYS = {
  activeApp: "memsboard.activeApp",
  lastActivity: "memsboard.lastActivity"
};
const apps = {
  command: {
    title: "Command",
    render: renderCommand
  },

  weather: {
    title: "Weather",
    css: "media/css/weather.css",
    js: "media/js/weather.js",
    render: renderWeatherShell,
    afterRender: () => {
      if (window.MEMSWeather && typeof window.MEMSWeather.init === "function") {
        window.MEMSWeather.init();
      }
    }
  },

  calendar: {
    title: "Calendar",
    render: () => renderPlaceholder("Calendar", "Calendar app comes next.")
  },

  legislation: {
    title: "Legislation",
    render: () => renderPlaceholder("Legislation", "Bill tracking and legislative calendar will live here.")
  },

  news: {
    title: "News",
    render: () => renderPlaceholder("News", "Top EMS stories and MEMS mentions will live here.")
  },

  metrics: {
    title: "Metrics",
    render: () => renderPlaceholder("Metrics", "Google, Facebook, Instagram, and LinkedIn metrics will live here.")
  },

  tools: {
    title: "Tools",
    render: () => renderPlaceholder("Tools", "Quick links and system shortcuts will live here.")
  }
};
function markUserActivity() {
  localStorage.setItem(STORAGE_KEYS.lastActivity, String(Date.now()));
}

function getLastActivity() {
  return Number(localStorage.getItem(STORAGE_KEYS.lastActivity) || Date.now());
}

function getStartupApp() {
  const savedApp = localStorage.getItem(STORAGE_KEYS.activeApp) || "command";
  const lastActivity = getLastActivity();
  const inactiveFor = Date.now() - lastActivity;

  if (inactiveFor >= INACTIVITY_RESET_MS) {
    localStorage.setItem(STORAGE_KEYS.activeApp, "command");
    return "command";
  }

  return apps[savedApp] ? savedApp : "command";
}

function startAutoRefresh() {
  setInterval(() => {
    location.reload();
  }, REFRESH_EVERY_MS);
}

function setupActivityTracking() {
  ["click", "touchstart", "keydown", "pointerdown"].forEach(eventName => {
    window.addEventListener(eventName, markUserActivity, {
      passive: true
    });
  });

  if (!localStorage.getItem(STORAGE_KEYS.lastActivity)) {
    markUserActivity();
  }
}
function loadCSS(path) {
  if (!path || loadedAssets.has(path)) return;

  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = path;
  document.head.appendChild(link);

  loadedAssets.add(path);
}

function loadJS(path, callback) {
  if (!path) return;

  if (loadedAssets.has(path)) {
    if (typeof callback === "function") callback();
    return;
  }

  const script = document.createElement("script");
  script.src = path;
  script.defer = true;

  script.onload = () => {
    loadedAssets.add(path);
    if (typeof callback === "function") callback();
  };

  script.onerror = () => {
    console.error(`Could not load script: ${path}`);
  };

  document.body.appendChild(script);
}

function loadApp(appName) {
  const app = apps[appName];
  if (!app) return;
  
  localStorage.setItem(STORAGE_KEYS.activeApp, appName);

  pageTitle.textContent = app.title;

  if (app.css) loadCSS(app.css);

  appRoot.innerHTML = app.render();

  if (app.js) {
    loadJS(app.js, () => {
      if (typeof app.afterRender === "function") app.afterRender();
    });
  } else if (typeof app.afterRender === "function") {
    app.afterRender();
  }

  document.querySelectorAll(".tab-btn").forEach(button => {
    button.classList.toggle("active", button.dataset.app === appName);
  });
}

function renderCommand() {
  return `
    <section class="dashboard-grid app-screen">
      <article class="card hero-card">
        <div class="hero-status">
          <span class="status-dot"></span>
          Command Ready
        </div>

        <div class="hero-message">
          <h2>Personal Board</h2>
          <p>
            Weather, calendar, legislation, news, and public-facing metrics
            in one blue-side command display.
          </p>
        </div>

        <div class="metric-line">
          <span>Current App</span>
          <span>Command</span>
        </div>
      </article>

      <article class="card mini-card">
        <p class="card-title">Weather</p>
        <div class="card-big-number">--</div>
        <p class="card-subtext">Forecast preview will connect after the weather app loads.</p>
      </article>

      <article class="card mini-card">
        <p class="card-title">Calendar</p>
        <div class="card-big-number">--</div>
        <p class="card-subtext">Today’s schedule will show here later.</p>
      </article>

      <article class="card mini-card">
        <p class="card-title">News</p>
        <div class="card-big-number">--</div>
        <p class="card-subtext">EMS and MEMS watchlist coming soon.</p>
      </article>

      <article class="card mini-card">
        <p class="card-title">Metrics</p>
        <div class="card-big-number">--</div>
        <p class="card-subtext">Google and social metrics coming soon.</p>
      </article>

      <article class="card wide-card">
        <p class="card-title">Build Queue</p>
        <div class="card-list">
          <div class="list-row">
            <div class="row-icon">1</div>
            <div>
              <div class="row-title">Weather</div>
              <div class="row-detail">Forecast, alerts, heat risk, and hazard outlook.</div>
            </div>
            <div class="row-tag">Now</div>
          </div>

          <div class="list-row">
            <div class="row-icon">2</div>
            <div>
              <div class="row-title">Calendar</div>
              <div class="row-detail">ICS feed, recognition days, and post recommendations.</div>
            </div>
            <div class="row-tag">Next</div>
          </div>
        </div>
      </article>
    </section>
  `;
}

function renderWeatherShell() {
  return `
    <section class="dashboard-grid app-screen weather-screen">

      <article class="card hero-card weather-now-card">
        <div class="hero-status" id="weatherStatusPill">
          <span class="status-dot"></span>
          Weather Loading
        </div>

        <div class="hero-message">
          <h2 id="weatherHeroTemp">--°</h2>
          <p id="weatherHeroText">Loading forecast for Little Rock / MEMS service area...</p>
        </div>

        <div class="weather-meta-grid">
          <div>
            <span>High</span>
            <strong id="weatherTodayHigh">--°</strong>
          </div>
          <div>
            <span>Low</span>
            <strong id="weatherTodayLow">--°</strong>
          </div>
          <div>
            <span>Wind</span>
            <strong id="weatherWind">--</strong>
          </div>
        </div>
      </article>

      <article class="card mini-card">
        <p class="card-title">Active Alerts</p>
        <div class="card-big-number" id="weatherAlertCount">--</div>
        <p class="card-subtext" id="weatherAlertText">Checking Arkansas alerts...</p>
      </article>

      <article class="card mini-card heat-card">
        <p class="card-title">Heat Risk</p>
        <div class="card-big-number" id="weatherHeatLevel">--</div>
        <p class="card-subtext" id="weatherHeatText">Checking forecast highs...</p>
      </article>

      <article class="card wide-card forecast-card">
        <p class="card-title">Week Forecast</p>
        <div class="forecast-strip" id="weatherForecastStrip"></div>
      </article>

      <article class="card wide-card">
        <p class="card-title">Hazard Outlook</p>
        <div class="hazard-box">
          <div>
            <h3>Graphical Hazardous Weather Outlook</h3>
            <p>
              LZK hazard outlook for potential weather hazards through seven days.
            </p>
          </div>
          <a class="weather-link" href="https://www.weather.gov/erh/ghwo?wfo=lzk" target="_blank" rel="noopener">
            Open GHWO
          </a>
        </div>

        <div class="card-list" id="weatherAlertsList"></div>
      </article>

      <article class="card full-card">
        <p class="card-title">PIO Signal</p>
        <div class="pio-signal" id="weatherPioSignal">
          <div class="row-icon">↻</div>
          <div>
            <div class="row-title">Checking forecast-driven post ideas</div>
            <div class="row-detail">Heat, severe weather, flooding, and safety messaging will appear here.</div>
          </div>
          <div class="row-tag">Weather</div>
        </div>
      </article>

    </section>
  `;
}

function renderPlaceholder(title, message) {
  return `
    <section class="app-screen">
      <article class="card full-card" style="height:100%; display:grid; place-items:center; text-align:center;">
        <div>
          <p class="card-title">${title}</p>
          <div class="card-big-number">Coming Soon</div>
          <p class="card-subtext">${message}</p>
        </div>
      </article>
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

document.querySelectorAll(".tab-btn").forEach(button => {
  button.addEventListener("click", () => {
    loadApp(button.dataset.app);
  });
});

setupActivityTracking();

updateClock();
setInterval(updateClock, 1000);

loadApp(getStartupApp());

startAutoRefresh();

loadApp("command");
