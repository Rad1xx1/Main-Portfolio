const {spawn} = require('node:child_process');
const path = require('node:path');
const net = require('node:net');
function ensureServer() {
  const probe = net.connect(8882, '127.0.0.1');
  probe.on('connect', () => probe.end());
  probe.on('error', () => {
    const child = spawn(process.execPath, [path.join(__dirname, 'server.cjs')], {cwd:__dirname,windowsHide:true,stdio:'ignore',env:{...process.env,PORT:'8882'}});
    child.on('error', () => {});
  });
}
ensureServer();
setInterval(ensureServer, 15000);
