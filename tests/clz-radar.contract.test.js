const test = require('node:test');
const assert = require('node:assert/strict');
const {
  normalizeAlbum,
  normalizeCollection,
  inferMetadataQuality,
  buildCollectionSummary,
} = require('../clz-radar');

test('normalizeAlbum preserves basic CLZ fields and marks basic quality', () => {
  const album = normalizeAlbum({
    id: 11785514,
    title: "Don't Give Up",
    artist: 'The Maureens',
    year: 2026,
    cover: 'https://example.test/cover.jpg',
  });

  assert.equal(album.id, '11785514');
  assert.equal(album.title, "Don't Give Up");
  assert.equal(album.artist, 'The Maureens');
  assert.equal(album.year, '2026');
  assert.equal(album.cover, 'https://example.test/cover.jpg');
  assert.deepEqual(album.genres, []);
  assert.deepEqual(album.styles, []);
  assert.deepEqual(album.moods, []);
  assert.equal(album.format, null);
  assert.equal(album.edition, null);
  assert.equal(album.addedAt, null);
  assert.deepEqual(album.metadataQuality, {
    level: 'basic',
    missing: ['genres', 'styles', 'moods', 'format', 'edition', 'addedAt'],
  });
});

test('inferMetadataQuality marks partial and enriched albums', () => {
  assert.deepEqual(inferMetadataQuality({
    genres: ['Jazz'],
    styles: ['Hard Bop'],
    format: 'CD',
  }), {
    level: 'partial',
    missing: ['moods', 'edition', 'addedAt'],
  });

  assert.deepEqual(inferMetadataQuality({
    genres: ['Jazz'],
    styles: ['Hard Bop'],
    moods: ['Late night'],
    format: 'CD',
    edition: 'Blue Note',
    addedAt: '2024-01-20',
  }), {
    level: 'enriched',
    missing: [],
  });
});

test('normalizeCollection keeps current top-level contract and adds summary', () => {
  const collection = normalizeCollection({
    username: 'cesarmejias',
    syncedAt: '2026-05-22T10:00:00.000Z',
    total: 2,
    albums: [
      { id: '1', title: 'One', artist: 'A', year: '1994', genres: ['Jazz'], format: 'CD' },
      { id: '2', title: 'Two', artist: 'B', year: '2001', styles: ['Indie Rock'], format: 'Vinyl' },
    ],
  });

  assert.equal(collection.username, 'cesarmejias');
  assert.equal(collection.syncedAt, '2026-05-22T10:00:00.000Z');
  assert.equal(collection.total, 2);
  assert.equal(collection.albums.length, 2);
  assert.deepEqual(collection.summary.genres, [{ name: 'Jazz', count: 1 }]);
  assert.deepEqual(collection.summary.styles, [{ name: 'Indie Rock', count: 1 }]);
  assert.deepEqual(collection.summary.formats, [
    { name: 'CD', count: 1 },
    { name: 'Vinyl', count: 1 },
  ]);
  assert.deepEqual(collection.summary.decades, [
    { name: '1990s', count: 1 },
    { name: '2000s', count: 1 },
  ]);
  assert.deepEqual(collection.summary.metadataQuality, {
    basic: 0,
    partial: 2,
    enriched: 0,
  });
});

test('buildCollectionSummary returns empty arrays for empty input', () => {
  assert.deepEqual(buildCollectionSummary([]), {
    genres: [],
    styles: [],
    formats: [],
    decades: [],
    metadataQuality: {
      basic: 0,
      partial: 0,
      enriched: 0,
    },
  });
});
