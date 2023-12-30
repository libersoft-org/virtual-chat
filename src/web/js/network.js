class Network {
 constructor(url) {
  this.ws = new WebSocket(url);
  this.ws.onopen = function(event) {
   ui.setStatus('Connected', 'green');
   console.log('WS connected:', event);
  };
 
  this.ws.onmessage = function(event) {
   console.log('WS from server:', event.data);
  };
 
  this.ws.onerror = function(error) {
   console.error('WS error:', error);
  };
 
  this.ws.onclose = function(event) {
   ui.setStatus('Disconnected', 'red');
   console.log('WS close:', event);
  }
 }

 connect(url) {
  this.ws.connect(url);
 }

 sendMessage(obj) {
  this.ws.send(JSON.stringify(obj));
 }
}
