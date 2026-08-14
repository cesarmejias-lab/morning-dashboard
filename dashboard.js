// ── User Configuration ────────────────────────────────────────────────────────
const USER_NAME = 'Cesar';

// ── Cities Database ─────────────────────────────────────────────────────────
const CITIES_DB = [
  { name: 'Tres Cantos', country: 'Spain', tz: 'Europe/Madrid', lat: 40.5919, lon: -3.7221, flag: '🇪🇸' },
  { name: 'Madrid', country: 'Spain', tz: 'Europe/Madrid', lat: 40.4168, lon: -3.7038, flag: '🇪🇸' },
  { name: 'London', country: 'United Kingdom', tz: 'Europe/London', lat: 51.5074, lon: -0.1278, flag: '🇬🇧' },
  { name: 'Paris', country: 'France', tz: 'Europe/Paris', lat: 48.8566, lon: 2.3522, flag: '🇫🇷' },
  { name: 'Berlin', country: 'Germany', tz: 'Europe/Berlin', lat: 52.5200, lon: 13.4050, flag: '🇩🇪' },
  { name: 'New York', country: 'United States', tz: 'America/New_York', lat: 40.7128, lon: -74.0060, flag: '🇺🇸' },
  { name: 'San Francisco', country: 'United States', tz: 'America/Los_Angeles', lat: 37.7749, lon: -122.4194, flag: '🇺🇸' },
  { name: 'Tokyo', country: 'Japan', tz: 'Asia/Tokyo', lat: 35.6762, lon: 139.6503, flag: '🇯🇵' },
  { name: 'Singapore', country: 'Singapore', tz: 'Asia/Singapore', lat: 1.3521, lon: 103.8198, flag: '🇸🇬' },
  { name: 'Sydney', country: 'Australia', tz: 'Australia/Sydney', lat: -33.8688, lon: 151.2093, flag: '🇦🇺' },
  { name: 'Mumbai', country: 'India', tz: 'Asia/Kolkata', lat: 19.0760, lon: 72.8777, flag: '🇮🇳' },
  { name: 'Dubai', country: 'United Arab Emirates', tz: 'Asia/Dubai', lat: 25.2048, lon: 55.2708, flag: '🇦🇪' },
  { name: 'São Paulo', country: 'Brazil', tz: 'America/Sao_Paulo', lat: -23.5505, lon: -46.6333, flag: '🇧🇷' },
  { name: 'Cape Town', country: 'South Africa', tz: 'Africa/Johannesburg', lat: -33.9249, lon: 18.4241, flag: '🇿🇦' },
  { name: 'Mexico City', country: 'Mexico', tz: 'America/Mexico_City', lat: 19.4326, lon: -99.1332, flag: '🇲🇽' },
  { name: 'Reykjavik', country: 'Iceland', tz: 'Atlantic/Reykjavik', lat: 64.1466, lon: -21.9426, flag: '🇮🇸' },
  // South American Capitals
  { name: 'Buenos Aires', country: 'Argentina', tz: 'America/Argentina/Buenos_Aires', lat: -34.6037, lon: -58.3816, flag: '🇦🇷' },
  { name: 'La Paz', country: 'Bolivia', tz: 'America/La_Paz', lat: -16.4897, lon: -68.1193, flag: '🇧🇴' },
  { name: 'Sucre', country: 'Bolivia', tz: 'America/La_Paz', lat: -19.0196, lon: -65.2619, flag: '🇧🇴' },
  { name: 'Brasília', country: 'Brazil', tz: 'America/Sao_Paulo', lat: -15.8267, lon: -47.9218, flag: '🇧🇷' },
  { name: 'Santiago', country: 'Chile', tz: 'America/Santiago', lat: -33.4489, lon: -70.6693, flag: '🇨🇱' },
  { name: 'Bogotá', country: 'Colombia', tz: 'America/Bogota', lat: 4.7110, lon: -74.0721, flag: '🇨🇴' },
  { name: 'Quito', country: 'Ecuador', tz: 'America/Guayaquil', lat: -0.1807, lon: -78.4678, flag: '🇪🇨' },
  { name: 'Georgetown', country: 'Guyana', tz: 'America/Guyana', lat: 6.8013, lon: -58.1551, flag: '🇬🇾' },
  { name: 'Asunción', country: 'Paraguay', tz: 'America/Asuncion', lat: -25.2637, lon: -57.5759, flag: '🇵🇾' },
  { name: 'Lima', country: 'Peru', tz: 'America/Lima', lat: -12.0464, lon: -77.0428, flag: '🇵🇪' },
  { name: 'Paramaribo', country: 'Suriname', tz: 'America/Paramaribo', lat: 5.8520, lon: -55.6032, flag: '🇸🇷' },
  { name: 'Montevideo', country: 'Uruguay', tz: 'America/Montevideo', lat: -34.9011, lon: -56.1645, flag: '🇺🇾' },
  { name: 'Caracas', country: 'Venezuela', tz: 'America/Caracas', lat: 10.4806, lon: -66.9036, flag: '🇻🇪' },
  // Additional Global Capitals
  { name: 'Ottawa', country: 'Canada', tz: 'America/Toronto', lat: 45.4215, lon: -75.6972, flag: '🇨🇦' },
  { name: 'Washington, D.C.', country: 'United States', tz: 'America/New_York', lat: 38.9072, lon: -77.0369, flag: '🇺🇸' },
  { name: 'Beijing', country: 'China', tz: 'Asia/Shanghai', lat: 39.9042, lon: 116.4074, flag: '🇨🇳' },
  { name: 'Moscow', country: 'Russia', tz: 'Europe/Moscow', lat: 55.7558, lon: 37.6173, flag: '🇷🇺' },
  { name: 'Nairobi', country: 'Kenya', tz: 'Africa/Nairobi', lat: -1.2921, lon: 36.8219, flag: '🇰🇪' },
  { name: 'Riyadh', country: 'Saudi Arabia', tz: 'Asia/Riyadh', lat: 24.7136, lon: 46.6753, flag: '🇸🇦' },
  { name: 'Seoul', country: 'South Korea', tz: 'Asia/Seoul', lat: 37.5665, lon: 126.9780, flag: '🇰🇷' },
  { name: 'Bangkok', country: 'Thailand', tz: 'Asia/Bangkok', lat: 13.7563, lon: 100.5018, flag: '🇹🇭' },
  { name: 'Cairo', country: 'Egypt', tz: 'Africa/Cairo', lat: 30.0444, lon: 31.2357, flag: '🇪🇬' },
  { name: 'Jakarta', country: 'Indonesia', tz: 'Asia/Jakarta', lat: -6.2088, lon: 106.8456, flag: '🇮🇩' },
  { name: 'Abuja', country: 'Nigeria', tz: 'Africa/Lagos', lat: 9.0765, lon: 7.3986, flag: '🇳🇬' }
];

const DEFAULT_CLOCKS = [
  { name: 'London',    tz: 'Europe/London',    flag: '🇬🇧' },
  { name: 'New York',  tz: 'America/New_York', flag: '🇺🇸' },
  { name: 'Singapore', tz: 'Asia/Singapore',   flag: '🇸🇬' },
  { name: 'Sydney',    tz: 'Australia/Sydney', flag: '🇦🇺' }
];

