const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const host = process.env.HOST || '0.0.0.0';
const port = Number(process.env.PORT) || 3000;
const publicDir = path.join(__dirname, 'public');

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8'
};

function sendFile(res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = contentTypes[ext] || 'application/octet-stream';

  fs.readFile(filePath, (error, data) => {
    if (error) {
      const notFound = error.code === 'ENOENT' || error.code === 'EISDIR';
      res.writeHead(notFound ? 404 : 500, {
        'Content-Type': 'text/plain; charset=utf-8'
      });
      res.end(notFound ? 'Not found' : 'Server error');
      return;
    }

    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  let requestUrl;
  let pathname;

  try {
    requestUrl = new URL(req.url || '/', `http://${host}:${port}`);
    pathname = decodeURIComponent(requestUrl.pathname);
  } catch {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Bad request');
    return;
  }

  const requestedPath = pathname === '/' ? '/index.html' : pathname;
  const relativePath = requestedPath.replace(/^[/\\]+/, '');
  const filePath = path.resolve(publicDir, relativePath);

  if (filePath !== publicDir && !filePath.startsWith(`${publicDir}${path.sep}`)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Forbidden');
    return;
  }

  sendFile(res, filePath);
});

server.listen(port, host, () => {
  console.log(`Static site running at http://${host}:${port}`);
});
