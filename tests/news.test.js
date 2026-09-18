const test = require('node:test');
const assert = require('node:assert/strict');
const {
  CATEGORIES,
  getCategory,
  getDomain,
  timeAgo,
  normalizeAlgoliaHit,
  normalizeFirebaseStory,
} = require('../news-feed');

test('CATEGORIES defines top tech, AI, and cybersecurity', () => {
  const ids = CATEGORIES.map(c => c.id);
  assert.deepEqual(ids, ['general', 'ai', 'security']);
  assert.equal(getCategory('ai').label, '🤖 IA & LLMs');
  assert.equal(getCategory('security').label, '🛡️ Ciberseguridad');
  assert.equal(getCategory('unknown').id, 'general');
});

test('getDomain extracts clean hostnames', () => {
  assert.equal(getDomain('https://www.theverge.com/2026/09/ai-update'), 'theverge.com');
  assert.equal(getDomain('https://github.com/openai/evals'), 'github.com');
  assert.equal(getDomain('https://news.ycombinator.com/item?id=123'), 'news.ycombinator.com');
  assert.equal(getDomain('invalid-url'), 'news.ycombinator.com');
  assert.equal(getDomain(null), 'news.ycombinator.com');
});

test('timeAgo calculates relative time strings', () => {
  const now = 1750000000;
  assert.equal(timeAgo(now - 25, now), '25s ago');
  assert.equal(timeAgo(now - 120, now), '2m ago');
  assert.equal(timeAgo(now - 7200, now), '2h ago');
  assert.equal(timeAgo(now - 172800, now), '2d ago');
});

test('normalizeAlgoliaHit normalizes search hits', () => {
  const hit = {
    objectID: 41234567,
    title: 'Show HN: Autonomous security auditor for cloud configs',
    url: 'https://security-tool.dev',
    points: 145,
    num_comments: 48,
    created_at_i: 1750000000,
  };

  const normalized = normalizeAlgoliaHit(hit);
  assert.equal(normalized.id, '41234567');
  assert.equal(normalized.title, 'Show HN: Autonomous security auditor for cloud configs');
  assert.equal(normalized.url, 'https://security-tool.dev');
  assert.equal(normalized.hnUrl, 'https://news.ycombinator.com/item?id=41234567');
  assert.equal(normalized.domain, 'security-tool.dev');
  assert.equal(normalized.points, 145);
  assert.equal(normalized.comments, 48);
  assert.equal(normalized.time, 1750000000);
});

test('normalizeAlgoliaHit falls back to HN url when url is empty or Ask HN', () => {
  const hit = {
    objectID: '41234568',
    title: 'Ask HN: What is your favorite local LLM for code?',
    url: '',
    points: 62,
    num_comments: 110,
    created_at_i: 1750000000,
  };

  const normalized = normalizeAlgoliaHit(hit);
  assert.equal(normalized.url, 'https://news.ycombinator.com/item?id=41234568');
  assert.equal(normalized.domain, 'news.ycombinator.com');
});

test('normalizeAlgoliaHit rejects invalid items', () => {
  assert.equal(normalizeAlgoliaHit(null), null);
  assert.equal(normalizeAlgoliaHit({}), null);
  assert.equal(normalizeAlgoliaHit({ objectID: '123', title: '' }), null);
});

test('normalizeFirebaseStory normalizes Firebase HN story objects', () => {
  const item = {
    id: 99999,
    title: 'Major Breakthrough in Quantum Cryptography',
    url: 'https://nature.com/articles/crypto-2026',
    score: 310,
    descendants: 89,
    time: 1750000000,
  };

  const normalized = normalizeFirebaseStory(item);
  assert.equal(normalized.id, '99999');
  assert.equal(normalized.title, 'Major Breakthrough in Quantum Cryptography');
  assert.equal(normalized.url, 'https://nature.com/articles/crypto-2026');
  assert.equal(normalized.hnUrl, 'https://news.ycombinator.com/item?id=99999');
  assert.equal(normalized.domain, 'nature.com');
  assert.equal(normalized.points, 310);
  assert.equal(normalized.comments, 89);
  assert.equal(normalized.time, 1750000000);
});

test('normalizeFirebaseStory rejects invalid items', () => {
  assert.equal(normalizeFirebaseStory(null), null);
  assert.equal(normalizeFirebaseStory({ id: 123, title: '   ' }), null);
});