const DEFAULT_WEATHER = [
  { name: 'Tres Cantos', country: 'Spain', tz: 'Europe/Madrid', lat: 40.5919, lon: -3.7221, flag: '🇪🇸' },
  { name: 'New York', country: 'United States', tz: 'America/New_York', lat: 40.7128, lon: -74.0060, flag: '🇺🇸' }
];

// ── Config & State ──────────────────────────────────────────────────────────
const REFRESH_MS  = 10 * 60 * 1000;
const GITHUB_OWNER = 'cesarmejias-lab';
const GITHUB_REPO = 'morning-dashboard';
const GITHUB_WORKFLOW_FILE = 'clz-sync.yml';
const GITHUB_ACTIONS_URL = `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/actions/workflows/${GITHUB_WORKFLOW_FILE}`;
const STORAGE = {
  accent: 'morning_dashboard_accent_color',
  clocks: 'morning_dashboard_clocks',
  weather: 'morning_dashboard_weather',
  clzRadarHistory: 'morning_dashboard_clz_radar_history',
  todoistToken: 'morning_dashboard_todoist_token',
};

function byId(id) {
  return document.getElementById(id);
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }[char]));
}

function safeUrl(value, fallback = '#') {
  try {
    const url = new URL(String(value ?? ''), window.location.href);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : fallback;
  } catch {
    return fallback;
  }
}

function setCardMessage(id, title, message, cls = 'err') {
  const card = byId(id);
  if (!card) return;
  card.innerHTML = `<div class="card-title">${escapeHtml(title)}</div><div class="${cls}">${escapeHtml(message)}</div>`;
}

function readStoredJson(key, fallback, validator) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return validator(parsed) ? parsed : fallback;
  } catch {
    localStorage.removeItem(key);
    return fallback;
  }
}

function cityByName(name) {
  return CITIES_DB.find(city => city.name === name);
}

function isClockList(value) {
  return Array.isArray(value)
    && value.length >= 1
    && value.length <= 6
    && value.every(city => city && cityByName(city.name));
}

function isWeatherList(value) {
  return Array.isArray(value)
    && value.length === 2
    && value.every(city => city && cityByName(city.name));
}

function normalizeClock(city) {
  const source = cityByName(city.name);
  return { name: source.name, tz: source.tz, flag: source.flag };
}

function normalizeWeather(city) {
  return cityByName(city.name);
}

let pinnedClocks = readStoredJson(STORAGE.clocks, DEFAULT_CLOCKS, isClockList).map(normalizeClock);
let weatherCities = readStoredJson(STORAGE.weather, DEFAULT_WEATHER, isWeatherList).map(normalizeWeather);
let activeWeatherCityName = weatherCities[0]?.name || 'Tres Cantos';
let weatherDataCache = {};

// ── WMO weather codes ────────────────────────────────────────────────────────
function weatherInfo(code) {
  const map = {
    0:  ['☀️',  'Clear sky'],
    1:  ['🌤️', 'Mainly clear'],
    2:  ['⛅',  'Partly cloudy'],
    3:  ['☁️',  'Overcast'],
    45: ['🌫️', 'Fog'],
    48: ['🌫️', 'Icy fog'],
    51: ['🌦️', 'Light drizzle'],
    53: ['🌦️', 'Drizzle'],
    55: ['🌧️', 'Heavy drizzle'],
    61: ['🌧️', 'Light rain'],
    63: ['🌧️', 'Rain'],
    65: ['🌧️', 'Heavy rain'],
    71: ['🌨️', 'Light snow'],
    73: ['🌨️', 'Snow'],
    75: ['❄️',  'Heavy snow'],
    80: ['🌦️', 'Light showers'],
    81: ['🌧️', 'Showers'],
    82: ['⛈️',  'Heavy showers'],
    85: ['🌨️', 'Snow showers'],
    86: ['❄️',  'Heavy snow showers'],
    95: ['⛈️',  'Thunderstorm'],
    96: ['⛈️',  'Thunderstorm + hail'],
    99: ['⛈️',  'Thunderstorm + heavy hail'],
  };
  return map[code] ?? ['🌡️', 'Unknown'];
}

// ── Weather ──────────────────────────────────────────────────────────────────
async function fetchWeather() {
  weatherDataCache = {};
  const promises = weatherCities.map(async city => {
    const url = `https://api.open-meteo.com/v1/forecast`
      + `?latitude=${city.lat}&longitude=${city.lon}`
      + `&current=temperature_2m,apparent_temperature,weathercode,windspeed_10m,relativehumidity_2m`
      + `&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max`
      + `,sunrise,sunset,apparent_temperature_max,apparent_temperature_min`
      + `&hourly=precipitation_probability`
      + `&timezone=${encodeURIComponent(city.tz)}&forecast_days=5`;
    try {
      const r = await fetch(url);
      if (!r.ok) throw new Error(`Weather API error for ${city.name}`);
      const data = await r.json();
      weatherDataCache[city.name] = data;
    } catch (e) {
      console.error(`Failed to fetch weather for ${city.name}:`, e);
      weatherDataCache[city.name] = { error: true, message: e.message };
    }
  });
  await Promise.all(promises);
}

function weatherVerdictHtml(data) {
  const api = typeof WeatherVerdict === 'undefined' ? null : WeatherVerdict;
  if (!api) return '';

  // A malformed payload must never stop the current conditions from rendering.
  let parts;
  try {
    parts = api.formatVerdict(api.buildVerdict({ data }));
  } catch (e) {
    console.error('Weather verdict failed:', e);
    return '';
  }

  const detail = parts.details.length
    ? `<span class="w-verdict-detail">${escapeHtml(parts.details.join(' · '))}</span>`
    : '';

  return `<div class="w-verdict">
    <span class="w-verdict-headline">${escapeHtml(parts.headline)}</span>
    ${detail}
  </div>`;
}

function renderWeather() {
  const tabsContainer = byId('weather-tabs');
  const bodyContainer = byId('weather-body');
  if (!tabsContainer || !bodyContainer) return;

  // Render Tabs
  tabsContainer.innerHTML = weatherCities.map(city => {
    const activeClass = city.name === activeWeatherCityName ? 'active' : '';
    return `<button type="button" class="weather-tab-btn ${activeClass}" data-action="switch-weather" data-city="${escapeHtml(city.name)}">${escapeHtml(city.flag)} ${escapeHtml(city.name)}</button>`;
  }).join('');

  // Find active city and data
  const activeCity = weatherCities.find(c => c.name === activeWeatherCityName) || weatherCities[0];
  if (!activeCity) {
    bodyContainer.innerHTML = '<div class="err">No weather cities configured.</div>';
    return;
  }

  const data = weatherDataCache[activeCity.name];
  if (!data) {
    bodyContainer.innerHTML = '<div class="placeholder">Loading weather...</div>';
    return;
  }

  if (data.error) {
    bodyContainer.innerHTML = `<div class="err">Failed to load weather for ${escapeHtml(activeCity.name)}.</div>`;
    return;
  }

  const c = data.current;
  const d = data.daily;
  const [icon, desc] = weatherInfo(c.weathercode);
  const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Global scale for sparklines
  const absoluteMax = Math.max(...d.temperature_2m_max);
  const absoluteMin = Math.min(...d.temperature_2m_min);
  const tempRange = absoluteMax - absoluteMin || 1;

  const forecastHTML = d.time.map((dateStr, i) => {
    const label = i === 0 ? 'Today' : DAY_NAMES[new Date(dateStr + 'T12:00:00').getDay()];
    const [fi]  = weatherInfo(d.weathercode[i]);
    const maxVal = d.temperature_2m_max[i];
    const minVal = d.temperature_2m_min[i];

    // Sparkline visual scaling calculations
    const heightPercent = Math.max(15, ((maxVal - minVal) / tempRange) * 100);
    const bottomPercent = ((minVal - absoluteMin) / tempRange) * 100;
    const barStyle = `height: ${heightPercent}%; transform: translateY(-${bottomPercent}%); background: linear-gradient(to top, var(--accent), var(--yellow));`;

    return `<div class="fc-day">
      <div class="fc-label">${escapeHtml(label)}</div>
      <div class="fc-icon">${escapeHtml(fi)}</div>
      <div class="fc-hi">${Math.round(maxVal)}°</div>
      <div class="fc-temp-bar-wrapper">
        <div class="fc-temp-bar" style="${barStyle}"></div>
      </div>
      <div class="fc-lo">${Math.round(minVal)}°</div>
    </div>`;
  }).join('');

  bodyContainer.innerHTML = `
    <div class="weather-fade-wrapper">
      ${weatherVerdictHtml(data)}
      <div class="w-current">
        <div class="w-icon">${escapeHtml(icon)}</div>
        <div>
          <div class="w-temp">${Math.round(c.temperature_2m)}°C</div>
          <div class="w-desc">${escapeHtml(desc)} &mdash; feels like ${Math.round(c.apparent_temperature)}°C</div>
        </div>
      </div>
      <div class="w-stats">
        <span>💧 Humidity ${c.relativehumidity_2m}%</span>
        <span>💨 Wind ${Math.round(c.windspeed_10m)} km/h</span>
      </div>
      <div class="forecast">${forecastHTML}</div>
    </div>`;
}

