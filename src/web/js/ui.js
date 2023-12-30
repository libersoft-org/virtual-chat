class UI {
 constructor() {
  document.addEventListener('keydown', this.onKeyDown.bind(this), false);
 }
 
 onKeyDown(event) {
  if (event.key === 'Enter') {
   const message = document.querySelector('#message');
   if (!(document.activeElement === message)) {
    message.focus();
    return;
   }
   if (document.activeElement === message) {
    const chat = document.querySelector('#chat');
    chat.innerHTML += '<div><span class="bold">User</span>: ' + message.value + '</div>';
    chat.scrollTop = chat.scrollHeight;
    world.createChatBubble(message.value);
    message.value = '';
    return;
   }
  }
 }

 setStatus(statusText, statusDot) {
  document.querySelector('#status .dot').className = 'dot ' + statusDot;
  document.querySelector('#status .text').innerHTML = statusText;
 }
}
