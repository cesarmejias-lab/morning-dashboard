(function initCLZRadar(root, factory) {
  const api = factory();
  const isCommonJS = typeof module === 'object' && module.exports;
  if (isCommonJS) {
    module.exports = api;
  } else if (root) {
    root.CLZRadar = api;
  }
}(typeof globalThis !== 'undefined' ? globalThis : null, function createCLZRadar() {
  const QUALITY_FIELDS = ['genres', 'styles', 'moods', 'format', 'edition', 'addedAt'];
  const HISTORY_LIMIT = 50;
  const HISTORY_MAX_AGE_DAYS = 45;

  function cleanText(value) {
    const text = String(value == null ? '' : value).replace(/\s+/g, ' ').trim();
    return text || null;
  }

  function cleanArray(value) {
    const source = Array.isArray(value) ? value : (value ? [value] : []);
    return [...new Set(source.map(cleanText).filter(Boolean))];
  }

  function cleanYear(value) {
    const text = cleanText(value);
    return text;
  }

  function inferMetadataQuality(album) {
    const source = album || {};
    const missing = [];
    const hasGenres = cleanArray(source.genres).length > 0;
    const hasStyles = cleanArray(source.styles).length > 0;
    const hasMoods = cleanArray(source.moods).length > 0;
    const hasFormat = Boolean(cleanText(source.format));
    const hasEdition = Boolean(cleanText(source.edition));
    const hasAddedAt = Boolean(cleanText(source.addedAt));

    if (!hasGenres) missing.push('genres');
    if (!hasStyles) missing.push('styles');
    if (!hasMoods) missing.push('moods');
    if (!hasFormat) missing.push('format');
    if (!hasEdition) missing.push('edition');
    if (!hasAddedAt) missing.push('addedAt');

    return {
      level: missing.length === QUALITY_FIELDS.length ? 'basic' : (missing.length === 0 ? 'enriched' : 'partial'),
      missing,
    };
  }

  function normalizeAlbum(album) {
    const normalized = {
      id: cleanText(album && album.id) || '',
      title: cleanText(album && album.title) || 'Unknown Title',
      artist: cleanText(album && album.artist) || 'Unknown Artist',
      year: cleanYear(album && album.year),
      cover: cleanText(album && album.cover),
      genres: cleanArray(album && album.genres),
      styles: cleanArray(album && album.styles),
      moods: cleanArray(album && album.moods),
      format: cleanText(album && album.format),
      edition: cleanText(album && album.edition),
      addedAt: cleanText(album && album.addedAt),
      detailCheckedAt: cleanText(album && album.detailCheckedAt),
    };
    normalized.metadataQuality = inferMetadataQuality(normalized);
    return normalized;
  }

  function decadeFromYear(year) {
    const match = String(year == null ? '' : year).match(/\b(18|19|20)\d{2}\b/);
    if (!match) return null;
    const numeric = Number(match[0]);
    return `${Math.floor(numeric / 10) * 10}s`;
  }

  function increment(map, name) {
    if (!name) return;
    map.set(name, (map.get(name) || 0) + 1);
  }

  function topCounts(map) {
    return [...map.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  }

  function buildCollectionSummary(albums) {
    const sourceAlbums = Array.isArray(albums) ? albums : [];
    const genres = new Map();
    const styles = new Map();
    const formats = new Map();
    const decades = new Map();
    const metadataQuality = { basic: 0, partial: 0, enriched: 0 };

    sourceAlbums.map(normalizeAlbum).forEach(album => {
      album.genres.forEach(name => increment(genres, name));
      album.styles.forEach(name => increment(styles, name));
      increment(formats, album.format);
      increment(decades, decadeFromYear(album.year));
      metadataQuality[album.metadataQuality.level] += 1;
    });

    return {
      genres: topCounts(genres),
      styles: topCounts(styles),
      formats: topCounts(formats),
      decades: topCounts(decades),
      metadataQuality,
    };
  }

  function normalizeTotal(total, fallback) {
    if (typeof total === 'number') {
      return Number.isFinite(total) && Number.isInteger(total) && total >= 0
        ? total
        : fallback;
    }

    if (typeof total === 'string') {
      const trimmed = total.trim();
      if (!/^\d+$/.test(trimmed)) return fallback;
      const parsed = Number(trimmed);
      return Number.isFinite(parsed) && Number.isInteger(parsed) && parsed >= 0
        ? parsed
        : fallback;
    }

    return fallback;
  }

  function normalizeCollection(payload) {
    const source = payload || {};
    const albums = Array.isArray(source.albums)
      ? source.albums.map(normalizeAlbum).filter(album => album.id)
      : [];

    return {
      username: cleanText(source.username) || '',
      syncedAt: cleanText(source.syncedAt),
      total: normalizeTotal(source.total, albums.length),
      albums,
      summary: buildCollectionSummary(albums),
    };
  }

  function daysBetween(a, b) {
    const start = a instanceof Date ? a : new Date(a);
    const end = b instanceof Date ? b : new Date(b);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return Number.POSITIVE_INFINITY;
    return Math.abs(end.getTime() - start.getTime()) / 86400000;
  }

  function pruneHistory(history, now = new Date()) {
    return (Array.isArray(history) ? history : [])
      .filter(entry => entry && entry.id && entry.shownAt && daysBetween(entry.shownAt, now) <= HISTORY_MAX_AGE_DAYS)
      .slice(0, HISTORY_LIMIT);
  }

  function recordHistoryEntry(history, album, now = new Date()) {
    const normalized = normalizeAlbum(album);
    const entry = {
      id: normalized.id,
      artist: normalized.artist,
      shownAt: now.toISOString(),
      signals: [...normalized.genres, ...normalized.styles, ...normalized.moods].slice(0, 6),
    };
    return [entry, ...pruneHistory(history, now).filter(item => item.id !== entry.id)].slice(0, HISTORY_LIMIT);
  }

  function readHistory(storage, key) {
    try {
      const raw = storage.getItem(key);
      return pruneHistory(raw ? JSON.parse(raw) : []);
    } catch {
      return [];
    }
  }

  function writeHistory(storage, key, history) {
    try {
      storage.setItem(key, JSON.stringify(pruneHistory(history)));
    } catch {
      return false;
    }
    return true;
  }

  function seenSet(history, key) {
    return new Set(pruneHistory(history).map(entry => String(entry[key] || '').toLowerCase()).filter(Boolean));
  }

  function scoreAlbum(album, collection, history, random) {
    const normalized = normalizeAlbum(album);
    const recentIds = seenSet(history, 'id');
    const recentArtists = seenSet(history, 'artist');
    let score = 10 + random();

    if (recentIds.has(normalized.id.toLowerCase())) score -= 100;
    if (recentArtists.has(normalized.artist.toLowerCase())) score -= 20;
    if (normalized.addedAt && daysBetween(normalized.addedAt, new Date()) > 365) score += 8;
    if (normalized.genres.length > 0 || normalized.styles.length > 0 || normalized.moods.length > 0) score += 6;
    if (normalized.format) score += 3;
    if (normalized.edition) score += 2;
    if (decadeFromYear(normalized.year)) score += 2;
    if (collection.summary && collection.summary.metadataQuality && collection.summary.metadataQuality.basic > 0 && normalized.metadataQuality.level === 'basic') score -= 2;

    return score;
  }

  function buildRadarSignals(album, collection, history) {
    const normalized = normalizeAlbum(album);
    const signals = [];
    const recentSignals = new Set(pruneHistory(history).flatMap(entry => entry.signals || []).map(value => value.toLowerCase()));
    const decade = decadeFromYear(normalized.year);

    const genre = normalized.genres.find(name => !recentSignals.has(name.toLowerCase())) || normalized.genres[0];
    if (genre) signals.push({ label: 'Genre', value: genre });

    const style = normalized.styles.find(name => !recentSignals.has(name.toLowerCase())) || normalized.styles[0];
    if (style) signals.push({ label: 'Style', value: style });

    if (decade) signals.push({ label: 'Decade', value: decade });
    if (normalized.format) signals.push({ label: 'Format', value: normalized.format });
    if (normalized.addedAt && daysBetween(normalized.addedAt, new Date()) > 365) {
      signals.push({ label: 'Rediscovery', value: 'Added over a year ago' });
    }
    if (normalized.metadataQuality.level === 'basic') {
      signals.push({ label: 'Metadata', value: 'Basic CLZ data' });
    }

    return signals.slice(0, 3);
  }

  function generateRecommendationReason(album, signals) {
    const normalized = normalizeAlbum(album);
    const genre = signals.find(signal => signal.label === 'Genre');
    const style = signals.find(signal => signal.label === 'Style');
    const format = signals.find(signal => signal.label === 'Format');
    const decade = signals.find(signal => signal.label === 'Decade');

    if (genre) return `A ${genre.value} record from your collection rotation.`;
    if (style) return `A ${style.value} corner of the collection worth revisiting.`;
    if (format) return `A ${format.value} edition surfaced for today's listen.`;
    if (decade) return `A ${decade.value} pick from a different shelf of the collection.`;
    if (normalized.metadataQuality.level === 'basic') return 'A fresh pick from your CLZ collection.';
    return 'A fresh pick from your CLZ collection.';
  }

  function selectDailyRadar(collectionPayload, options = {}) {
    const collection = normalizeCollection(collectionPayload);
    const history = pruneHistory(options.history || [], options.now || new Date());
    const random = typeof options.random === 'function' ? options.random : Math.random;
    const candidates = collection.albums.length > 0 ? collection.albums : [];
    if (candidates.length === 0) {
      throw new Error('CLZ collection is empty.');
    }

    const scored = candidates
      .map(album => ({ album, score: scoreAlbum(album, collection, history, random) }))
      .sort((a, b) => b.score - a.score);
    const selected = scored[0].album;
    const signals = buildRadarSignals(selected, collection, history);
    const reason = generateRecommendationReason(selected, signals);

    return {
      ...selected,
      total: collection.total || collection.albums.length,
      syncedAt: collection.syncedAt,
      reason,
      signals,
    };
  }

  return {
    HISTORY_LIMIT,
    HISTORY_MAX_AGE_DAYS,
    normalizeAlbum,
    normalizeCollection,
    inferMetadataQuality,
    buildCollectionSummary,
    decadeFromYear,
    selectDailyRadar,
    buildRadarSignals,
    generateRecommendationReason,
    pruneHistory,
    recordHistoryEntry,
    readHistory,
    writeHistory,
  };
}));