function switchWeatherTab(cityName) {
  activeWeatherCityName = cityName;
  renderWeather();
}

// ── Hacker News ──────────────────────────────────────────────────────────────
async function fetchHN() {
  const ids = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json')
    .then(r => r.json());
  return Promise.all(
    ids.slice(0, 10).map(id =>
      fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).then(r => r.json())
    )
  );
}

function getDomain(url) {
  if (!url) return 'news.ycombinator.com';
  try { return new URL(url).hostname.replace(/^www\./, ''); }
  catch { return 'news.ycombinator.com'; }
}

function timeAgo(unix) {
  const s = Math.floor(Date.now() / 1000) - unix;
  if (s < 60)   return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

function renderHN(stories) {
  const items = stories.map((s, i) => {
    const href   = safeUrl(s.url || `https://news.ycombinator.com/item?id=${s.id}`);
    const domain = getDomain(href);
    const ago    = s.time ? timeAgo(s.time) : '';
    return `<li class="hn-item">
      <span class="hn-n">${i + 1}</span>
      <div>
        <div class="hn-title"><a href="${href}" target="_blank" rel="noopener">${escapeHtml(s.title)}</a></div>
        <div class="hn-meta">&#9650; ${Number(s.score) || 0} &nbsp;&middot;&nbsp; ${escapeHtml(domain)} &nbsp;&middot;&nbsp; ${Number(s.descendants) || 0} comments &nbsp;&middot;&nbsp; ${escapeHtml(ago)}</div>
      </div>
    </li>`;
  }).join('');

  byId('hn-card').innerHTML = `
    <div class="card-title">Top Hacker News Stories</div>
    <ul class="hn-list">${items}</ul>`;
}


// ── World clocks ─────────────────────────────────────────────────────────────
function clockStatus(tz) {
  const h = +new Intl.DateTimeFormat('en', {
    hour: 'numeric', hour12: false, timeZone: tz
  }).format(new Date());
  if (h >= 9  && h < 18) return { dot: 'dot-on',   cls: 'status-on',   label: 'Working' };
  if (h >= 7  && h < 9)  return { dot: 'dot-warn',  cls: 'status-warn', label: 'Off hours' };
  if (h >= 18 && h < 22) return { dot: 'dot-warn',  cls: 'status-warn', label: 'Off hours' };
  return                         { dot: 'dot-off',   cls: 'status-off',  label: 'Sleeping' };
}

// ── World clocks ─────────────────────────────────────────────────────────────
function updateClocks() {
  const now  = new Date();
  const grid = byId('clocks-grid');
  if (!grid) return;

  grid.innerHTML = pinnedClocks.map(city => {
    const time   = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: city.tz });
    const date   = now.toLocaleDateString('en-GB', { weekday: 'short', month: 'short', day: 'numeric', timeZone: city.tz });
    const status = clockStatus(city.tz);

    return `<div class="clock-item">
      <div class="clock-city">
        <span class="dot ${status.dot}"></span>
        ${escapeHtml(city.flag)} ${escapeHtml(city.name)}
      </div>
      <div class="clock-time">${escapeHtml(time)}</div>
      <div class="clock-date">${escapeHtml(date)}</div>
      <div class="clock-status ${status.cls}">${status.label}</div>
    </div>`;
  }).join('');
}

// ── Helper & Accent Theme Functions ───────────────────────────────────────────
function filterSettingsCities(inputElement, type) {
  const query = inputElement.value.toLowerCase().trim();
  const containerId = type === 'clocks' ? 'clocks-cities-list' : 'weather-cities-list';
  const container = document.getElementById(containerId);
  if (!container) return;
  
  const labels = container.querySelectorAll('.city-checkbox-label');
  labels.forEach(label => {
    const text = label.textContent.toLowerCase();
    if (text.includes(query)) {
      label.style.display = 'flex';
    } else {
      label.style.display = 'none';
    }
  });
}

function setAccent(color) {
  document.documentElement.style.setProperty('--accent', color);
  localStorage.setItem(STORAGE.accent, color);
  
  // Highlight active dot
  const dots = document.querySelectorAll('.theme-dot');
  dots.forEach(dot => {
    if (dot.dataset.accent === color) {
      dot.classList.add('active');
    } else {
      dot.classList.remove('active');
    }
  });
}

function loadAccentColor() {
  const saved = localStorage.getItem(STORAGE.accent);
  if (saved) {
    setAccent(saved);
  }
}

async function rollCLZAlbum() {
  const wrapper = document.getElementById('clz-roll-wrapper');
  if (wrapper) wrapper.classList.add('rolling');
  
  await new Promise(r => setTimeout(r, 300));
  
  try {
    const rec = await fetchCLZRecord();
    renderCLZRecord(rec);
    const newWrapper = document.getElementById('clz-roll-wrapper');
    if (newWrapper) {
      newWrapper.classList.add('rolling');
      newWrapper.offsetHeight;
      newWrapper.classList.remove('rolling');
    }
  } catch (e) {
    console.error(e);
  }
}

async function rollDiscogsAlbum() {
  const wrapper = document.getElementById('discogs-roll-wrapper');
  if (wrapper) wrapper.classList.add('rolling');
  
  await new Promise(r => setTimeout(r, 300));
  
  try {
    const rec = await fetchDiscogsRecord();
    renderDiscogsRecord(rec);
    const newWrapper = document.getElementById('discogs-roll-wrapper');
    if (newWrapper) {
      newWrapper.classList.add('rolling');
      newWrapper.offsetHeight;
      newWrapper.classList.remove('rolling');
    }
  } catch (e) {
    console.error(e);
  }
}

