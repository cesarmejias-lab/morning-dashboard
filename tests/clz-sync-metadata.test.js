const test = require('node:test');
const assert = require('node:assert/strict');
const {
  parseDetailMetadata,
  mergeAlbumMetadata,
  selectAlbumsForEnrichment,
} = require('../clz-sync-metadata');

test('parseDetailMetadata extracts public detail fields from label/value markup', () => {
  const html = `
    <dl>
      <dt>Genres</dt><dd>Jazz, Soul</dd>
      <dt>Styles</dt><dd>Hard Bop / Vocal Jazz</dd>
      <dt>Format</dt><dd>CD</dd>
      <dt>Edition</dt><dd>Blue Note 80</dd>
      <dt>Added</dt><dd>2024-02-18</dd>
    </dl>
  `;

  assert.deepEqual(parseDetailMetadata(html), {
    genres: ['Jazz', 'Soul'],
    styles: ['Hard Bop', 'Vocal Jazz'],
    moods: [],
    format: 'CD',
    edition: 'Blue Note 80',
    addedAt: '2024-02-18',
  });
});

test('mergeAlbumMetadata preserves listing fields and adds detail quality', () => {
  const merged = mergeAlbumMetadata(
    { id: '1', title: 'One', artist: 'A', year: '1994', cover: 'https://example.test/a.jpg' },
    { genres: ['Jazz'], format: 'CD' },
    '2026-05-22T12:00:00.000Z'
  );

  assert.equal(merged.id, '1');
  assert.equal(merged.title, 'One');
  assert.deepEqual(merged.genres, ['Jazz']);
  assert.equal(merged.format, 'CD');
  assert.equal(merged.detailCheckedAt, '2026-05-22T12:00:00.000Z');
  assert.equal(merged.metadataQuality.level, 'partial');
});

test('selectAlbumsForEnrichment prefers albums without checked metadata', () => {
  const albums = [
    { id: '1', title: 'One' },
    { id: '2', title: 'Two' },
    { id: '3', title: 'Three' },
  ];
  const existing = [
    { id: '2', title: 'Two', detailCheckedAt: '2026-05-01T10:00:00.000Z' },
  ];

  assert.deepEqual(selectAlbumsForEnrichment(albums, existing, 2).map(album => album.id), ['1', '3']);
});
