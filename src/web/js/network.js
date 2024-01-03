class Network {
 constructor(url) {
  this.ws = new WebSocket(url);
  this.ws.onopen = (e) => {
   ui.setStatus('Connected', 'green');
   console.log('WS connected:', e);
  };
 
  this.ws.onmessage = (e) => {
   console.log('WS from server:', e.data);
   const res = JSON.parse(e.data);
   if (res.error === 0) {
    switch (res.method) {
     case 'enter':
      this.getEnter(res.data);
      break;
     case 'leave':
      this.getLeave(res.data);
      break;
     case 'move':
      this.getMove(res.data);
      break;
     case 'message':
      this.getMessage(res.data);
      break;
     case 'users':
      this.getUsers(res.data);
      break;
     default:
      console.error('ERROR:' + "\n\n" + 'Method: ' + res.method + "\n" + 'Message: Unknown method from server');  
    }
   } else {
    console.error('ERROR:' + "\n\n" + 'Method: ' + res.method + "\n" + 'Code: ' + res.error + "\n" + 'Message: ' + res.message);
   }
  };
 
  this.ws.onerror = (e) => {
   console.error('WS error:', e);
  };
 
  this.ws.onclose = (e) => {
   ui.setStatus('Disconnected', 'red');
   console.log('WS close:', e);
  }
 }

 connect(url) {
  this.ws.connect(url);
 }

 send(obj) {
  this.ws.send(JSON.stringify(obj));
 }
 
 setEnter(name, sex, color) {
  console.log('SET ENTER');
  console.log(name, sex, parseInt(color));
  this.send({
   method: 'enter',
   data: {
    name: name,
    sex: sex,
    color: parseInt(color)
   }
  });
 }

 getEnter(res) {
  console.log('GET ENTER');
  console.log(res);
  ui.removeLogin();
  world.getUser(res.name, res.sex, res.color, res.x, res.y, res.angle);
 }

 setLeave() {
  this.send({ method: 'leave' });
 }

 getLeave() {
  console.log('GET LEAVE');
 }

 getMove(res) {
  console.log('GET MOVE');
  console.log(res);
 }

 setMessage(text) {
  console.log('SET MESSAGE');
  console.log(message);
  this.send({
   method: 'message',
   data: { message: text }
  });
 }

 getMessage(res) {
  console.log('GET MESSAGE');
  console.log(res);
  ui.showMessage(res.name, res.message);
 }

 getUsers(res) {
  console.log('GET USERS');
  console.log(res);
 }
}
