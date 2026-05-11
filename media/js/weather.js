window.MEMSWeather = {
  init() {
    loadWeather();
  }
};

const WEATHER_CONFIG = {
  label: "Little Rock / MEMS",
  latitude: 34.7465,
  longitude: -92.2896,
  alertsArea: "AR",
  hazardOutlookUrl: "https://www.weather.gov/erh/ghwo?wfo=lzk"
};

async function loadWeather() {
  try {
    setWeatherText("weatherStatusPill", `<span class="status-dot"></span> Weather Loading`, true);

    const pointData = await getJSON(
      `https://api.weather.gov/points/${WEATHER_CONFIG.latitude},${WEATHER_CONFIG.longitude}`
    );

    const forecastUrl = pointData.properties.forecast;
    const forecastData = await getJSON(forecastUrl);

    const alertsData = await getJSON(
      `https://api.weather.gov/alerts/active?area=${WEATHER_CONFIG.alertsArea}`
    );

    const periods = forecastData.properties.periods || [];
    const alerts = alertsData.features || [];

    renderWeather(periods, alerts);
  } catch (error) {
    console.error(error);
    setWeatherText("weatherStatusPill", `<span class="status-dot"></span> Weather Error`, true);
    setWeatherText("weatherHeroText", "Weather data could not be loaded. Check console and network access.");
  }
}

async function getJSON(url) {
  const response = await fetch(url, {
    headers: {
      "Accept": "application/geo+json"
    },
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`Weather request failed: ${url}`);
  }

  return response.json();
}

function renderWeather(periods, alerts) {
  const today = periods[0];
  const days = buildDailyForecast(periods);
  const activeAlerts = alerts.filter(alert => {
    const event = alert.properties?.event || "";
    return !event.toLowerCase().includes("test");
  });

  const high = getTodayHigh(periods);
  const low = getTodayLow(periods);

  setWeatherText("weatherStatusPill", `<span class="status-dot"></span> Forecast Loaded`, true);
  setWeatherText("weatherHeroTemp", today?.temperature ? `${today.temperature}°` : "Pending");
  setWeatherText(
    "weatherHeroText",
    today
      ? `${WEATHER_CONFIG.label}: ${today.shortForecast}. ${today.detailedForecast || ""}`
      : "Forecast unavailable."
  );

  setWeatherText("weatherTodayHigh", high ? `${high}°` : "Pending");
  setWeatherText("weatherTodayLow", low ? `${low}°` : "Pending");
  setWeatherText("weatherWind", today?.windSpeed || "Pending");

  setWeatherText("weatherAlertCount", activeAlerts.length);
  setWeatherText(
    "weatherAlertText",
    activeAlerts.length
      ? `${activeAlerts.length} active alert${activeAlerts.length === 1 ? "" : "s"} in Arkansas.`
      : "No active Arkansas alerts."
  );

  renderWeatherChart(days);
  renderWeatherDayGrid(days);
  renderAlerts(activeAlerts);
  renderHeatRisk(days);
  renderPioSignal(days, activeAlerts);
}

  renderForecastStrip(days);
  renderAlerts(activeAlerts);
  renderHeatRisk(days);
  renderPioSignal(days, activeAlerts);
}

