const { normalizeAlbum } = require('./clz-radar');

function decodeHtml(value = '') {
  return String(value)
    .replace(/<[^>]*>/g, ' ')
    .replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (entity, token) => {
      const named = { amp: '&', quot: '"', apos: "'", lt: '<', gt: '>', nbsp: ' ' };
      const lower = token.toLowerCase();
      if (named[lower]) return named[lower];
      if (lower.startsWith('#x')) {
        const codePoint = parseInt(lower.slice(2), 16);
        return Number.isFinite(codePoint) ? String.fromCodePoint(codePoint) : entity;
      }
      if (lower.startsWith('#')) {
        const codePoint = parseInt(lower.slice(1), 10);
        return Number.isFinite(codePoint) ? String.fromCodePoint(codePoint) : entity;
      }
      return entity;
    })
    .replace(/\s+/g, ' ')
    .trim();
}

function splitList(value) {
  return [...new Set(decodeHtml(value)
    .split(/\s*(?:,|\/|\|)\s*/g)
    .map(item => item.trim())
    .filter(Boolean))];
}

function findField(html, labels) {
  for (const label of labels) {
    const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const patterns = [
      new RegExp(`<dt[^>]*>\\s*${escaped}\\s*<\\/dt>\\s*<dd[^>]*>([\\s\\S]*?)<\\/dd>`, 'i'),
      new RegExp(`<[^>]+class="[^"]*(?:label|field-name)[^"]*"[^>]*>\\s*${escaped}\\s*<\\/[^>]+>\\s*<[^>]+class="[^"]*(?:value|field-value)[^"]*"[^>]*>([\\s\\S]*?)<\\/[^>]+>`, 'i'),
    ];
    for (const pattern of patterns) {
      const match = String(html || '').match(pattern);
      if (match) return decodeHtml(match[1]);
    }
  }
  return '';
}

function parseDetailMetadata(html) {
  const content = String(html || '');

  // Genres: data-scope-key="genre", fallback to label lookup
  const clzGenres = [];
  const genreMatches = content.matchAll(/data-scope-key="genre"[^>]*>([\s\S]*?)<\/a>/gi);
  for (const m of genreMatches) {
    const g = decodeHtml(m[1]);
    if (g && !clzGenres.includes(g)) clzGenres.push(g);
  }
  const genres = clzGenres.length > 0 ? clzGenres : splitList(findField(content, ['Genres', 'Genre']));

  // Styles & Moods
  const styles = splitList(findField(content, ['Styles', 'Style']));
  const moods = splitList(findField(content, ['Moods', 'Mood']));

  // Format: data-scope-key="format", fallback to container-discs-total, fallback to label lookup
  let format = null;
  const formatMatch = content.match(/data-scope-key="format"[^>]*>([\s\S]*?)<\/a>/i);
  if (formatMatch) {
    format = decodeHtml(formatMatch[1]) || null;
  } else {
    const discsTotalMatch = content.match(/<div id="container-discs-total"[^>]*>([\s\S]*?)<\/div>/i);
    if (discsTotalMatch) {
      const parts = decodeHtml(discsTotalMatch[1]).split('|');
      const candidate = (parts[0] || '').trim();
      if (candidate && !/^\d+\s*disc/i.test(candidate)) {
        format = candidate;
      }
    }
  }
  if (!format) {
    format = decodeHtml(findField(content, ['Format', 'Formats'])) || null;
  }

  // Edition / Label: data-scope-key="label", fallback to label lookup
  let edition = null;
  const labelMatch = content.match(/data-scope-key="label"[^>]*>([\s\S]*?)<\/a>/i);
  if (labelMatch) {
    edition = decodeHtml(labelMatch[1]) || null;
  } else {
    edition = decodeHtml(findField(content, ['Edition', 'Release', 'Label'])) || null;
  }

  // Added at
  const addedAt = decodeHtml(findField(content, ['Added', 'Date Added', 'Added Date'])) || null;

  return {
    genres,
    styles,
    moods,
    format,
    edition,
    addedAt,
  };
}

function mergeAlbumMetadata(album, metadata, checkedAt) {
  return normalizeAlbum({
    ...album,
    genres: metadata.genres && metadata.genres.length ? metadata.genres : album.genres,
    styles: metadata.styles && metadata.styles.length ? metadata.styles : album.styles,
    moods: metadata.moods && metadata.moods.length ? metadata.moods : album.moods,
    format: metadata.format || album.format,
    edition: metadata.edition || album.edition,
    addedAt: metadata.addedAt || album.addedAt,
    detailCheckedAt: checkedAt || album.detailCheckedAt,
  });
}

function mergeExistingMetadata(album, existingAlbum) {
  if (!existingAlbum) return normalizeAlbum(album);
  return normalizeAlbum({
    ...album,
    genres: existingAlbum.genres,
    styles: existingAlbum.styles,
    moods: existingAlbum.moods,
    format: existingAlbum.format,
    edition: existingAlbum.edition,
    addedAt: existingAlbum.addedAt,
    detailCheckedAt: existingAlbum.detailCheckedAt,
  });
}

function selectAlbumsForEnrichment(albums, existingAlbums, limit) {
  const existingById = new Map((existingAlbums || []).map(album => [String(album.id), album]));
  return albums
    .filter(album => {
      const existing = existingById.get(String(album.id));
      return !existing || !existing.detailCheckedAt || !existing.format;
    })
    .slice(0, Math.max(0, Number(limit) || 0));
}

module.exports = {
  decodeHtml,
  parseDetailMetadata,
  mergeAlbumMetadata,
  mergeExistingMetadata,
  selectAlbumsForEnrichment,
};
