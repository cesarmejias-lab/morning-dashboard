const test = require('node:test');
const assert = require('node:assert/strict');
const { buildCollectionPayload } = require('../sync-collection');

test('buildCollectionPayload preserves top-level fields and adds summary', () => {
  const payload = buildCollectionPayload({
    username: 'cesarmejias',
    syncedAt: '2026-05-22T12:00:00.000Z',
    albums: [
      { id: '1', title: 'A', artist: 'Artist A', year: '1988', genres: ['Pop'], format: 'CD' },
      { id: '2', title: 'B', artist: 'Artist B', year: '1991', styles: ['Indie Rock'], format: 'Vinyl' },
    ],
  });

  assert.equal(payload.username, 'cesarmejias');
  assert.equal(payload.syncedAt, '2026-05-22T12:00:00.000Z');
  assert.equal(payload.total, 2);
  assert.equal(payload.albums.length, 2);
  assert.deepEqual(payload.summary.formats, [
    { name: 'CD', count: 1 },
    { name: 'Vinyl', count: 1 },
  ]);
});
