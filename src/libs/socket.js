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
     case 'locations':
      this.getLocations(ws);
      break;
     default:
      this.send(ws, { error: 3, message: 'Unknown method in command' });
      break;
    }
   } else this.send(ws, { error: 2, message: 'Invalid command' });
  } catch (e) {
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
  const res = { method: 'enter' }
  if (this.users[ws.uuid]) {
   res.error = 1;
   res.message = 'User not in room';
  } else if (!'name' in data) {
   res.error = 2;
   res.message = 'Missing name';
  } else if (/^[A-Za-z0-9._-]{1,16}$/.test(data.name)) {
   res.error = 3;
   res.message = 'Wrong name format - can contain 3 - 16 characters, only letters, numbers, dot, dash or underscore';
  } else if (!'color' in data) {
   res.error = 4;
   res.message = 'Missing color';
  } else if (!Number.isInteger(data.color) || number < 1 || number > 6) {
   res.error = 5;
   res.message = 'Wrong color ID';
  } else if (!'sex' in data) {
   res.error = 6;
   res.message = 'Missing sex';
  } else if (data.sex == true || data.sex == false) {
   res.error = 7;
   res.message = 'Wrong sex ID';
  } else {
   res.error = 0;
   res.data = {
    connection: ws.uuid,
    name: data.name,
    color: data.color,
    sex: data.sex,
    x: 0,
    y: 0,
    angle: 0
   }
   this.users.push(res.data);
   this.broadcast(res);
  }
  if (res.error != 0) this.send(ws, res);
 }

 getExit(ws) {
  const res = { method: 'exit' }
  if (!this.users[ws.uuid]) {
   res.error = 1;
   res.message = 'User is not in room';
  } else {
   res.error = 0;
   res.data = { id: ws.uuid }
   this.broadcast(res);
   delete this.users[ws.uuid];
  }
  if (res.error != 0) this.send(ws, res);
 }

 getMove(ws, data) {
  const res = { method: 'move' }
  if (!this.users[ws.uuid]) {
   res.error = 1;
   res.message = 'User not in room';
  } else if (!'x' in data || !'y' in data) {
   res.error = 2;
   res.message = 'Missing coordinates';
  } else if (data.x < -10 || data.x > 10 || data.y < -5 || data.y > 5) {
   res.error = 3;
   res.message = 'Wrong coordinates';
  } else {
   res.error = 0;
   res.data = { user: ws.uuid, x: data.x, y: data.y }
   this.broadcast(res);
  }
  if (res.error != 0) this.send(ws, res);
 }

 getMessage(ws, data) {
  const res = { method: 'message' }
  if (!this.users[ws.uuid]) {
   res.error = 1;
   res.message = 'User not in room';
  } else if (!'message' in data) {
   res.error = 2;
   res.message = 'Missing message';
  } else {
   res.error = 0;
   res.data = { name: this.users[uuid].name, message: data.message }
   this.broadcast(res);
  }
  if (res.error != 0) this.send(ws, res);
 }

 getLocations(ws) {
  const res = { method: 'locations' }
  res.error = 0;
  res.data = this.users;
  this.send(res);
 }
}

module.exports = Socket;