// ── Settings Drawers Logic ────────────────────────────────────────────────────
function toggleClocksDrawer() {
  const drawer = byId('clocks-settings-drawer');
  if (!drawer) return;
  
  if (drawer.hidden) {
    const listContainer = byId('clocks-cities-list');
    listContainer.innerHTML = CITIES_DB.map(city => {
      const isChecked = pinnedClocks.some(pc => pc.name === city.name) ? 'checked' : '';
      return `<label class="city-checkbox-label">
        <input type="checkbox" value="${escapeHtml(city.name)}" ${isChecked} data-settings-type="clocks">
        <span class="custom-chk"></span>
        <span>${escapeHtml(city.flag)} ${escapeHtml(city.name)}</span>
      </label>`;
    }).join('');
    
    // Clear search input on open
    const searchInput = drawer.querySelector('.settings-search-input');
    if (searchInput) searchInput.value = '';
    
    drawer.hidden = false;
    document.querySelector('[data-action="toggle-clocks"]')?.setAttribute('aria-expanded', 'true');
    onClockCheckboxChange();
  } else {
    drawer.hidden = true;
    document.querySelector('[data-action="toggle-clocks"]')?.setAttribute('aria-expanded', 'false');
  }
}

function onClockCheckboxChange() {
  const container = byId('clocks-cities-list');
  const checkedBoxes = container.querySelectorAll('input[type="checkbox"]:checked');
  const count = checkedBoxes.length;
  
  byId('clocks-limit-info').textContent = `Selected: ${count}/6`;
  
  const allLabels = container.querySelectorAll('.city-checkbox-label');
  allLabels.forEach(label => {
    const input = label.querySelector('input');
    if (count >= 6 && !input.checked) {
      label.classList.add('disabled');
      input.disabled = true;
    } else {
      label.classList.remove('disabled');
      input.disabled = false;
    }
  });
}

function saveClocksSettings() {
  const container = byId('clocks-cities-list');
  const checkedBoxes = container.querySelectorAll('input[type="checkbox"]:checked');
  
  if (checkedBoxes.length === 0) {
    alert('Please select at least 1 city clock.');
    return;
  }
  
  const newPinned = [];
  checkedBoxes.forEach(cb => {
    const city = CITIES_DB.find(c => c.name === cb.value);
    if (city) newPinned.push({ name: city.name, tz: city.tz, flag: city.flag });
  });
  
  pinnedClocks = newPinned;
  localStorage.setItem(STORAGE.clocks, JSON.stringify(pinnedClocks));
  updateClocks();
  toggleClocksDrawer();
}

function toggleWeatherDrawer() {
  const drawer = byId('weather-settings-drawer');
  if (!drawer) return;
  
  if (drawer.hidden) {
    const listContainer = byId('weather-cities-list');
    listContainer.innerHTML = CITIES_DB.map(city => {
      const isChecked = weatherCities.some(wc => wc.name === city.name) ? 'checked' : '';
      return `<label class="city-checkbox-label">
        <input type="checkbox" value="${escapeHtml(city.name)}" ${isChecked} data-settings-type="weather">
        <span class="custom-chk"></span>
        <span>${escapeHtml(city.flag)} ${escapeHtml(city.name)}</span>
      </label>`;
    }).join('');
    
    // Clear search input on open
    const searchInput = drawer.querySelector('.settings-search-input');
    if (searchInput) searchInput.value = '';
    
    drawer.hidden = false;
    document.querySelector('[data-action="toggle-weather"]')?.setAttribute('aria-expanded', 'true');
    onWeatherCheckboxChange();
  } else {
    drawer.hidden = true;
    document.querySelector('[data-action="toggle-weather"]')?.setAttribute('aria-expanded', 'false');
  }
}

function onWeatherCheckboxChange() {
  const container = byId('weather-cities-list');
  const checkedBoxes = container.querySelectorAll('input[type="checkbox"]:checked');
  const count = checkedBoxes.length;
  
  byId('weather-limit-info').textContent = `Selected: ${count}/2`;
  
  const allLabels = container.querySelectorAll('.city-checkbox-label');
  allLabels.forEach(label => {
    const input = label.querySelector('input');
    if (count >= 2 && !input.checked) {
      label.classList.add('disabled');
      input.disabled = true;
    } else {
      label.classList.remove('disabled');
      input.disabled = false;
    }
  });
}

async function saveWeatherSettings() {
  const container = byId('weather-cities-list');
  const checkedBoxes = container.querySelectorAll('input[type="checkbox"]:checked');
  
  if (checkedBoxes.length !== 2) {
    alert('Please select exactly 2 weather cities.');
    return;
  }
  
  const newWeather = [];
  checkedBoxes.forEach(cb => {
    const city = CITIES_DB.find(c => c.name === cb.value);
    if (city) newWeather.push(city);
  });
  
  weatherCities = newWeather;
  localStorage.setItem(STORAGE.weather, JSON.stringify(weatherCities));
  
  if (!weatherCities.some(c => c.name === activeWeatherCityName)) {
    activeWeatherCityName = weatherCities[0].name;
  }
  
  toggleWeatherDrawer();
  
  byId('weather-body').innerHTML = '<div class="placeholder">Fetching weather for selected cities&hellip;</div>';
  
  try {
    await fetchWeather();
    renderWeather();
  } catch (err) {
    console.error(err);
    byId('weather-body').innerHTML = '<div class="err">Failed to fetch new weather settings.</div>';
  }
}

// ── Inspirational quotes ──────────────────────────────────────────────────────
const QUOTES = [
  { text: 'The only way to do great work is to love what you do.',                              author: 'Steve Jobs' },
  { text: 'In the middle of every difficulty lies opportunity.',                                author: 'Albert Einstein' },
  { text: 'It does not matter how slowly you go as long as you do not stop.',                  author: 'Confucius' },
  { text: 'Everything you\'ve ever wanted is on the other side of fear.',                       author: 'George Addair' },
  { text: 'Success is not final, failure is not fatal: it is the courage to continue that counts.', author: 'Winston Churchill' },
  { text: 'Believe you can and you\'re halfway there.',                                         author: 'Theodore Roosevelt' },
  { text: 'The future belongs to those who believe in the beauty of their dreams.',            author: 'Eleanor Roosevelt' },
  { text: 'Don\'t watch the clock; do what it does. Keep going.',                               author: 'Sam Levenson' },
  { text: 'Act as if what you do makes a difference. It does.',                                author: 'William James' },
  { text: 'It always seems impossible until it\'s done.',                                       author: 'Nelson Mandela' },
  { text: 'Start where you are. Use what you have. Do what you can.',                         author: 'Arthur Ashe' },
  { text: 'The only limit to our realization of tomorrow will be our doubts of today.',        author: 'Franklin D. Roosevelt' },
  { text: 'What lies behind us and what lies before us are tiny matters compared to what lies within us.', author: 'Ralph Waldo Emerson' },
  { text: 'You miss 100% of the shots you don\'t take.',                                        author: 'Wayne Gretzky' },
  { text: 'Life is what happens when you\'re busy making other plans.',                         author: 'John Lennon' },
  { text: 'The best time to plant a tree was 20 years ago. The second best time is now.',     author: 'Chinese Proverb' },
  { text: 'An unexamined life is not worth living.',                                           author: 'Socrates' },
  { text: 'Simplicity is the ultimate sophistication.',                                        author: 'Leonardo da Vinci' },
];