function buildDailyForecast(periods) {
  const days = [];
  const seen = new Set();

  periods.forEach(period => {
    const date = new Date(period.startTime);
    const key = date.toDateString();

    if (!period.isDaytime) return;
    if (seen.has(key)) return;

    const night = periods.find(other => {
      const otherDate = new Date(other.startTime);
      return otherDate.toDateString() === key && other.isDaytime === false;
    });

    const precipDay = Number(period.probabilityOfPrecipitation?.value || 0);
    const precipNight = Number(night?.probabilityOfPrecipitation?.value || 0);

    days.push({
      name: date.toLocaleDateString([], { weekday: "short" }),
      fullName: period.name,
      date,
      high: Number(period.temperature || 0),
      low: Number(night?.temperature || period.temperature || 0),
      precip: Math.max(precipDay, precipNight),
      shortForecast: period.shortForecast,
      detailedForecast: period.detailedForecast,
      wind: period.windSpeed,
      icon: getWeatherSymbol(period.shortForecast)
    });

    seen.add(key);
  });

  return days.slice(0, 7);
}
function renderWeatherChart(days) {
  const container = document.getElementById("weatherWeeklyChart");
  if (!container || !days.length) return;

  const width = 1200;
  const height = 360;
  const padding = { top: 24, right: 28, bottom: 64, left: 42 };

  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  const highs = days.map(day => Number(day.high || 0));
  const lows = days.map(day => Number(day.low || 0));
  const precips = days.map(day => Number(day.precip || 0));

  const tempMin = Math.floor((Math.min(...lows) - 4) / 5) * 5;
  const tempMax = Math.ceil((Math.max(...highs) + 4) / 5) * 5;

  const xStep = days.length > 1 ? innerWidth / (days.length - 1) : innerWidth;

  const x = i => padding.left + (i * xStep);
  const yTemp = value => padding.top + ((tempMax - value) / Math.max(tempMax - tempMin, 1)) * innerHeight;
  const yPrecip = value => padding.top + ((100 - value) / 100) * innerHeight;

  const tempGridValues = [];
  for (let v = tempMax; v >= tempMin; v -= 10) {
    tempGridValues.push(v);
  }

  const highPoints = days.map((day, i) => ({ x: x(i), y: yTemp(day.high), value: day.high }));
  const lowPoints = days.map((day, i) => ({ x: x(i), y: yTemp(day.low), value: day.low }));

  const highPath = buildSmoothPath(highPoints);
  const lowPath = buildSmoothPath(lowPoints);

  const gridLines = tempGridValues.map(value => {
    const y = yTemp(value);
    return `
      <line class="weather-chart-grid-line" x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}"></line>
      <text class="weather-chart-grid-label" x="6" y="${y + 4}">${value}°</text>
    `;
  }).join("");

  const precipBars = days.map((day, i) => {
    const barWidth = 48;
    const barHeight = (Math.max(0, day.precip) / 100) * innerHeight;
    const barX = x(i) - (barWidth / 2);
    const barY = padding.top + innerHeight - barHeight;

    return `
      <rect
        class="weather-chart-precip-bar"
        x="${barX}"
        y="${barY}"
        width="${barWidth}"
        height="${barHeight}"
        rx="4"
      ></rect>
      <text class="weather-chart-precip-label" x="${x(i)}" y="${barY - 8}" text-anchor="middle">
        ${day.precip}%
      </text>
    `;
  }).join("");

  const dayLabels = days.map((day, i) => `
    <text class="weather-chart-day-label" x="${x(i)}" y="${height - 20}" text-anchor="middle">
      ${escapeHTML(day.name)}
    </text>
  `).join("");

  const highDots = highPoints.map(point => `
    <circle class="weather-chart-high-dot" cx="${point.x}" cy="${point.y}" r="5"></circle>
    <text class="weather-chart-temp-label-high" x="${point.x}" y="${point.y - 12}" text-anchor="middle">
      ${point.value}°
    </text>
  `).join("");

  const lowDots = lowPoints.map(point => `
    <circle class="weather-chart-low-dot" cx="${point.x}" cy="${point.y}" r="4"></circle>
    <text class="weather-chart-temp-label-low" x="${point.x}" y="${point.y + 18}" text-anchor="middle">
      ${point.value}°
    </text>
  `).join("");

  container.innerHTML = `
    <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="7 day weather chart">
      ${gridLines}
      ${precipBars}
      <path class="weather-chart-high-line" d="${highPath}"></path>
      <path class="weather-chart-low-line" d="${lowPath}"></path>
      ${highDots}
      ${lowDots}
      ${dayLabels}
    </svg>
  `;
}
function buildSmoothPath(points) {
  if (!points.length) return "";

  let d = `M ${points[0].x} ${points[0].y}`;

  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const midX = (prev.x + curr.x) / 2;

    d += ` Q ${midX} ${prev.y}, ${curr.x} ${curr.y}`;
  }

  return d;
}

function renderWeatherDayGrid(days) {
  const container = document.getElementById("weatherDayGrid");
  if (!container || !days.length) return;

  container.innerHTML = days.map(day => `
    <div class="weather-day-tile">
      <div class="weather-day-top">
        <div class="weather-day-name">${escapeHTML(day.name)}</div>
        <div class="weather-day-icon">${day.icon}</div>
      </div>

      <div class="weather-day-condition">${escapeHTML(day.shortForecast)}</div>

      <div class="weather-day-meta">
        High ${day.high}° · Low ${day.low}°<br>
        Precip ${day.precip}% · ${escapeHTML(day.wind || "")}
      </div>
    </div>
  `).join("");
}

function renderForecastStrip(days) {
  const container = document.getElementById("weatherForecastStrip");
  if (!container) return;

  container.innerHTML = days.map(day => `
    <div class="forecast-day">
      <div>
        <div class="forecast-day-name">${escapeHTML(day.name)}</div>
        <div class="forecast-icon">${day.icon}</div>
        <div class="forecast-short">${escapeHTML(day.shortForecast)}</div>
      </div>

      <div>
        <div class="forecast-temp">${day.high ?? "--"}°</div>
        <div class="row-detail">Low ${day.low ?? "--"}° · ${escapeHTML(day.wind || "")}</div>
      </div>
    </div>
  `).join("");
}

function renderAlerts(alerts) {
  const container = document.getElementById("weatherAlertsList");
  if (!container) return;

  if (!alerts.length) {
    container.innerHTML = `
      <div class="list-row">
        <div class="row-icon">✓</div>
        <div>
          <div class="row-title">No active Arkansas alerts</div>
          <div class="row-detail">No current warning, watch, or advisory found through the NWS alert feed.</div>
        </div>
        <div class="row-tag">Clear</div>
      </div>
    `;
    return;
  }

  container.innerHTML = alerts.slice(0, 5).map(alert => {
    const props = alert.properties || {};
    return `
      <div class="list-row weather-alert-row">
        <div class="row-icon">!</div>
        <div>
          <div class="row-title">${escapeHTML(props.event || "Weather Alert")}</div>
          <div class="row-detail">${escapeHTML(props.areaDesc || "Arkansas")}</div>
        </div>
        <div class="row-tag">${escapeHTML(props.severity || "Alert")}</div>
      </div>
    `;
  }).join("");
}

