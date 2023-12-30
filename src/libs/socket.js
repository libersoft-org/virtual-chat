const { Common } = require('./common.js');

class Socket {
 constructor() {
  this.sockets = {};
 }

 onOpen(ws) {
  const uuid = crypto.randomUUID();
  Common.addLog('WS new connection: ' + uuid);
  ws.uuid = uuid;
  this.sockets[uuid] = ws;
  Common.addLog('WS connections: ' + Object.keys(this.sockets).length);
 }

 onClose(ws, message) {
  Common.addLog('WS connection closed: ' + ws.uuid);
  delete this.sockets[ws.uuid];
  Common.addLog('WS connections: ' + Object.keys(this.sockets).length);
 }
 
 onMessage(ws, json) {
  try {
   const msg = JSON.parse(json);
   console.log(ws.uuid, msg);
   if ('method' in msg && 'data' in msg) {
    switch(msg.method) {
     case 'move':
      this.getMove(ws, msg.data);
      break;
     default:
      this.send(ws, { error: 3, message: 'Unknown method in command' });
      break;
    }
   } else this.send(ws, { error: 2, message: 'Invalid command' });
  } catch (e) {
   //console.log(e);
   this.send(ws, { error: 1, message: 'Invalid JSON' });
  }
 }

 send(ws, obj) {
  ws.send(JSON.stringify(obj));
 }

 broadcast(obj) {
  console.log('BROADCASTING');
  Common.addLog('WS CONNECTIONS: ' + Object.keys(this.sockets).length);
  for(const ws of Object.values(this.sockets)) {
   console.log('Sending to:', ws.uuid);
   ws.send(JSON.stringify(obj));
  }
 }

 getMove(ws, data) {
  if ('x' in data && 'y' in data) {
   this.broadcast({
    method: 'move',
    data: {
     user: ws.uuid,
     x: data.x,
     y: data.y
    }
   });
  } else this.send(ws, { error: 4, message: 'Missing coordinates' });
 }
}

module.exports = Socket;
