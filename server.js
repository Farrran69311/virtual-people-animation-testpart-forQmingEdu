const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const ROOT = __dirname;
const PORT = Number(process.env.PORT || 4173);
const VRM_FILE = 'QmingVirtualPeopleTestVersion1.0.vrm';
const MOTION_DIRS = ['1', '2', '3', '4'];
const BACKGROUND_DIR = 'background';

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.vrm': 'model/gltf-binary',
  '.glb': 'model/gltf-binary',
  '.gltf': 'model/gltf+json',
  '.fbx': 'application/octet-stream',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

function buildMotionList() {
  const items = [];

  for (const dirName of MOTION_DIRS) {
    const dirPath = path.join(ROOT, dirName);
    if (!fs.existsSync(dirPath)) continue;

    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isFile()) continue;
      if (path.extname(entry.name).toLowerCase() !== '.fbx') continue;

      const relativePath = `${dirName}/${entry.name}`;
      items.push({
        name: entry.name.replace(/\.fbx$/i, ''),
        fileName: entry.name,
        group: dirName,
        path: `/${encodeURI(relativePath).replace(/#/g, '%23')}`,
      });
    }
  }

  items.sort((a, b) => {
    const groupCompare = a.group.localeCompare(b.group, 'en');
    if (groupCompare !== 0) return groupCompare;
    return a.fileName.localeCompare(b.fileName, 'en', { numeric: true, sensitivity: 'base' });
  });

  return items;
}

const motionList = buildMotionList();

function buildBackgroundList() {
  const dirPath = path.join(ROOT, BACKGROUND_DIR);
  if (!fs.existsSync(dirPath)) return [];

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  const items = entries
    .filter((entry) => entry.isFile())
    .filter((entry) => ['.glb', '.gltf'].includes(path.extname(entry.name).toLowerCase()))
    .map((entry) => {
      const relativePath = `${BACKGROUND_DIR}/${entry.name}`;
      return {
        name: entry.name.replace(/\.(glb|gltf)$/i, ''),
        fileName: entry.name,
        path: `/${encodeURI(relativePath).replace(/#/g, '%23')}`,
      };
    });

  items.sort((a, b) => a.fileName.localeCompare(b.fileName, 'zh-CN', { numeric: true, sensitivity: 'base' }));
  return items;
}

function sendJson(res, statusCode, data) {
  const body = JSON.stringify(data, null, 2);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  res.end(body);
}

function sendFile(res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.stat(filePath, (statError, stat) => {
    if (statError || !stat.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not Found');
      return;
    }

    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': stat.size,
      'Cache-Control': ext === '.html' ? 'no-store' : 'public, max-age=300',
      'Access-Control-Allow-Origin': '*',
    });

    const stream = fs.createReadStream(filePath);
    stream.on('error', () => {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('File Read Error');
    });
    stream.pipe(res);
  });
}

function safePathFromUrl(requestUrl) {
  const url = new URL(requestUrl, `http://localhost:${PORT}`);
  let pathname = decodeURIComponent(url.pathname);
  if (pathname === '/') pathname = '/index.html';

  const normalized = path.normalize(pathname.replace(/^\/+/, ''));
  const rootResolved = path.resolve(ROOT);
  const absolute = path.resolve(ROOT, normalized);
  const relativeToRoot = path.relative(rootResolved, absolute);

  if (relativeToRoot.startsWith('..') || path.isAbsolute(relativeToRoot)) return null;
  return { absolute, pathname };
}

const server = http.createServer((req, res) => {
  if (!req.url) {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Bad Request');
    return;
  }

  const url = new URL(req.url, `http://localhost:${PORT}`);

  if (url.pathname === '/api/motions') {
    const backgroundList = buildBackgroundList();
    sendJson(res, 200, {
      vrm: `/${encodeURI(VRM_FILE)}`,
      total: motionList.length,
      motions: motionList,
      backgrounds: backgroundList,
    });
    return;
  }

  if (url.pathname === '/api/health') {
    const backgroundList = buildBackgroundList();
    sendJson(res, 200, { ok: true, total: motionList.length, backgrounds: backgroundList.length });
    return;
  }

  const resolved = safePathFromUrl(req.url);
  if (!resolved) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Forbidden');
    return;
  }

  sendFile(res, resolved.absolute);
});

server.listen(PORT, () => {
  console.log(`VRM preview server: http://127.0.0.1:${PORT}`);
  console.log(`Motion files indexed: ${motionList.length}`);
});
