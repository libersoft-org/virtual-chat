let scene, camera, renderer, light, floor, user, targetPosition;
let chatBubble = null;
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const speed = 0.1;

const ws = new WebSocket('wss://yellownet.cz:443');
ws.onopen = function(event) {
 ws.send('WS connected');
};
ws.onmessage = function(event) {
 console.log('WS from server:', event.data);
};
ws.onerror = function(error) {
 console.error('WS error:', error);
};

init();

function init() {
 scene = new THREE.Scene();
 camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
 //console.log(camera.position);
 renderer = new THREE.WebGLRenderer({ antialias: true });
 renderer.setSize(window.innerWidth, window.innerHeight);
 document.body.appendChild(renderer.domElement);
 getLight();
 getFloor();
 getUser(0xFFE0AA);

 //const axesHelper = new THREE.AxesHelper(2);
 //scene.add(axesHelper);
 //const gridHelper = new THREE.GridHelper(100, 100);
 //scene.add(gridHelper);
 //const lightHelper = new THREE.DirectionalLightHelper(light, 5);
 //scene.add(lightHelper);

 camera.position.set(0, 10, 10);
 camera.lookAt(user.position);
 window.addEventListener('resize', onWindowResize, false);
 document.addEventListener('click', onDocumentClick, false);
 document.addEventListener('wheel', onDocumentWheel, false);
 targetPosition = new THREE.Vector3();
 animate();
}

function getLight() {
 light = new THREE.DirectionalLight(0xFFFFFF, 3);
 light.position.set(5, 10, 7.5);
 scene.add(light);
}

function getFloor() {
 let floorGeometry = new THREE.PlaneGeometry(20, 10);
 let floorMaterial = new THREE.MeshPhongMaterial({ color: 0x20A020, side: THREE.DoubleSide });
 floor = new THREE.Mesh(floorGeometry, floorMaterial);
 floor.rotation.x = -Math.PI / 2;
 scene.add(floor);
}

function getUser(color = 0x00FF00) {
 let geometry = new THREE.BoxGeometry();
 let material = new THREE.MeshPhongMaterial({ color: color });
 user = new THREE.Mesh(geometry, material);
 user.position.y = 0.5;
 scene.add(user);
}

function animate() {
 requestAnimationFrame(animate);
 moveUser();
 renderer.render(scene, camera);
}

function onWindowResize() {
 camera.aspect = window.innerWidth / window.innerHeight;
 camera.updateProjectionMatrix();
 renderer.setSize(window.innerWidth, window.innerHeight);
}

function onDocumentClick(event) {
 event.preventDefault();
 mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
 mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
 raycaster.setFromCamera(mouse, camera);
 let intersects = raycaster.intersectObject(floor);
 if (intersects.length > 0) {
  let point = intersects[0].point;
  //console.log(point);
  createDotAtPoint(point);
  moveUserToPoint(point);
 }
}

function createDotAtPoint(point) {
 let dotGeometry = new THREE.CircleGeometry(0.1, 10);
 let dotMaterial = new THREE.MeshBasicMaterial({ color: 0xFF0000 });
 let dot = new THREE.Mesh(dotGeometry, dotMaterial);
 dot.position.set(point.x, point.y, point.z);
 dot.rotation.x = -Math.PI / 2;
 scene.add(dot);
 setTimeout(() => {
  scene.remove(dot);
 }, 2000);
}

function onDocumentWheel(event) {
 event.preventDefault();
 camera.zoom += event.deltaY * -0.001;
 camera.zoom = Math.max(Math.min(camera.zoom, 3), 0.5);
 console.log('Zoom: ' + camera.zoom);
 camera.updateProjectionMatrix();
}

function moveUserToPoint(point) {
 let dx = point.x - user.position.x;
 let dz = point.z - user.position.z;
 user.rotation.y = Math.atan2(dz, dx) - Math.PI / 2;
 targetPosition.x = point.x;
 targetPosition.z = point.z;
 console.log(targetPosition.x, targetPosition.z);
 
}

function moveUser() {
 let dx = targetPosition.x - user.position.x;
 let dz = targetPosition.z - user.position.z;
 let distance = Math.sqrt(dx*dx + dz*dz);
 if (distance > 0.1) {
  let moveX = (dx / distance) * speed;
  let moveZ = (dz / distance) * speed;
  user.position.x += moveX;
  user.position.z += moveZ;
 }
 //camera.lookAt(user.position);
}

function createChatBubble(message) {
 if (chatBubble) scene.remove(chatBubble);
 let canvas = document.createElement('canvas');
 let context = canvas.getContext('2d');
 context.font = '40px Arial';
 context.fillText(message, 10, 30);
 let texture = new THREE.CanvasTexture(canvas);
 let material = new THREE.SpriteMaterial({ map: texture });
 chatBubble = new THREE.Sprite(material);
 chatBubble.position.set(user.position.x, user.position.y + 1.5, user.position.z);
 scene.add(chatBubble);
 setTimeout(() => {
  scene.remove(chatBubble);
  chatBubble = null;
 }, 10000);
}

function toggleMessage() {
 const messageBox = document.querySelector('#message-text');
 if (messageBox.style.display == 'none') {
  messageBox.style.display = 'block';
  messageBox.focus();
 }
 else messageBox.style.display = 'none';
}

function messageKeyPress(event) {
 if (event.key === 'Enter') {
  const input = document.querySelector('#message-text');
  createChatBubble(input.value);
  input.value = '';
  input.style.display = 'none';
 }
}