function renderQuote() {
  const q = QUOTES[Math.floor(Math.random() * QUOTES.length)];
  byId('quote-card').innerHTML = `
    <div class="card-title">Inspiration</div>
    <div class="quote-text">&ldquo;${escapeHtml(q.text)}&rdquo;</div>
    <div class="quote-author">&mdash; ${escapeHtml(q.author)}</div>`;
}

// ── CLZ Music Recommendation ──────────────────────────────────────────────────
const CLZ_URL = 'https://cloud.clz.com/cesarmejias/music';

async function fetchCLZCollection(cacheBust = false) {
  if (!cacheBust && window.CLZ_MUSIC_COLLECTION && window.CLZ_MUSIC_COLLECTION.albums && window.CLZ_MUSIC_COLLECTION.albums.length > 0) {
    return window.CLZ_MUSIC_COLLECTION;
  }

  try {
    const suffix = cacheBust ? `?t=${Date.now()}` : '';
    const response = await fetch(`./music-collection.json${suffix}`, { cache: 'no-store' });
    if (response.ok) {
      const data = await response.json();
      if (data && data.albums && data.albums.length > 0) {
        const collection = getCLZRadarApi().normalizeCollection(data);
        window.CLZ_MUSIC_COLLECTION = collection;
        return collection;
      }
    }
  } catch (e) {
    // Ignore fetch error
  }

  throw Object.assign(new Error('NOT_CONFIGURED'), {});
}

function getCLZRadarApi() {
  if (!window.CLZRadar) {
    throw new Error('Daily Collection Radar module did not load.');
  }
  return window.CLZRadar;
}

function readCLZRadarHistory() {
  return getCLZRadarApi().readHistory(localStorage, STORAGE.clzRadarHistory);
}

function writeCLZRadarHistory(history) {
  getCLZRadarApi().writeHistory(localStorage, STORAGE.clzRadarHistory, history);
}

function pickCLZRecord(data) {
  const radar = getCLZRadarApi();
  const collection = radar.normalizeCollection(data);
  const history = readCLZRadarHistory();
  const rec = radar.selectDailyRadar(collection, { history, now: new Date() });
  writeCLZRadarHistory(radar.recordHistoryEntry(history, rec, new Date()));
  return rec;
}

async function fetchCLZRecord(options = {}) {
  return pickCLZRecord(await fetchCLZCollection(Boolean(options.cacheBust)));
}

function recordCoverPlaceholder() {
  return '<div class="record-cover-placeholder">&#127908;</div>';
}

function recordCoverHtml(cover, title) {
  const url = safeUrl(cover, '');
  return url
    ? `<img class="record-cover" src="${escapeHtml(url)}" alt="${escapeHtml(title)} cover" data-record-cover>`
    : recordCoverPlaceholder();
}

function recordBgHtml(cover) {
  const url = safeUrl(cover, '');
  return url
    ? `<div class="record-bg" style="background-image:url('${escapeHtml(url)}')"></div>`
    : '';
}

function renderCLZRecord(rec, syncMessage = '') {
  const detailUrl = safeUrl(`${CLZ_URL}/detail/${encodeURIComponent(rec.id)}`);
  const coverHTML = recordCoverHtml(rec.cover, rec.title);
  const tags = [
    rec.year,
    rec.format,
    rec.edition,
    ...(rec.genres || []).slice(0, 2),
    ...(rec.styles || []).slice(0, 1),
  ].filter(Boolean)
    .map(t => `<span class="record-tag">${escapeHtml(t)}</span>`).join('');
  const signals = Array.isArray(rec.signals) ? rec.signals : [];
  const signalHtml = signals.map(signal => `
    <div class="radar-signal">
      <span class="radar-signal-label">${escapeHtml(signal.label)}</span>
      <span class="radar-signal-value">${escapeHtml(signal.value)}</span>
    </div>`).join('');

  const spotifySearchUrl = `https://open.spotify.com/search/${encodeURIComponent(rec.artist + ' ' + rec.title)}`;
  const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(rec.artist + ' ' + rec.title + ' album')}`;

  byId('clz-card').innerHTML = `
    ${recordBgHtml(rec.cover)}
    <div class="card-header">
      <span class="card-title tight">
        <span>&#9679; Daily Collection Radar &mdash; ${rec.total.toLocaleString()} releases</span>
        ${rec.syncedAt ? `<span class="sync-status">Last synced: ${escapeHtml(new Date(rec.syncedAt).toLocaleString())}</span>` : ''}
      </span>
      <div class="record-header-actions">
        <button type="button" class="record-action-btn" data-action="refresh-clz" title="Sync CLZ collection now">Sync CLZ</button>
      </div>
    </div>
    <div class="record-body record-roll-wrapper" id="clz-roll-wrapper">
      ${coverHTML}
      <div class="record-info">
        <div class="record-title">${escapeHtml(rec.title)}</div>
        <div class="record-artist">${escapeHtml(rec.artist)}</div>
        ${tags ? `<div class="record-tags">${tags}</div>` : ''}
        ${rec.reason ? `<div class="record-reason">${escapeHtml(rec.reason)}</div>` : ''}
        ${signalHtml ? `<div class="radar-signals">${signalHtml}</div>` : ''}
        <div class="record-actions">
          <button type="button" class="record-link" data-action="roll-clz">Roll</button>
          <a class="record-link secondary spotify-link" href="${safeUrl(spotifySearchUrl)}" target="_blank" rel="noopener">Spotify</a>
          <a class="record-link secondary youtube-link" href="${safeUrl(youtubeSearchUrl)}" target="_blank" rel="noopener">YouTube</a>
          <a class="record-link secondary" href="${detailUrl}" target="_blank" rel="noopener">View on CLZ &#8599;</a>
          <a class="record-link secondary" href="${CLZ_URL}" target="_blank" rel="noopener">My CLZ Collection &#8599;</a>
          <a class="record-link secondary" href="${GITHUB_ACTIONS_URL}" target="_blank" rel="noopener">Actions &#8599;</a>
        </div>
        <div class="sync-status" id="clz-sync-status">${escapeHtml(syncMessage)}</div>
      </div>
    </div>`;
}

function renderCLZSetup() {
  byId('clz-card').innerHTML = `
    <div class="card-title">Daily Collection Radar &mdash; Setup needed</div>
    <div class="record-body">
      <div class="record-cover-placeholder">&#127908;</div>
      <div class="record-info">
        <div class="record-title">Sync your CLZ Music collection</div>
        <div class="record-artist">Sync CLZ opens the GitHub Actions workflow in local and on GitHub Pages.</div>
        <div class="record-tags">
          <span class="record-tag">1&nbsp; Press Sync CLZ</span>
          <span class="record-tag">2&nbsp; Click Run workflow in GitHub</span>
          <span class="record-tag">3&nbsp; Refresh after Actions commits</span>
        </div>
        <div class="record-actions">
          <button type="button" class="record-link" data-action="refresh-clz">Sync CLZ</button>
          <button type="button" class="record-link secondary" data-action="reload">Reload Dashboard</button>
          <a class="record-link secondary" href="${GITHUB_ACTIONS_URL}" target="_blank" rel="noopener">Actions &#8599;</a>
          <a class="record-link secondary" href="${CLZ_URL}" target="_blank" rel="noopener">Go to CLZ Music &#8599;</a>
        </div>
        <div class="sync-status" id="clz-sync-status"></div>
      </div>
    </div>`;
}

function setCLZSyncStatus(message, kind = '') {
  const status = byId('clz-sync-status');
  if (!status) return;
  status.textContent = message;
  status.className = `sync-status ${kind}`.trim();
}

function refreshCLZCollection() {
  window.open(GITHUB_ACTIONS_URL, '_blank', 'noopener');
  setCLZSyncStatus('Opened GitHub Actions. Click Run workflow there, then refresh this dashboard after it finishes.', 'ok');
}

// ── Discogs Daily Record ──────────────────────────────────────────────────────
const DISCOGS_USER = 'cesar.mejias';

async function fetchDiscogsRecord() {
  if (!DISCOGS_USER) throw Object.assign(new Error('NOT_CONFIGURED'), {});

  const base    = `https://api.discogs.com/users/${DISCOGS_USER}/collection/folders/0/releases`;
  const headers = { 'User-Agent': 'MorningDashboard/1.0 +https://github.com' };

  // Step 1 — get total count
  const first = await fetch(`${base}?page=1&per_page=1`, { headers });
  if (first.status === 404) throw new Error(`Discogs user "${DISCOGS_USER}" not found`);
  if (!first.ok)            throw new Error(`Discogs API error: HTTP ${first.status}`);
  const meta        = await first.json();
  const totalItems  = meta.pagination.items;

  if (totalItems === 0) throw new Error('Discogs collection is empty or private');

  // Step 2 — fetch a random page (100 per page)
  const totalPages100 = Math.ceil(totalItems / 100);
  const targetPage    = Math.floor(Math.random() * totalPages100) + 1;
  const pageData      = await fetch(`${base}?page=${targetPage}&per_page=100&sort=added&sort_order=asc`, { headers });
  if (!pageData.ok) throw new Error(`Discogs page fetch failed: HTTP ${pageData.status}`);
  const { releases } = await pageData.json();

  const item = releases[Math.floor(Math.random() * releases.length)];
  const info = item.basic_information;

  return {
    title:      info.title,
    artist:     info.artists.map(a => a.name.replace(/\s*\(\d+\)$/, '')).join(', '),
    year:       info.year > 0 ? String(info.year) : null,
    format:     info.formats?.[0]?.name || null,
    label:      info.labels?.[0]?.name || null,
    cover:      info.cover_image || info.thumb || null,
    discogsUrl: `https://www.discogs.com/release/${item.id}`,
    total:      totalItems,
  };
}

