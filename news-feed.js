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
      domain: getDomain(url),
      points,
      comments,
      time,
    };
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
  };
}));
