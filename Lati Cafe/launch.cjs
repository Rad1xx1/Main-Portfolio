const {spawn} = require('node:child_process');
const path = require('node:path');
const url = 'http://127.0.0.1:8882/';
async function ready() {
  try {
    const r = await fetch(url, {signal: AbortSignal.timeout(1000)});
    return r.ok && (await r.text()).includes('Lati Cafe — кофе');
  } catch { return false; }
}
(async () => {
  if (!await ready()) {
    const server = spawn(process.execPath, [path.join(__dirname, 'server.cjs')], {
      cwd: __dirname, detached: true, windowsHide: true, stdio: 'ignore',
      env: {...process.env, PORT: '8882'}
    });
    server.unref();
    let started = false;
    for (let attempt = 0; attempt < 30; attempt++) {
      if (await ready()) { started = true; break; }
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    if (!started) throw new Error('Lati Cafe could not start on port 8882.');
  }
  const browser = spawn('explorer.exe', [url], {detached:true, windowsHide:true, stdio:'ignore'});
  browser.unref();
  console.log('Lati Cafe: ' + url);
})().catch(error => { console.error(error.message); process.exitCode = 1; });