function renderHeatRisk(days) {
  const maxHigh = Math.max(...days.map(day => Number(day.high || 0)));
  const hotDays = days.filter(day => Number(day.high || 0) >= 95).length;

  const levelEl = document.getElementById("weatherHeatLevel");
  const textEl = document.getElementById("weatherHeatText");

  if (!levelEl || !textEl) return;

  if (maxHigh >= 100 || hotDays >= 3) {
    levelEl.textContent = "High";
    textEl.textContent = "Heat-related injury risk may increase. A safety post is probably warranted.";
  } else if (maxHigh >= 95) {
    levelEl.textContent = "Elevated";
    textEl.textContent = "Hot conditions are expected. Consider heat safety messaging.";
  } else if (maxHigh >= 90) {
    levelEl.textContent = "Watch";
    textEl.textContent = "Warm stretch ahead. Monitor for heat messaging needs.";
  } else {
    levelEl.textContent = "Low";
    textEl.textContent = "No strong heat signal in the 7-day forecast.";
  }
}

function renderPioSignal(days, alerts) {
  const container = document.getElementById("weatherPioSignal");
  if (!container) return;

  const maxHigh = Math.max(...days.map(day => Number(day.high || 0)));
  const severeAlert = alerts.find(alert => {
    const event = String(alert.properties?.event || "").toLowerCase();
    return event.includes("tornado") || event.includes("severe thunderstorm") || event.includes("flash flood");
  });

  if (severeAlert) {
    const eventName = severeAlert.properties?.event || "Severe Weather";
    container.className = "pio-signal severe";
    container.innerHTML = `
      <div class="row-icon"><i class="las la-exclamation-triangle"></i></div>
      <div>
        <div class="row-title">Weather post may be needed: ${escapeHTML(eventName)}</div>
        <div class="row-detail">Consider safety messaging, timing, affected areas, and reminder to have alerts enabled.</div>
      </div>
      <div class="row-tag">PIO</div>
    `;
    return;
  }

  if (maxHigh >= 95) {
    container.className = "pio-signal heat";
    container.innerHTML = `
      <div class="row-icon"><i class="las la-temperature-high"></i></div>
      <div>
        <div class="row-title">Heat safety post recommended</div>
        <div class="row-detail">Forecast highs suggest increased heat-related injury risk. Consider a post about hydration, checking on vulnerable neighbors, and calling 911 for heat emergency warning signs.</div>
      </div>
      <div class="row-tag">PIO</div>
    `;
    return;
  }

  container.className = "pio-signal";
  container.innerHTML = `
    <div class="row-icon"><i class="las la-check-circle"></i></div>
    <div>
      <div class="row-title">No immediate weather post signal</div>
      <div class="row-detail">No high heat or major severe-weather alert signal detected right now.</div>
    </div>
    <div class="row-tag">Monitor</div>
  `;
}

function getTodayHigh(periods) {
  const daytime = periods.find(period => period.isDaytime);
  return daytime?.temperature || null;
}

function getTodayLow(periods) {
  const firstDay = periods[0] ? new Date(periods[0].startTime).toDateString() : null;

  const tonight = periods.find(period => {
    const date = new Date(period.startTime).toDateString();
    return date === firstDay && period.isDaytime === false;
  });

  return tonight?.temperature || null;
}

function getWeatherSymbol(text) {
  const lower = String(text || "").toLowerCase();

  if (lower.includes("thunder") || lower.includes("storm")) {
    return `<i class="las la-bolt"></i>`;
  }

  if (lower.includes("rain") || lower.includes("showers")) {
    return `<i class="las la-cloud-rain"></i>`;
  }

  if (lower.includes("snow") || lower.includes("sleet") || lower.includes("ice")) {
    return `<i class="las la-snowflake"></i>`;
  }

  if (lower.includes("fog") || lower.includes("haze")) {
    return `<i class="las la-smog"></i>`;
  }

  if (lower.includes("cloud") && lower.includes("sun")) {
    return `<i class="las la-cloud-sun"></i>`;
  }

  if (lower.includes("cloud") || lower.includes("overcast")) {
    return `<i class="las la-cloud"></i>`;
  }

  if (lower.includes("sun") || lower.includes("clear")) {
    return `<i class="las la-sun"></i>`;
  }

  if (lower.includes("wind")) {
    return `<i class="las la-wind"></i>`;
  }

  return `<i class="las la-circle"></i>`;
}

function setWeatherText(id, value, html = false) {
  const element = document.getElementById(id);
  if (!element) return;

  if (html) {
    element.innerHTML = value;
  } else {
    element.textContent = value;
  }
}

function escapeHTML(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
