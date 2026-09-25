(function initNewsFeed(root, factory) {
  const api = factory();
  const isCommonJS = typeof module === 'object' && module.exports;
  if (isCommonJS) {
    module.exports = api;
  } else if (root) {
    root.NewsFeed = api;
  }
}(typeof globalThis !== 'undefined' ? globalThis : null, function createNewsFeed() {
  const CATEGORIES = [
    { id: 'general', label: '🔥 Top Tech', description: 'Top stories from Hacker News' },
    { id: 'ai', label: '🤖 IA & LLMs', description: 'Artificial Intelligence, LLMs, agents & machine learning' },
    { id: 'security', label: '🛡️ Ciberseguridad', description: 'Cybersecurity, vulnerabilities, CVEs & malware' },
    { id: 'dev', label: '💻 Dev & Open Source', description: 'Software engineering, programming languages and open source' },
  ];

  function getDomain(url) {
    if (!url || typeof url !== 'string') return 'news.ycombinator.com';
    try {
      const parsed = new URL(url);
      return parsed.hostname.replace(/^www\./i, '');
    } catch {
      return 'news.ycombinator.com';
    }
  }

  function timeAgo(unixTimestamp, nowTimestamp = Math.floor(Date.now() / 1000)) {
    const s = Math.max(0, nowTimestamp - Number(unixTimestamp || 0));
    if (s < 60) return `${s}s ago`;
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
    return `${Math.floor(s / 86400)}d ago`;
  }

  function normalizeAlgoliaHit(hit) {
    if (!hit || typeof hit !== 'object') return null;
    const id = hit.objectID ? String(hit.objectID) : '';
    const title = typeof hit.title === 'string' ? hit.title.trim() : '';
    if (!id || !title) return null;

    const hnUrl = `https://news.ycombinator.com/item?id=${encodeURIComponent(id)}`;
    const url = (typeof hit.url === 'string' && hit.url.trim()) ? hit.url.trim() : hnUrl;
    const points = Number.isFinite(hit.points) ? hit.points : 0;
    const comments = Number.isFinite(hit.num_comments) ? hit.num_comments : 0;
    const time = Number.isFinite(hit.created_at_i) ? hit.created_at_i : Math.floor(Date.now() / 1000);

    return {
      id,
      title,
      url,
      hnUrl,
      source: 'hn',
      sourceLabel: 'Hacker News',
      domain: getDomain(url),
      points,
      comments,
      time,
    };
  }

  function normalizeFirebaseStory(item) {
    if (!item || typeof item !== 'object') return null;
    const id = item.id != null ? String(item.id) : '';
    const title = typeof item.title === 'string' ? item.title.trim() : '';
    if (!id || !title) return null;

    const hnUrl = `https://news.ycombinator.com/item?id=${encodeURIComponent(id)}`;
    const url = (typeof item.url === 'string' && item.url.trim()) ? item.url.trim() : hnUrl;
    const points = Number.isFinite(item.score) ? item.score : 0;
    const comments = Number.isFinite(item.descendants) ? item.descendants : 0;
    const time = Number.isFinite(item.time) ? item.time : Math.floor(Date.now() / 1000);

    return {
      id,
      title,
      url,
      hnUrl,
      source: 'hn',
      sourceLabel: 'Hacker News',
      domain: getDomain(url),
      points,
      comments,
      time,
    };
  }

  function normalizeDevToArticle(item) {
    if (!item || typeof item !== 'object') return null;
    const id = item.id != null ? String(item.id) : '';
    const title = typeof item.title === 'string' ? item.title.trim() : '';
    const url = typeof item.url === 'string' ? item.url.trim() : '';
    if (!id || !title || !url) return null;

    const points = Number.isFinite(item.public_reactions_count)
      ? item.public_reactions_count
      : (Number.isFinite(item.positive_reactions_count) ? item.positive_reactions_count : 0);
    const comments = Number.isFinite(item.comments_count) ? item.comments_count : 0;
    const time = item.published_timestamp
      ? Math.floor(new Date(item.published_timestamp).getTime() / 1000)
      : (item.published_at ? Math.floor(new Date(item.published_at).getTime() / 1000) : Math.floor(Date.now() / 1000));

    return {
      id: `devto-${id}`,
      title,
      url,
      hnUrl: url,
      source: 'devto',
      sourceLabel: 'Dev.to',
      domain: getDomain(url),
      points,
      comments,
      time,
    };
  }

  function mergeAndDeduplicate(...lists) {
    const seenUrls = new Set();
    const seenTitles = new Set();
    const result = [];

    function cleanTitle(t) {
      return (t || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    }

    for (const list of lists) {
      if (!Array.isArray(list)) continue;
      for (const item of list) {
        if (!item || !item.title) continue;
        const normalizedUrl = (item.url || '').toLowerCase().replace(/\/+$/, '');
        const titleKey = cleanTitle(item.title);

        if (normalizedUrl && seenUrls.has(normalizedUrl)) continue;
        if (titleKey && titleKey.length > 10 && seenTitles.has(titleKey)) continue;

        if (normalizedUrl) seenUrls.add(normalizedUrl);
        if (titleKey) seenTitles.add(titleKey);
        result.push(item);
      }
    }

    return result.sort((a, b) => (b.time || 0) - (a.time || 0));
  }

  function getCategory(categoryId) {
    return CATEGORIES.find(c => c.id === categoryId) || CATEGORIES[0];
  }

  return {
    CATEGORIES,
    getCategory,
    getDomain,
    timeAgo,
    normalizeAlgoliaHit,
    normalizeFirebaseStory,
    normalizeDevToArticle,
    mergeAndDeduplicate,
  };
}));
