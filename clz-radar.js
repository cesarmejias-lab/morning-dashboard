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

  return {
    HISTORY_LIMIT,
    HISTORY_MAX_AGE_DAYS,
    normalizeAlbum,
    normalizeCollection,
    inferMetadataQuality,
    buildCollectionSummary,
    decadeFromYear,
  };
}));
