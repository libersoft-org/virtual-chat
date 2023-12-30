const fs = require('fs');
const path = require('path');
const Socket = require('./socket.js');
const { Common } = require('./common.js');

class WebServer {
 constructor() {
  this.socket = new Socket();
 }

 async run() {
  try {
   await this.startServer();
  } catch (ex) {
   Common.addLog('Cannot start web server.', 2);
   Common.addLog(ex, 2);
  }
 }

 async startServer() {
  const srv = {
   fetch: (req, server) => {
    let filePath = '/' + req.url.split('/').slice(3).join('/');
    let ip = req.headers.get('x-forwarded-for');
    if (!ip) ip = req.headers.get('x-real-ip');
    if (!ip) ip = server.requestIP(req) ? server.requestIP(req).address : 'unknown';
    Common.addLog(req.method + ' request from: ' + ip + ', URL: ' + filePath);
    if (server.upgrade(req)) return;
    return this.getFile(filePath);
   },
   websocket: {
    open: (ws) => this.socket.onOpen(ws),
    message: (ws, json) => this.socket.onMessage(ws, json),
    close: (ws, code, message) => this.socket.onClose(ws, code, message)
   }
  };
  if (Common.settings.web.standalone) srv.port = Common.settings.web.port;
  else srv.unix = Common.settings.web.socket_path;
  Bun.serve(srv);
  if (!Common.settings.web.standalone) fs.chmodSync(Common.settings.web.socket_path, '777');
  Common.addLog('Web server is running on ' + (Common.settings.web.standalone ? 'port: ' + Common.settings.web.port : 'Unix socket: ' + Common.settings.web.socket_path));
 }

 async getFile(urlPath) {
  const basePath = path.join(__dirname, Common.settings.web.client_path);
  const filePath = path.join(basePath, path.normalize(urlPath));
  if (!filePath.startsWith(basePath)) return this.getIndex();
  const file = Bun.file(filePath);
  if (!await file.exists()) return this.getIndex();
  else return new Response(file);
 };

 async getIndex() {
  const file = await Bun.file(path.join(__dirname, Common.settings.web.client_path, 'index.html')).text();
  return new Response(file, { headers: { 'Content-Type': 'text/html' }});
 }
}

module.exports = WebServer;