function renderDiscogsRecord(rec) {
  const coverHTML = recordCoverHtml(rec.cover, rec.title);
  const tags = [rec.year, rec.format, rec.label].filter(Boolean)
    .map(t => `<span class="record-tag">${escapeHtml(t)}</span>`).join('');

  const spotifySearchUrl = `https://open.spotify.com/search/${encodeURIComponent(rec.artist + ' ' + rec.title)}`;
  const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(rec.artist + ' ' + rec.title + ' album')}`;

  byId('discogs-card').innerHTML = `
    ${recordBgHtml(rec.cover)}
    <div class="card-header">
      <span class="card-title tight">&#9679; Now Spinning (Discogs) &mdash; ${rec.total.toLocaleString()} releases</span>
    </div>
    <div class="record-body record-roll-wrapper" id="discogs-roll-wrapper">
      ${coverHTML}
      <div class="record-info">
        <div class="record-title">${escapeHtml(rec.title)}</div>
        <div class="record-artist">${escapeHtml(rec.artist)}</div>
        ${tags ? `<div class="record-tags">${tags}</div>` : ''}
        <div class="record-actions">
          <button type="button" class="record-link" data-action="roll-discogs">Roll</button>
          <a class="record-link secondary spotify-link" href="${safeUrl(spotifySearchUrl)}" target="_blank" rel="noopener">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" style="vertical-align:-1px; margin-right:4px;"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424c-.18.295-.565.387-.86.207-2.377-1.454-5.37-1.783-8.892-.982-.336.076-.67-.135-.746-.472-.076-.336.135-.67.472-.746 3.856-.88 7.15-.505 9.822 1.13.295.18.387.565.204.863zm1.224-2.723c-.226.367-.707.487-1.074.26-2.72-1.672-6.87-2.157-10.076-1.182-.413.125-.85-.107-.975-.52-.125-.413.107-.85.52-.975 3.66-1.11 8.224-.563 11.346 1.354.366.226.486.707.258 1.074zm.105-2.82c-3.26-1.937-8.643-2.12-11.758-1.173-.5.15-1.025-.133-1.177-.633-.15-.5.133-1.025.633-1.177 3.616-1.1 9.54-.888 13.293 1.342.45.267.6.846.333 1.296-.267.45-.846.6-1.296.333z"/></svg>Spotify
          </a>
          <a class="record-link secondary youtube-link" href="${safeUrl(youtubeSearchUrl)}" target="_blank" rel="noopener">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" style="vertical-align:-1px; margin-right:4px;"><path d="M23.498 6.163a3.003 3.003 0 00-2.11-2.11C19.518 3.545 12 3.545 12 3.545s-7.518 0-9.388.507a3.003 3.003 0 00-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 002.11 2.11c1.87.508 9.388.508 9.388.508s7.518 0 9.388-.507a3.003 3.003 0 002.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>YouTube
          </a>
          <a class="record-link secondary" href="${safeUrl(rec.discogsUrl)}" target="_blank" rel="noopener">View on Discogs &#8599;</a>
          <a class="record-link secondary" href="https://www.discogs.com" target="_blank" rel="noopener">Go to Discogs &#8599;</a>
        </div>
      </div>
    </div>`;
}

function renderDiscogsSetup() {
  byId('discogs-card').innerHTML = `
    <div class="card-title">Discogs Daily Record &mdash; Setup needed</div>
    <div class="record-body">
      <div class="record-cover-placeholder">&#127908;</div>
      <div class="record-info">
        <div class="record-title">Connect your music collection</div>
        <div class="record-artist">Discogs collection blocks direct access unless public.</div>
        <div class="record-tags">
          <span class="record-tag">1&nbsp; Open the dashboard HTML in a text editor</span>
          <span class="record-tag">2&nbsp; Find: <code style="color:var(--accent)">DISCOGS_USER = ''</code></span>
          <span class="record-tag">3&nbsp; Set your Discogs username and save</span>
          <span class="record-tag">4&nbsp; Make your Discogs collection public</span>
        </div>
        <div class="record-actions">
          <a class="record-link" href="https://www.discogs.com" target="_blank" rel="noopener">Discogs &#8599;</a>
        </div>
      </div>
    </div>`;
}

// ── Todoist ───────────────────────────────────────────────────────────────────
const TODOIST_API = 'https://api.todoist.com/api/v1/tasks';
const TODOIST_PROJECTS_API = 'https://api.todoist.com/api/v1/projects';
const TODOIST_TOKEN_HELP = 'https://app.todoist.com/app/settings/integrations/developer';

function readTodoistToken() {
  try {
    return (localStorage.getItem(STORAGE.todoistToken) || '').trim();
  } catch (e) {
    console.error('Todoist token unreadable:', e);
    return '';
  }
}

// The token is written once and never rendered back into the page.
function saveTodoistToken() {
  const input = byId('todoist-token-input');
  if (!input) return;
  const token = input.value.trim();
  if (!token) {
    renderTodoistSetup('Pega un token primero.');
    return;
  }
  try {
    localStorage.setItem(STORAGE.todoistToken, token);
  } catch (e) {
    console.error('Todoist token not persisted:', e);
    renderTodoistSetup('No se pudo guardar el token en este navegador.');
    return;
  }
  input.value = '';
  loadTodoistTasks();
}

function renderTodoistSetup(message = '') {
  const note = message
    ? `<div class="err">${escapeHtml(message)}</div>`
    : '';

  byId('todoist-card').innerHTML = `
    <div class="card-title">Tareas &mdash; Falta configurar</div>
    <div class="todoist-setup">
      <div class="todoist-setup-text">
        Pega un token de la API de Todoist para ver las tareas de hoy y las
        vencidas. Se guarda solo en este navegador y se usa solo para leer.
      </div>
      ${note}
      <div class="todoist-token-row">
        <input type="password" id="todoist-token-input" class="todoist-token-input"
               placeholder="Token de la API de Todoist" autocomplete="off" spellcheck="false"
               aria-label="Token de la API de Todoist">
        <button type="button" class="record-link" data-action="save-todoist">Guardar</button>
      </div>
      <a class="record-link secondary" href="${TODOIST_TOKEN_HELP}" target="_blank" rel="noopener">Consigue un token &#8599;</a>
    </div>`;
}

// Read-only. Never issues POST, PUT or DELETE.
async function fetchTodoistTasks(token) {
  const response = await fetch(TODOIST_API, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (response.status === 401) throw new Error('TOKEN_INVALID');
  if (response.status === 403) throw new Error('TOKEN_FORBIDDEN');
  if (response.status === 429) throw new Error('RATE_LIMITED');
  if (!response.ok) throw new Error(`Todoist API error: HTTP ${response.status}`);

  const payload = await response.json();
  // The v1 endpoint may return a bare array or wrap it; accept either.
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.results)) return payload.results;
  throw new Error('UNEXPECTED_SHAPE');
}

// Project names are a label, never a reason to fail: any error yields {}.
async function fetchTodoistProjectNames(token) {
  try {
    const response = await fetch(TODOIST_PROJECTS_API, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) return {};
    return TodoistTasks.buildProjectNames(await response.json());
  } catch (e) {
    console.error('Todoist project names unavailable:', e);
    return {};
  }
}

function localTodayISO(now = new Date()) {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function todoistTaskHtml(task, overdue, projectNames) {
  const urgent = task.priority >= 3 ? ' urgent' : '';
  const meta = [];

  const project = task.projectId ? projectNames[task.projectId] : null;
  if (project) meta.push(project);

  if (overdue) meta.push(`vencía ${task.date}`);
  else if (task.time) meta.push(task.time);

  const link = task.url
    ? `<a class="todoist-content" href="${safeUrl(task.url)}" target="_blank" rel="noopener">${escapeHtml(task.content)}</a>`
    : `<span class="todoist-content">${escapeHtml(task.content)}</span>`;

  return `<li class="todoist-task${urgent}">
    ${link}
    ${meta.length ? `<span class="todoist-meta">${escapeHtml(meta.join(' · '))}</span>` : ''}
  </li>`;
}

function renderTodoistCard(groups, projectNames = {}) {
  const total = groups.overdue.length + groups.dueToday.length;

  if (!total) {
    byId('todoist-card').innerHTML = `
      <div class="card-title">Tareas</div>
      <div class="todoist-empty">Nada para hoy.</div>`;
    return;
  }

  // Spec wording: "Tareas — 2 atrasadas · 5 para hoy". Singular when there is one.
  const summary = [];
  if (groups.overdue.length) {
    summary.push(`${groups.overdue.length} ${groups.overdue.length === 1 ? 'atrasada' : 'atrasadas'}`);
  }
  if (groups.dueToday.length) summary.push(`${groups.dueToday.length} para hoy`);

  const items = groups.overdue.map(t => todoistTaskHtml(t, true, projectNames))
    .concat(groups.dueToday.map(t => todoistTaskHtml(t, false, projectNames)))
    .join('');

  byId('todoist-card').innerHTML = `
    <div class="card-title">Tareas &mdash; ${escapeHtml(summary.join(' · '))}</div>
    <ul class="todoist-list">${items}</ul>`;
}

async function loadTodoistTasks() {
  const token = readTodoistToken();
  if (!token) { renderTodoistSetup(); return; }

  const MESSAGES = {
    TOKEN_INVALID: 'Todoist ha rechazado el token. Puede estar revocado — pega uno nuevo.',
    TOKEN_FORBIDDEN: 'Ese token no tiene permiso para leer tareas.',
    RATE_LIMITED: 'Todoist está limitando las peticiones. Prueba de nuevo en unos minutos.',
    UNEXPECTED_SHAPE: 'Todoist ha devuelto una respuesta que este dashboard no reconoce.',
  };

  try {
    // Tasks decide success; names only decorate, so a failed lookup yields {}.
    const [raw, projectNames] = await Promise.all([
      fetchTodoistTasks(token),
      fetchTodoistProjectNames(token),
    ]);
    renderTodoistCard(TodoistTasks.partitionTasks(raw, localTodayISO()), projectNames);
  } catch (e) {
    console.error('Todoist load failed:', e);
    if (e.message === 'TOKEN_INVALID' || e.message === 'TOKEN_FORBIDDEN') {
      // Keep the stored token: the user decides whether to replace it.
      renderTodoistSetup(MESSAGES[e.message]);
      return;
    }
    setCardMessage('todoist-card', 'Tareas', MESSAGES[e.message] || 'No se pudieron cargar las tareas.');
  }
}

// ── Main refresh ──────────────────────────────────────────────────────────────
async function refresh() {
  byId('last-updated').textContent = 'Refreshing...';
  byId('refresh-btn').disabled = true;

  renderWeatherSkeleton();
  renderHNSkeleton();
  renderRecordSkeleton('clz-card', 'Daily Collection Radar');
  renderRecordSkeleton('discogs-card', 'Discogs Daily Record');

  await Promise.allSettled([
    fetchWeather().then(renderWeather).catch((e) => {
      console.error(e);
      const body = byId('weather-body');
      if (body) body.innerHTML = '<div class="err">Failed to load weather data.</div>';
    }),
    fetchHN().then(renderHN).catch(() => {
      setCardMessage('hn-card', 'Hacker News', 'Failed to load stories.');
    }),
    fetchCLZRecord({ cacheBust: true }).then(renderCLZRecord).catch(e => {
      if (e.message === 'NOT_CONFIGURED') { renderCLZSetup(); return; }
      byId('clz-card').innerHTML =
        `<div class="card-title">Daily Collection Radar</div>
         <div class="err">${escapeHtml(e.message)}</div>
         <div class="record-actions">
           <button type="button" class="record-link" data-action="refresh-clz">Sync CLZ</button>
           <a class="record-link secondary" href="${GITHUB_ACTIONS_URL}" target="_blank" rel="noopener">Actions &#8599;</a>
           <a class="record-link secondary" href="${CLZ_URL}" target="_blank" rel="noopener">CLZ Collection &#8599;</a>
         </div>`;
    }),
    fetchDiscogsRecord().then(renderDiscogsRecord).catch(e => {
      if (e.message === 'NOT_CONFIGURED') { renderDiscogsSetup(); return; }
      byId('discogs-card').innerHTML =
        `<div class="card-title">Discogs Daily Record</div>
         <div class="err">${escapeHtml(e.message)}</div>
         <div class="record-actions">
           <a class="record-link" href="https://www.discogs.com" target="_blank" rel="noopener">Discogs &#8599;</a>
         </div>`;
    }),
  ]);

  renderQuote();
  loadTodoistTasks();

  const now = new Date();
  byId('last-updated').textContent =
    'Updated ' + now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  byId('refresh-btn').disabled = false;
}

function bindEvents() {
  document.addEventListener('click', event => {
    const trigger = event.target.closest('[data-action]');
    if (!trigger) return;

    const action = trigger.dataset.action;
    if (action === 'set-accent') setAccent(trigger.dataset.accent);
    if (action === 'refresh-dashboard') refresh();
    if (action === 'toggle-weather') toggleWeatherDrawer();
    if (action === 'toggle-clocks') toggleClocksDrawer();
    if (action === 'save-weather') saveWeatherSettings();
    if (action === 'save-clocks') saveClocksSettings();
    if (action === 'switch-weather') switchWeatherTab(trigger.dataset.city);
    if (action === 'roll-clz') rollCLZAlbum();
    if (action === 'roll-discogs') rollDiscogsAlbum();
    if (action === 'refresh-clz') refreshCLZCollection();
    if (action === 'reload') location.reload();
    if (action === 'save-todoist') saveTodoistToken();
  });

  document.addEventListener('input', event => {
    const input = event.target.closest('[data-filter-type]');
    if (input) filterSettingsCities(input, input.dataset.filterType);
  });

  document.addEventListener('change', event => {
    const input = event.target.closest('[data-settings-type]');
    if (!input) return;
    if (input.dataset.settingsType === 'clocks') onClockCheckboxChange();
    if (input.dataset.settingsType === 'weather') onWeatherCheckboxChange();
  });

  document.addEventListener('error', event => {
    const image = event.target;
    if (image instanceof HTMLImageElement && image.matches('[data-record-cover]')) {
      image.outerHTML = recordCoverPlaceholder();
    }
  }, true);

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      const weatherDrawer = byId('weather-settings-drawer');
      const clocksDrawer = byId('clocks-settings-drawer');
      if (weatherDrawer && !weatherDrawer.hidden) toggleWeatherDrawer();
      if (clocksDrawer && !clocksDrawer.hidden) toggleClocksDrawer();
      return;
    }

    // Ignore shortcuts if the user is typing in a text field
    const activeEl = document.activeElement;
    if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.isContentEditable)) {
      return;
    }

    const key = event.key.toLowerCase();
    
    // R: Refresh everything
    if (key === 'r') {
      event.preventDefault();
      refresh();
    }
    
    // C: Roll CLZ Album
    if (key === 'c') {
      event.preventDefault();
      rollCLZAlbum();
    }
    
    // D: Roll Discogs Album
    if (key === 'd') {
      event.preventDefault();
      rollDiscogsAlbum();
    }
    
    // W: Configure weather (Toggle drawer)
    if (key === 'w') {
      event.preventDefault();
      toggleWeatherDrawer();
    }
    
    // K: Configure clocks (Toggle drawer)
    if (key === 'k') {
      event.preventDefault();
      toggleClocksDrawer();
    }
  });
}

// ── Skeleton Loader Helpers ───────────────────────────────────────────────────
function renderWeatherSkeleton() {
  const body = byId('weather-body');
  if (!body) return;
  body.innerHTML = `
    <div class="weather-fade-wrapper">
      <div class="w-current">
        <div class="skeleton" style="width: 50px; height: 50px; border-radius: 50%;"></div>
        <div class="skeleton" style="width: 80px; height: 45px; border-radius: 6px;"></div>
      </div>
      <div class="w-stats" style="margin-bottom: 20px; display: flex; gap: 18px;">
        <div class="skeleton" style="width: 100px; height: 14px; border-radius: 4px;"></div>
        <div class="skeleton" style="width: 80px; height: 14px; border-radius: 4px;"></div>
      </div>
      <div class="forecast">
        ${Array(5).fill(0).map(() => `
          <div class="fc-day" style="background: transparent; border: 1px solid var(--border);">
            <div class="skeleton" style="width: 25px; height: 10px; margin: 0 auto 8px; border-radius: 2px;"></div>
            <div class="skeleton" style="width: 20px; height: 20px; margin: 0 auto 8px; border-radius: 50%;"></div>
            <div class="skeleton" style="width: 30px; height: 12px; margin: 0 auto; border-radius: 2px;"></div>
          </div>
        `).join('')}
      </div>
    </div>`;
}

function renderRecordSkeleton(cardId, cardTitle) {
  const card = byId(cardId);
  if (!card) return;
  card.innerHTML = `
    <div class="card-title">${cardTitle}</div>
    <div class="record-body" style="gap: 24px;">
      <div class="skeleton record-cover" style="border-radius: 10px;"></div>
      <div class="record-info" style="flex: 1;">
        <div class="skeleton" style="width: 60%; height: 24px; margin-bottom: 8px; border-radius: 4px;"></div>
        <div class="skeleton" style="width: 40%; height: 16px; margin-bottom: 12px; border-radius: 3px;"></div>
        <div class="record-tags" style="margin-bottom: 14px;">
          <div class="skeleton" style="width: 50px; height: 16px; border-radius: 4px;"></div>
          <div class="skeleton" style="width: 70px; height: 16px; border-radius: 4px;"></div>
        </div>
        <div class="record-actions" style="margin-top: 6px; display: flex; gap: 8px;">
          <div class="skeleton" style="width: 80px; height: 26px; border-radius: 6px;"></div>
          <div class="skeleton" style="width: 100px; height: 26px; border-radius: 6px;"></div>
        </div>
      </div>
    </div>`;
}

function renderHNSkeleton() {
  const card = byId('hn-card');
  if (!card) return;
  card.innerHTML = `
    <div class="card-title">Top Hacker News Stories</div>
    <ul class="hn-list">
      ${Array(5).fill(0).map((_, i) => `
        <li class="hn-item" style="border-bottom: 1px solid var(--border);">
          <span class="hn-n">${i + 1}</span>
          <div style="flex: 1;">
            <div class="skeleton" style="width: 70%; height: 14px; margin-bottom: 6px; border-radius: 3px;"></div>
            <div class="skeleton" style="width: 40%; height: 10px; border-radius: 2px;"></div>
          </div>
        </li>
      `).join('')}
    </ul>`;
}

// ── Greeting Helpers ──────────────────────────────────────────────────────────
function getGreeting() {
  const hour = new Date().getHours();
  let baseGreeting = 'Good morning';
  if (hour >= 12 && hour < 18) {
    baseGreeting = 'Good afternoon';
  } else if (hour >= 18 && hour < 22) {
    baseGreeting = 'Good evening';
  } else if (hour >= 22 || hour < 5) {
    baseGreeting = 'Good night';
  }
  
  if (USER_NAME) {
    return `${baseGreeting}, ${USER_NAME}`;
  }
  return baseGreeting;
}

function updateGreeting() {
  const greetingEl = byId('greeting-title');
  if (greetingEl) {
    greetingEl.textContent = getGreeting();
  }
}

// ── Boot ──────────────────────────────────────────────────────────────────────
(function setHeaderDate() {
  const d = new Date();
  byId('header-date').textContent =
    d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
})();

bindEvents();
updateGreeting();
loadAccentColor();
updateClocks();
setInterval(updateClocks, 1000);
refresh();
setInterval(refresh, REFRESH_MS);

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('Service Worker registered successfully with scope:', reg.scope))
      .catch(err => console.error('Service Worker registration failed:', err));
  });
}
