const fs = require('fs');
const http = require('http');
const path = require('path');

const ROOT = __dirname;
const DEFAULT_PORT = Number(process.env.PORT) || 4173;
const MAX_PORT_ATTEMPTS = process.env.PORT ? 1 : 20;

const MIME_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
};

const STATIC_FILES = new Set([
  'index.html',
  'morning-dashboard.html',
  'clz-radar.js',
  'dashboard.js',
  'styles.css',
  'music-collection.json',
]);

function withCors(headers = {}) {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,HEAD,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    ...headers,
  };
}

function sendJson(res, status, payload) {
  res.writeHead(status, withCors({ 'Content-Type': 'application/json; charset=utf-8' }));
  res.end(`${JSON.stringify(payload)}\n`);
}

function sendText(res, status, text) {
  res.writeHead(status, withCors({ 'Content-Type': 'text/plain; charset=utf-8' }));
  res.end(text);
}

function resolveStaticPath(urlPath) {
  const parsed = new URL(urlPath, 'http://localhost');
  const pathname = decodeURIComponent(parsed.pathname);
  const fileName = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');

  if (!STATIC_FILES.has(fileName)) return null;

  const target = path.resolve(ROOT, fileName);
  if (!target.startsWith(ROOT)) return null;
  return target;
}

async function handleRequest(req, res) {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, withCors());
    res.end();
    return;
  }

  if (req.url === '/api/clz/health' && req.method === 'GET') {
    sendJson(res, 200, { ok: true });
    return;
  }

  if (!['GET', 'HEAD'].includes(req.method)) {
    sendText(res, 405, 'Method not allowed');
    return;
  }

  const filePath = resolveStaticPath(req.url);
  if (!filePath) {
    sendText(res, 404, 'Not found');
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      sendText(res, 404, 'Not found');
      return;
    }

    const ext = path.extname(filePath);
    res.writeHead(200, withCors({
      'Content-Type': MIME_TYPES[ext] || 'application/octet-stream',
      'Cache-Control': ext === '.json' ? 'no-store' : 'no-cache',
    }));
    if (req.method === 'HEAD') {
      res.end();
    } else {
      res.end(data);
    }
  });
}

function listen(port, remainingAttempts) {
  const server = http.createServer((req, res) => {
    handleRequest(req, res).catch(err => {
      sendJson(res, 500, { ok: false, error: err.message || String(err) });
    });
  });

  server.on('error', err => {
    if (err.code === 'EADDRINUSE' && remainingAttempts > 1) {
      listen(port + 1, remainingAttempts - 1);
      return;
    }
    throw err;
  });

  server.listen(port, '127.0.0.1', () => {
    console.log(`Morning Dashboard running at http://127.0.0.1:${port}/`);
  });
}

listen(DEFAULT_PORT, MAX_PORT_ATTEMPTS);
