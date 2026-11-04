const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');
const port = 55095;
const url = `http://127.0.0.1:${port}/`;
function ready() {
  return new Promise(resolve => {
    const req = http.get(url, { timeout: 800 }, res => {
      let text = ''; res.setEncoding('utf8');
      res.on('data', chunk => text += chunk);
      res.on('end', () => resolve(res.statusCode === 200 && text.includes('<title>Alani')));
    });
    req.on('timeout', () => req.destroy()); req.on('error', () => resolve(false));
  });
}
if (!process.argv.includes('--serve')) {
  (async () => {
    if (!await ready()) {
      const child = spawn(process.execPath, [__filename, '--serve'], { cwd: __dirname, detached: true, windowsHide: true, stdio: 'ignore' });
      child.unref();
    }
    for (let i = 0; i < 40; i++) {
      if (await ready()) {
        console.log(url);
        if (!process.argv.includes('--no-open')) {
          const opener = spawn('powershell.exe', ['-NoProfile', '-Command', `Start-Process '${url}'`], { windowsHide: true, detached: true, stdio: 'ignore' });
          opener.unref();
        }
        return;
      }
      await new Promise(resolve => setTimeout(resolve, 150));
    }
    throw new Error('Cannot start Alani on port 55095.');
  })().catch(error => { console.error(error.message); process.exitCode = 1; });
} else {
  const root = __dirname;
  const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.ttf': 'font/ttf', '.woff2': 'font/woff2' };
  const server = http.createServer((req, res) => {
    let relative;
    try { relative = decodeURIComponent(new URL(req.url, url).pathname).replace(/^\/+/, '') || 'index.html'; }
    catch { res.writeHead(400).end(); return; }
    const file = path.resolve(root, relative);
    if (!file.startsWith(root + path.sep) || !(['index.html', 'styles.css', 'app.js'].includes(relative) || relative.startsWith('assets/'))) { res.writeHead(404).end(); return; }
    fs.readFile(file, (error, data) => { if (error) { res.writeHead(404).end(); return; } res.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream'); res.end(data); });
  });
  server.on('error', error => { console.error(error.message); process.exitCode = 1; });
  server.listen(port, '127.0.0.1');
}
