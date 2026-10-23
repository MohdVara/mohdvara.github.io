// Local static-host model for recovery QA: nearest ancestor 404, never SPA 200.
// Cloudflare itself is additionally checked with Wrangler when available.
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, dirname, sep } from 'node:path';
const root = resolve('dist');
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.json': 'application/json', '.woff2': 'font/woff2', '.webp': 'image/webp', '.png': 'image/png' };
const server = createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    let path = resolve(root, '.' + pathname), status = 200;
    if (!path.startsWith(root + sep) && path !== root) throw Error('outside root');
    if (pathname.startsWith('/__qa__/')) {
      const fixtures = resolve('output/playwright/404-experience-v1');
      path = resolve(fixtures, pathname.slice(8));
      if (!path.startsWith(fixtures + sep)) throw Error('outside fixtures');
      const body = await readFile(path);
      res.writeHead(200, {'Content-Type':types[extname(path)] || 'application/octet-stream','Cache-Control':'no-store'});
      res.end(body); return;
    }
    try { if ((await stat(path)).isDirectory()) path += '/index.html'; await stat(path); }
    catch {
      status = 404;
      let parent = dirname(resolve(root, '.' + pathname));
      while (true) {
        path = resolve(parent, '404.html');
        try { await stat(path); break; } catch { /* Try the ancestor. */ }
        if (parent === root) throw Error('root fallback missing');
        parent = dirname(parent);
      }
    }
    res.writeHead(status, { 'Content-Type': types[extname(path)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(await readFile(path));
  } catch { res.writeHead(404); res.end('Not found'); }
});
server.listen(Number(process.env.PORT || 4191), '127.0.0.1', () => console.log('Static 404 preview on http://127.0.0.1:' + (process.env.PORT || 4191)));
