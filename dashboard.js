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

// ── Exchange rates ────────────────────────────────────────────────────────────
async function fetchRates() {
  const r = await fetch('https://api.frankfurter.dev/v1/latest?base=EUR&symbols=USD,GBP,CHF,JPY');
  if (!r.ok) throw new Error(`Rates API error: HTTP ${r.status}`);
  return r.json();
}

function renderRates(data) {
  const FLAGS   = { USD: '🇺🇸', GBP: '🇬🇧', CHF: '🇨🇭', JPY: '🇯🇵' };
  const TARGETS = ['USD', 'GBP', 'CHF', 'JPY'];

  const items = TARGETS.map(cur => {
    const val = Number(data.rates[cur]);
    const fmt = cur === 'JPY' ? val.toFixed(2) : val.toFixed(4);
    return `<div class="rate-item">
      <div class="rate-pair">${FLAGS[cur]} EUR / ${cur}</div>
      <div class="rate-value">${fmt}</div>
    </div>`;
  }).join('');

  byId('rates-card').innerHTML = `
    <div class="card-title">Exchange Rates &mdash; EUR Base &middot; ${escapeHtml(data.date)}</div>
    <div class="rates-grid">${items}</div>`;
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
        window.CLZ_MUSIC_COLLECTION = data;
        return data;
      }
    }
  } catch (e) {
    // Ignore fetch error
  }

  throw Object.assign(new Error('NOT_CONFIGURED'), {});
}

function pickCLZRecord(data) {
  const album = data.albums[Math.floor(Math.random() * data.albums.length)];
  return {
    id: album.id,
    title: album.title,
    artist: album.artist,
    year: album.year,
    cover: album.cover,
    total: data.total || data.albums.length,
    syncedAt: data.syncedAt
  };
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
  const tags = [rec.year].filter(Boolean)
    .map(t => `<span class="record-tag">${escapeHtml(t)}</span>`).join('');

  byId('clz-card').innerHTML = `
    ${recordBgHtml(rec.cover)}
    <div class="card-header">
      <span class="card-title tight">
        <span>&#9679; Now Spinning (CLZ) &mdash; ${rec.total.toLocaleString()} releases</span>
        ${rec.syncedAt ? `<span class="sync-status">Last synced: ${escapeHtml(new Date(rec.syncedAt).toLocaleString())}</span>` : ''}
      </span>
      <div class="record-header-actions">
        <button type="button" class="record-action-btn" data-action="roll-clz" title="Roll another album">Roll</button>
        <button type="button" class="record-action-btn" data-action="refresh-clz" title="Sync CLZ collection now">Sync CLZ</button>
      </div>
    </div>
    <div class="record-body record-roll-wrapper" id="clz-roll-wrapper">
      ${coverHTML}
      <div class="record-info">
        <div class="record-title">${escapeHtml(rec.title)}</div>
        <div class="record-artist">${escapeHtml(rec.artist)}</div>
        ${tags ? `<div class="record-tags">${tags}</div>` : ''}
        <div class="record-actions">
          <a class="record-link" href="${detailUrl}" target="_blank" rel="noopener">View on CLZ &#8599;</a>
          <a class="record-link secondary" href="${CLZ_URL}" target="_blank" rel="noopener">My CLZ Collection &#8599;</a>
          <a class="record-link secondary" href="${GITHUB_ACTIONS_URL}" target="_blank" rel="noopener">Actions &#8599;</a>
        </div>
        <div class="sync-status" id="clz-sync-status">${escapeHtml(syncMessage)}</div>
      </div>
    </div>`;
}

function renderCLZSetup() {
  byId('clz-card').innerHTML = `
    <div class="card-title">CLZ Music &mdash; Setup needed</div>
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
const DISCOGS_USER = 'cesarmejias';

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

  byId('discogs-card').innerHTML = `
    ${recordBgHtml(rec.cover)}
    <div class="card-header">
      <span class="card-title tight">&#9679; Now Spinning (Discogs) &mdash; ${rec.total.toLocaleString()} releases</span>
      <div class="record-header-actions">
        <button type="button" class="record-action-btn" data-action="roll-discogs" title="Roll another album">Roll</button>
      </div>
    </div>
    <div class="record-body record-roll-wrapper" id="discogs-roll-wrapper">
      ${coverHTML}
      <div class="record-info">
        <div class="record-title">${escapeHtml(rec.title)}</div>
        <div class="record-artist">${escapeHtml(rec.artist)}</div>
        ${tags ? `<div class="record-tags">${tags}</div>` : ''}
        <div class="record-actions">
          <a class="record-link" href="${safeUrl(rec.discogsUrl)}" target="_blank" rel="noopener">View on Discogs &#8599;</a>
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

// ── Main refresh ──────────────────────────────────────────────────────────────
async function refresh() {
  byId('last-updated').textContent = 'Refreshing...';
  byId('refresh-btn').disabled = true;

  await Promise.allSettled([
    fetchWeather().then(renderWeather).catch((e) => {
      console.error(e);
      const body = byId('weather-body');
      if (body) body.innerHTML = '<div class="err">Failed to load weather data.</div>';
    }),
    fetchHN().then(renderHN).catch(() => {
      setCardMessage('hn-card', 'Hacker News', 'Failed to load stories.');
    }),
    fetchRates().then(renderRates).catch(() => {
      setCardMessage('rates-card', 'Exchange Rates', 'Failed to load rates.');
    }),
    fetchCLZRecord({ cacheBust: true }).then(renderCLZRecord).catch(e => {
      if (e.message === 'NOT_CONFIGURED') { renderCLZSetup(); return; }
      byId('clz-card').innerHTML =
        `<div class="card-title">CLZ Music Recommendation</div>
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
    if (event.key !== 'Escape') return;
    const weatherDrawer = byId('weather-settings-drawer');
    const clocksDrawer = byId('clocks-settings-drawer');
    if (weatherDrawer && !weatherDrawer.hidden) toggleWeatherDrawer();
    if (clocksDrawer && !clocksDrawer.hidden) toggleClocksDrawer();
  });
}

// ── Boot ──────────────────────────────────────────────────────────────────────
(function setHeaderDate() {
  const d = new Date();
  byId('header-date').textContent =
    d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
})();

bindEvents();
loadAccentColor();
updateClocks();
setInterval(updateClocks, 1000);
refresh();
setInterval(refresh, REFRESH_MS);
