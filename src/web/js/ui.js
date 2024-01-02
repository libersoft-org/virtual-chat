class UI {
 constructor() {
  document.addEventListener('keydown', this.onKeyDown.bind(this), false);
 }
 
 onKeyDown(event) {
  if (event.key === 'Enter') {
   const message = qs('#message');
   if (!(document.activeElement === message)) {
    message.focus();
    return;
   }
   if (document.activeElement === message) {
    const chat = qs('#chat');
    chat.innerHTML += '<div><span class="bold">User</span>: ' + message.value + '</div>';
    chat.scrollTop = chat.scrollHeight;
    world.createChatBubble(message.value);
    message.value = '';
    return;
   }
  }
 }

 setColor(el, id) {
  const loginColor = qs('#login-color');
  loginColor.value = id;
  for (const col of qsa('#login .color-picker .color')) {
   if (col.classList.contains('active')) col.classList.remove('active');
  }
  el.classList.add('active');
 }

 enter() {
  if (!this.loading) {
   this.loading = true;
   qs('#enter').className = 'button gray';
   qs('#enter').innerHTML = '<div class="loader"></div>';
   let sex = qs('#login-sex').value;
   if (sex == '1') sex = true;
   else if (sex == '0') sex = false;
   else sex = null;
   net.setEnter(qs('#login-name').value, sex, qs('#login-color').value);
  }
 }

 leave() {
  net.setLeave();
 }

 removeLogin() {
  qs('#login').style.display = 'none';
 }

 setStatus(statusText, statusDot) {
  qs('#status .dot').className = 'dot ' + statusDot;
  qs('#status .text').innerHTML = statusText;
 }
}
