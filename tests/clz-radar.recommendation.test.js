const test = require('node:test');
const assert = require('node:assert/strict');
const {
  selectDailyRadar,
  buildRadarSignals,
  generateRecommendationReason,
  pruneHistory,
  recordHistoryEntry,
} = require('../clz-radar');

const collection = {
  total: 3,
  syncedAt: '2026-05-22T12:00:00.000Z',
  albums: [
    { id: '1', title: 'Recent Artist', artist: 'Seen', year: '2020', genres: ['Rock'], format: 'CD' },
    { id: '2', title: 'Old Jazz', artist: 'Fresh', year: '1964', genres: ['Jazz'], styles: ['Hard Bop'], format: 'Vinyl', addedAt: '2020-01-01' },
    { id: '3', title: 'Ambient Morning', artist: 'Clouds', year: '1998', moods: ['Calm'], format: 'Cassette' },
  ],
  summary: {
    genres: [{ name: 'Rock', count: 1 }, { name: 'Jazz', count: 1 }],
    styles: [{ name: 'Hard Bop', count: 1 }],
    formats: [{ name: 'CD', count: 1 }, { name: 'Vinyl', count: 1 }, { name: 'Cassette', count: 1 }],
    decades: [{ name: '1960s', count: 1 }, { name: '1990s', count: 1 }, { name: '2020s', count: 1 }],
    metadataQuality: { basic: 0, partial: 3, enriched: 0 },
  },
};

test('selectDailyRadar avoids recently seen artists and returns reason and signals', () => {
  const result = selectDailyRadar(collection, {
    history: [{ id: '1', artist: 'Seen', shownAt: '2026-05-21T12:00:00.000Z' }],
    now: new Date('2026-05-22T12:00:00.000Z'),
    random: () => 0,
  });

  assert.equal(result.id, '2');
  assert.equal(result.title, 'Old Jazz');
  assert.match(result.reason, /Jazz|rediscover|Vinyl|1960s/);
  assert.ok(result.signals.length >= 2);
});

test('generateRecommendationReason falls back to basic recommendation text', () => {
  const reason = generateRecommendationReason({ title: 'Plain', artist: 'A' }, []);
  assert.equal(reason, 'A fresh pick from your CLZ collection.');
});

test('buildRadarSignals uses metadata and summary without throwing', () => {
  const album = collection.albums[1];
  const signals = buildRadarSignals(album, collection, []);
  assert.ok(signals.some(signal => signal.label === 'Genre'));
  assert.ok(signals.some(signal => signal.label === 'Decade'));
});

test('history helpers prune old entries and prepend the current recommendation', () => {
  const now = new Date('2026-05-22T12:00:00.000Z');
  const history = pruneHistory([
    { id: 'old', artist: 'Old', shownAt: '2025-01-01T12:00:00.000Z' },
    { id: 'new', artist: 'New', shownAt: '2026-05-21T12:00:00.000Z' },
  ], now);

  assert.deepEqual(history.map(entry => entry.id), ['new']);

  const recorded = recordHistoryEntry(history, {
    id: '2',
    artist: 'Fresh',
    genres: ['Jazz'],
    styles: ['Hard Bop'],
  }, now);

  assert.equal(recorded[0].id, '2');
  assert.deepEqual(recorded[0].signals, ['Jazz', 'Hard Bop']);
});
