const test = require('node:test');
const assert = require('node:assert/strict');
const { buildVerdict, formatVerdict, DEFAULT_THRESHOLDS } = require('../weather-verdict');

// Helper: a response shaped like Open-Meteo's, with hourly probabilities for today
function fixture(probabilities, overrides = {}) {
  const hours = probabilities.map((_, i) => `2026-08-14T${String(i).padStart(2, '0')}:00`);
  return Object.assign({
    current: { time: '2026-08-14T09:00' },
    daily: {
      time: ['2026-08-14', '2026-08-15'],
      precipitation_probability_max: [Math.max(...probabilities.map(p => Number(p) || 0)), 0],
      sunrise: ['2026-08-14T07:24', '2026-08-15T07:25'],
      sunset: ['2026-08-14T21:14', '2026-08-15T21:13'],
      apparent_temperature_max: [35.6, 34.0],
      apparent_temperature_min: [21.7, 21.0],
    },
    hourly: { time: hours, precipitation_probability: probabilities },
  }, overrides);
}

// 24 hours, all dry
const DRY = Array(24).fill(0);

test('classifies as yes at the exact 50 threshold', () => {
  const probs = DRY.slice();
  probs[15] = 50;
  const verdict = buildVerdict({ data: fixture(probs) });
  assert.equal(verdict.umbrella, 'yes');
  assert.equal(verdict.maxProbability, 50);
});

test('classifies as maybe at the exact 30 threshold', () => {
  const probs = DRY.slice();
  probs[15] = 30;
  assert.equal(buildVerdict({ data: fixture(probs) }).umbrella, 'maybe');
});

test('classifies as no just below the maybe threshold', () => {
  const probs = DRY.slice();
  probs[15] = 29;
  const verdict = buildVerdict({ data: fixture(probs) });
  assert.equal(verdict.umbrella, 'no');
  assert.equal(verdict.window, null);
});

test('reports the first contiguous window at or above the maybe threshold', () => {
  const probs = DRY.slice();
  probs[17] = 60; probs[18] = 70; probs[19] = 65; probs[20] = 55;
  probs[22] = 80; // a later, separate burst that must be ignored
  const verdict = buildVerdict({ data: fixture(probs) });
  assert.deepEqual(verdict.window, { from: '17:00', to: '20:00' });
});

test('ignores rain that already happened before the reference hour', () => {
  const probs = DRY.slice();
  probs[3] = 90; // rained at 03:00, reference time is 09:00
  const verdict = buildVerdict({ data: fixture(probs) });
  assert.equal(verdict.window, null);
  assert.equal(verdict.umbrella, 'no', 'the verdict must reflect the rest of the day, not the whole day');
  assert.equal(verdict.maxProbability, 0);
});

test('handles a window that runs to the end of the day', () => {
  const probs = DRY.slice();
  probs[22] = 55; probs[23] = 60;
  assert.deepEqual(buildVerdict({ data: fixture(probs) }).window, { from: '22:00', to: '23:00' });
});

test('skips non-numeric probabilities without breaking', () => {
  const probs = DRY.slice();
  probs[17] = 60; probs[18] = null; probs[19] = 65;
  const verdict = buildVerdict({ data: fixture(probs) });
  assert.equal(verdict.umbrella, 'yes');
  assert.deepEqual(verdict.window, { from: '17:00', to: '19:00' });
});

test('degrades to the daily maximum when the hourly series is missing', () => {
  const data = fixture(DRY);
  delete data.hourly;
  data.daily.precipitation_probability_max = [70, 0];
  const verdict = buildVerdict({ data });
  assert.equal(verdict.degraded, true);
  assert.equal(verdict.umbrella, 'yes');
  assert.equal(verdict.maxProbability, 70);
  assert.equal(verdict.window, null);
});

test('exposes sunrise, sunset and apparent temperatures as labels and numbers', () => {
  const verdict = buildVerdict({ data: fixture(DRY) });
  assert.equal(verdict.sunrise, '07:24');
  assert.equal(verdict.sunset, '21:14');
  assert.equal(verdict.feelsLike.max, 35.6);
  assert.equal(verdict.feelsLike.min, 21.7);
});

test('omits missing sunrise and sunset instead of throwing', () => {
  const data = fixture(DRY);
  delete data.daily.sunrise;
  delete data.daily.sunset;
  const verdict = buildVerdict({ data });
  assert.equal(verdict.sunrise, null);
  assert.equal(verdict.sunset, null);
});

test('falls back to the injected reference time when current is absent', () => {
  const probs = DRY.slice();
  probs[10] = 80;
  const data = fixture(probs);
  delete data.current;
  const verdict = buildVerdict({ data, nowLocal: '2026-08-14T12:00' });
  assert.equal(verdict.window, null, 'the 10:00 burst is in the past relative to 12:00');
});

test('accepts custom thresholds', () => {
  const probs = DRY.slice();
  probs[15] = 20;
  const verdict = buildVerdict({ data: fixture(probs), thresholds: { yes: 20, maybe: 10 } });
  assert.equal(verdict.umbrella, 'yes');
});

test('survives a completely empty payload', () => {
  const verdict = buildVerdict({ data: {} });
  assert.equal(verdict.umbrella, 'no');
  assert.equal(verdict.maxProbability, null);
  assert.equal(verdict.window, null);
  assert.equal(verdict.degraded, true);
});

test('formatVerdict names the window when there is rain ahead', () => {
  const probs = DRY.slice();
  probs[17] = 70; probs[18] = 70;
  const out = formatVerdict(buildVerdict({ data: fixture(probs) }));
  assert.match(out.headline, /Paraguas: sí/);
  assert.ok(out.details.some(d => d.includes('17:00') && d.includes('18:00')));
});

test('formatVerdict states a dry day without inventing a window', () => {
  const out = formatVerdict(buildVerdict({ data: fixture(DRY) }));
  assert.match(out.headline, /Sin lluvia hoy/);
  assert.ok(out.details.every(d => !d.includes('entre las')));
});

test('DEFAULT_THRESHOLDS are the documented values', () => {
  assert.deepEqual(DEFAULT_THRESHOLDS, { yes: 50, maybe: 30 });
});
