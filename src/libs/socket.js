const { Common } = require('./common.js');

class Socket {
 constructor() {
  this.connections = {};
  this.users = {};
 }

 onOpen(ws) {
  const uuid = crypto.randomUUID();
  Common.addLog('WS new connection: ' + uuid);
  ws.uuid = uuid;
  this.connections[uuid] = ws;
  Common.addLog('WS connections: ' + Object.keys(this.connections).length);
 }

 onClose(ws, message) {
  Common.addLog('WS connection closed: ' + ws.uuid);
  delete this.connections[ws.uuid];
  Common.addLog('WS connections: ' + Object.keys(this.connections).length);
 }

 onMessage(ws, json) {
  try {
   const msg = JSON.parse(json);
   console.log(ws.uuid, msg);
   if ('method' in msg && 'data' in msg) {
    switch(msg.method) {
     case 'enter':
      this.getEnter(ws, msg.data);
      break;
     case 'exit':
      this.getExit(ws);
      break;
     case 'move':
      this.getMove(ws, msg.data);
      break;
     case 'message':
      this.getMessage(ws, msg.data);
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
  for(const ws of Object.values(this.connections)) ws.send(JSON.stringify(obj));
 }

 getEnter(ws, data) {
  // TODO: check if not already in room
  if (!'name' in data) return this.send(ws, { method: 'enter', error: 2, message: 'Missing name' });
  // TODO: check name validaty
  if (!'color' in data) return this.send(ws, { method: 'enter', error: 4, message: 'Missing color' });
  if (!Number.isInteger(data.color) || number < 1 || number > 6) return this.send(ws, { method: 'enter', error: 5, message: 'Wrong color ID' });
  if (!'sex' in data) return this.send(ws, { method: 'enter', error: 6, message: 'Missing sex' });
  if (!Number.isInteger(data.sex) || number < 0 || number > 4) return this.send(ws, { method: 'enter', error: 7, message: 'Wrong sex ID' });
  // TODO: enter 
 }

 getExit(ws) {
  // TODO: check if in room - if not, throw an error
  // TODO: exit room
 }

 getMove(ws, data) {
  // TODO: check if in room - if not, throw an error
  if ('x' in data && 'y' in data) return this.send(ws, { method: 'move', error: 2, message: 'Missing coordinates' });
  this.broadcast({
   method: 'move',
   data: {
    user: ws.uuid,
    x: data.x,
    y: data.y
   }
  });
 }

 getMessage(ws, data) {
  // TODO: check if in room - if not, throw an error
  if (!'message' in data) return this.send(ws, { method: 'message', error: 2, message: 'Missing message' });
  // TODO: check if ID exists and then set a name
  const name = 'User';
  this.broadcast({
   method: 'message',
   data: {
    name: name,
    message: data.message,
   }
  });
 }
}

module.exports = Socket;
