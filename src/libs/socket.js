const { Common } = require('./common.js');

class Socket {
 constructor() {
  this.connections = {};
 }

 onOpen(ws) {
  const uuid = crypto.randomUUID();
  Common.addLog('WS new connection: ' + uuid);
  ws.uuid = uuid;
  this.connections[uuid] = { ws: ws };
  this.count();
 }

 onClose(ws, message) {
  Common.addLog('WS connection closed: ' + ws.uuid);
  if (this.connections[ws.uuid].name) this.leave(ws.uuid);
  delete this.connections[ws.uuid];
  this.count();
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
     case 'leave':
      this.getLeave(ws);
      break;
     case 'move':
      this.getMove(ws, msg.data);
      break;
     case 'message':
      this.getMessage(ws, msg.data);
      break;
     case 'users':
      this.getUsers(ws);
      break;
     default:
      this.send(ws, { method: msg.method, error: 3, message: 'Unknown method in command' });
      break;
    }
   } else this.send(ws, { error: 2, message: 'Invalid command' });
  } catch (e) {
   console.log(e);
   this.send(ws, { error: 1, message: 'Invalid JSON' });
  }
 }

 send(ws, obj) {
  ws.send(JSON.stringify(obj));
 }

 broadcast(obj) {
  for (const conn of Object.values(this.connections)) {
   //console.log(ws);
   conn.ws.send(JSON.stringify(obj));
  }
 }

 count() {
  Common.addLog('WS connections: ' + Object.keys(this.connections).length);
  let users = 0;
  for (const c in this.connections) if (this.connections[c].user) users++;
  Common.addLog('WS users: ' + users);
 }

 leave(uuid) {
  this.broadcast({
   method: 'leave',
   error: 0,
   data: { uuid: uuid }
  });
  delete this.connections[ws.uuid].user;
  this.count();
 }

 getEnter(ws, data) {
  const res = { method: 'enter' }
  if (this.connections[ws.uuid].user) {
   res.error = 1;
   res.message = 'User is already in room';
  } else if (!'name' in data) {
   res.error = 2;
   res.message = 'Missing name';
  } else if (!/^[A-Za-z0-9._-]{3,16}$/.test(data.name.trim())) {
   res.error = 3;
   res.message = 'Wrong name format - can contain 3 - 16 characters, only letters, numbers, dot, dash or underscore';
  } else if (!'sex' in data) {
   res.error = 6;
   res.message = 'Missing sex';
  } else if (data.sex != true && data.sex != false) {
   res.error = 7;
   res.message = 'Wrong sex value';
  } else if (!'color' in data) {
   res.error = 4;
   res.message = 'Missing color';
  } else if (!Number.isInteger(data.color) || data.color < 1 || data.color > 8) {
   res.error = 5;
   res.message = 'Wrong color ID';
  } else {
   res.error = 0;
   res.data = {
    name: data.name.trim(),
    color: data.color,
    sex: data.sex,
    x: 0,
    y: 0,
    angle: 0
   }
   this.connections[ws.uuid].user = res.data;
   this.count();
   this.broadcast(res);
  }
  if (res.error != 0) this.send(ws, res);
 }

 getLeave(ws) {
  if (!this.connections[ws.uuid].user) {
   res.method = 'leave';
   res.error = 1;
   res.message = 'User is not in room';
   this.send(ws, res);
  } else this.leave(ws.uuid);
 }

 getMove(ws, data) {
  const res = { method: 'move' }
  if (!this.connections[ws.uuid].user) {
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
  if (!this.connections[ws.uuid].user) {
   res.error = 1;
   res.message = 'User not in room';
  } else if (!'message' in data) {
   res.error = 2;
   res.message = 'Missing message';
  } else if (data.message.trim() == '') {
    res.error = 2;
    res.message = 'Message is empty';
  } else {
   res.error = 0;
   res.data = { name: this.connections[ws.uuid].user.name, message: data.message.trim() }
   this.broadcast(res);
  }
  if (res.error != 0) this.send(ws, res);
 }

 getUsers(ws) {
  const res = { method: 'locations' }
  res.error = 0;
  const users = [];
  for (const c of this.connections) if (c.user) users.push(c.user);
  res.data = users;
  this.send(ws, res);
 }
}

module.exports = Socket;
