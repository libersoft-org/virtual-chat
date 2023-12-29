const fs = require('fs');
const path = require('path');
const { Elysia } = require('elysia');
//const { ip } = require('elysia-ip');
const { Common } = require('./common.js');

class WebServer {
 async run() {
  try {
   await this.startServer();
  } catch (ex) {
   Common.addLog('Cannot start web server.', 2);
   Common.addLog(ex, 2);
  }
 }

 async startServer() {
  const app = new Elysia()
   //.use(ip())
   .onRequest((req) => {
    //console.log(ip);
    let url = '/' + req.request.url.split('/').slice(3).join('/');
    Common.addLog(req.request.method + ' request from: ' + req.request.headers.get('cf-connecting-ip') + ' (' + (req.request.headers.get('cf-ipcountry') + ')') + ', URL: ' + url);
   })
   .ws('/', {
    message(ws, message) {
     Common.addLog(message);
     ws.send(message);
    }
   })
   //.get('/*', async ({ ip, req }) => this.getFile(ip, req))
   .get('/*', async (req) => this.getFile(req));
  const server = { fetch: app.fetch };
  if (Common.settings.web.standalone) server.port = Common.settings.web.port;
  else server.unix = Common.settings.web.socket_path;
  Bun.serve(server);
  if (!Common.settings.web.standalone) fs.chmodSync(Common.settings.web.socket_path, '777');
  Common.addLog('Web server is running on ' + (Common.settings.web.standalone ? 'port: ' + Common.settings.web.port : 'Unix socket: ' + Common.settings.web.socket_path));
 }

 async getIndex(req) {
 //async getIndex(ip, req) {
  //console.log(ip);
  const content = await Bun.file(path.join(__dirname, '../web/index.html')).text();
  return new Response(content, { headers: { 'Content-Type': 'text/html' }});
 }

 async getFile(req) {
  const file = Bun.file(path.join(__dirname, '../web/', req.path));
  if (!await file.exists()) return this.getIndex(req);
  else return new Response(file);
 };
}

module.exports = WebServer;
