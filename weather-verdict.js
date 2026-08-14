(function initWeatherVerdict(root, factory) {
  const api = factory();
  const isCommonJS = typeof module === 'object' && module.exports;
  if (isCommonJS) {
    module.exports = api;
  } else if (root) {
    root.WeatherVerdict = api;
  }
}(typeof globalThis !== 'undefined' ? globalThis : null, function createWeatherVerdict() {
  const DEFAULT_THRESHOLDS = { yes: 50, maybe: 30 };

  // Spanish, per the spec's UX examples. The only place the verdict wording lives.
  const COPY = {
    umbrellaYes: '☂ Paraguas: sí',
    umbrellaMaybe: '☂ Paraguas: quizá',
    dry: 'Sin lluvia hoy',
    window: (probability, from, to) => `${probability}% entre las ${from} y las ${to}`,
    chanceToday: (probability) => `${probability}% de probabilidad hoy`,
    feelsLike: (degrees) => `sensación máx ${degrees}°`,
    sunset: (time) => `anochece ${time}`,
  };

  // "2026-08-14T07:24" -> "07:24"
  function hourLabel(value) {
    return typeof value === 'string' && value.length >= 16 ? value.slice(11, 16) : null;
  }

  function firstLabel(list) {
    return Array.isArray(list) ? hourLabel(list[0]) : null;
  }

  function firstNumber(list) {
    const value = Array.isArray(list) ? Number(list[0]) : NaN;
    return Number.isFinite(value) ? value : null;
  }

  function classify(probability, thresholds) {
    if (!Number.isFinite(probability)) return 'no';
    if (probability >= thresholds.yes) return 'yes';
    if (probability >= thresholds.maybe) return 'maybe';
    return 'no';
  }

  // Single pass over today's remaining hours. Returns the highest probability
  // still ahead of us and the first contiguous run at or above minProbability.
  // All comparisons are lexicographic on fixed-width ISO strings, which are
  // already in the requested city's timezone — no Date, no timezone maths.
  function scanRemainingToday(data, nowLocal, minProbability) {
    const hourly = data && data.hourly;
    const daily = data && data.daily;
    if (!hourly || !Array.isArray(hourly.time) || !Array.isArray(hourly.precipitation_probability)) return null;
    if (!daily || !Array.isArray(daily.time) || typeof daily.time[0] !== 'string') return null;

    const today = daily.time[0];
    let remainingMax = null;
    let start = null;
    let end = null;
    let closed = false;

    for (let i = 0; i < hourly.time.length; i++) {
      const time = hourly.time[i];
      if (typeof time !== 'string' || time.slice(0, 10) !== today) continue;
      if (nowLocal && time < nowLocal) continue;

      // Open-Meteo uses null for gaps in the series. Treat it as unknown and
      // skip it — note Number(null) is 0, so coercing first would silently
      // read a gap as "dry" and cut a rain window in half.
      const rawProbability = hourly.precipitation_probability[i];
      if (rawProbability === null || rawProbability === undefined || rawProbability === '') continue;

      const probability = Number(rawProbability);
      if (!Number.isFinite(probability)) continue;

      if (remainingMax === null || probability > remainingMax) remainingMax = probability;

      if (!closed) {
        if (probability >= minProbability) {
          if (start === null) start = time;
          end = time;
        } else if (start !== null) {
          closed = true;
        }
      }
    }

    return {
      remainingMax,
      window: start === null ? null : { from: hourLabel(start), to: hourLabel(end) },
    };
  }

  function buildVerdict(options) {
    const opts = options || {};
    const data = opts.data || {};
    const thresholds = Object.assign({}, DEFAULT_THRESHOLDS, opts.thresholds || {});
    const daily = data.daily || {};
    const nowLocal = opts.nowLocal || (data.current && data.current.time) || null;

    const scan = scanRemainingToday(data, nowLocal, thresholds.maybe);
    const degraded = scan === null;

    const probability = degraded
      ? firstNumber(daily.precipitation_probability_max)
      : scan.remainingMax;

    return {
      umbrella: classify(probability, thresholds),
      maxProbability: Number.isFinite(probability) ? probability : null,
      window: degraded ? null : scan.window,
      sunrise: firstLabel(daily.sunrise),
      sunset: firstLabel(daily.sunset),
      feelsLike: {
        max: firstNumber(daily.apparent_temperature_max),
        min: firstNumber(daily.apparent_temperature_min),
      },
      degraded,
    };
  }

  function formatVerdict(verdict) {
    const v = verdict || {};
    const details = [];

    let headline = COPY.dry;
    if (v.umbrella === 'yes') headline = COPY.umbrellaYes;
    else if (v.umbrella === 'maybe') headline = COPY.umbrellaMaybe;

    if (v.umbrella !== 'no' && Number.isFinite(v.maxProbability)) {
      details.push(v.window
        ? COPY.window(v.maxProbability, v.window.from, v.window.to)
        : COPY.chanceToday(v.maxProbability));
    }

    if (v.feelsLike && Number.isFinite(v.feelsLike.max)) {
      details.push(COPY.feelsLike(Math.round(v.feelsLike.max)));
    }

    if (v.sunset) details.push(COPY.sunset(v.sunset));

    return { headline, details };
  }

  return { DEFAULT_THRESHOLDS, buildVerdict, formatVerdict };
}));
