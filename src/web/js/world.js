class World {
 constructor() {
  this.scene = new THREE.Scene();
  this.clock = new THREE.Clock();
  this.delta = 0;
  this.renderer = new THREE.WebGLRenderer({ antialias: true });
  this.renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(this.renderer.domElement);
  this.getLight();
  this.getFloor();
  //this.getUser();
  //this.getHelpers();
  this.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
  this.camera.position.set(0, 10, 10);
  this.camera.lookAt(this.scene.position);
  //console.log(this.camera.position);
  window.addEventListener('resize', this.onWindowResize.bind(this), false);
  document.addEventListener('wheel', this.onDocumentWheel.bind(this), false);
  document.addEventListener('click', this.onDocumentClick.bind(this), false);
  //document.addEventListener('mousemove', this.onDocumentMouseMove.bind(this), false);
  this.targetPosition = new THREE.Vector3();
  this.update = this.update.bind(this);
  this.update();
 }

 update() {
  requestAnimationFrame(this.update)
  this.delta = this.clock.getDelta();
  this.moveUser(); // TODO: move only if not standing
  if (this.light.position.x < -10) this.lightDirectionX = true;
  if (this.light.position.x > 10) this.lightDirectionX = false;
  if (this.light.position.z < -5) this.lightDirectionZ = true;
  if (this.light.position.z > 5) this.lightDirectionZ = false;
  this.light.position.set(this.lightDirectionX ? this.light.position.x + 0.05 : this.light.position.x - 0.05, this.light.position.y,this.lightDirectionZ ? this.light.position.z + 0.05 : this.light.position.z - 0.05);
  const lightHelper = new THREE.DirectionalLightHelper(this.light, 2);
  this.scene.add(lightHelper);
  this.renderer.render(this.scene, this.camera);
  this.scene.remove(lightHelper);
 }

 getHelpers() {
  const axesHelper = new THREE.AxesHelper(2);
  this.scene.add(axesHelper);
  const gridHelper = new THREE.GridHelper(100, 100);
  this.scene.add(gridHelper);
 }

 getLight() {
  this.light = new THREE.DirectionalLight(0xFFFFFF, 4);
  this.light.position.set(0, 5, 0);
  this.light.castShadow = true;
  this.scene.add(this.light);
 }

 getFloor() {
  const x = 20;
  const y = 10;
  const tl = new THREE.TextureLoader();
  const floorTexture = tl.load('img/ice.webp');
  floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
  floorTexture.repeat.set(x, y);
  // OLD material: new THREE.MeshPhongMaterial({ color: 0x20A020, side: THREE.DoubleSide })
  this.floor = new THREE.Mesh(new THREE.PlaneGeometry(x, y), new THREE.MeshPhongMaterial({ map: floorTexture }));
  this.floor.rotation.x = -Math.PI / 2;
  this.scene.add(this.floor);
 }

 getUser(name = 'User', color = 1, sex = true, x = 0, y = 0, angle = 0) {
  const cubeTextureLoader = new THREE.CubeTextureLoader();
  cubeTextureLoader.setPath( 'img/' );
  // OLD material: new THREE.MeshPhongMaterial({ color: color })
  const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
  const cubeMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF, envMap: cubeTextureLoader.load(['1.png', '2.png', '3.png', '4.png', '5.png', '6.png']) });
  const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
  cube.position.set(0, 0.5, 0);
  const hairGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
  const hairMaterial = new THREE.MeshBasicMaterial({ color: 0xFF0000 });
  const hair = new THREE.Mesh(hairGeometry, hairMaterial);
  hair.position.set(0, 1.25, -0.5);
  this.user = new THREE.Group();
  this.user = this.user.add(cube);
  this.user = this.user.add(hair);

  //const name = this.createLabel('Very long user name', this.user.position);
  //this.user.add(name);

  this.scene.add(this.user);
 }

 createLabel(name, position) {
  const labelDiv = document.createElement('div');
  labelDiv.className = 'label';
  labelDiv.textContent = name;
  labelDiv.style.marginTop = '-1em';
  labelDiv.style.fontSize = '20px';
  // TODO:
  //const label = new CSS2DObject(labelDiv);
  //label.position.copy(position.clone().add(new THREE.Vector3(0, 2, 0)));
  //return label;
 }

 onWindowResize() {
  this.camera.aspect = window.innerWidth / window.innerHeight;
  this.camera.updateProjectionMatrix();
  this.renderer.setSize(window.innerWidth, window.innerHeight);
 }

 onDocumentWheel(event) {
  event.preventDefault();
  this.camera.zoom += event.deltaY * -0.001;
  this.camera.zoom = Math.max(Math.min(this.camera.zoom, 3), 0.5);
  console.log('Zoom: ' + this.camera.zoom);
  this.camera.updateProjectionMatrix();
 }

 onDocumentClick(event) {
  event.preventDefault();
  const raycaster = new THREE.Raycaster();
  let mouse = new THREE.Vector2();
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, this.camera);
  const intersects = raycaster.intersectObject(this.floor);
  if (intersects.length > 0) {
   const point = intersects[0].point;
   net.send({method: 'move', data: { x: point.x, y: point.z }});
   this.setUserRotation(point.x, point.z);
   this.moveUserToPoint(point.x, point.z);
  }
 }

 /* TODO - rotation test, delete when not needed anymore:
 onDocumentMouseMove(event) {
  event.preventDefault();
  const raycaster = new THREE.Raycaster();
  let mouse = new THREE.Vector2();
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, this.camera);
  const intersects = raycaster.intersectObject(this.floor);
  if (intersects.length > 0) {
   const point = intersects[0].point;
   this.setUserRotation(point.x, point.z);
  }
 }
*/

 createDotAtPoint(x, y) {
  const dot = new THREE.Mesh(new THREE.CircleGeometry(0.1, 10), new THREE.MeshBasicMaterial({ color: 0xFF0000 }));
  dot.position.set(x, 0, y);
  dot.rotation.x = -Math.PI / 2;
  this.scene.add(dot);
  setTimeout(() => { this.scene.remove(dot); }, 2000);
 }

 setUserRotation(x, y) {
  this.createDotAtPoint(this.user.position.x, this.user.position.z);
  this.createDotAtPoint(x, y);
  const direction = new THREE.Vector3(x - this.user.position.x, 0, y - this.user.position.z);
  direction.normalize();
  const distance = new THREE.Vector3(this.user.position.x, 0, this.user.position.z).distanceTo(new THREE.Vector3(x, 0, y));
  const arrowHelper = new THREE.ArrowHelper(direction, this.user.position.clone(), distance, 0xFF0000);
  this.scene.add(arrowHelper);
  setTimeout(() => { this.scene.remove(arrowHelper); }, 2000);
  this.user.rotation.y = Math.atan2(-direction.x, -direction.z);// + Math.PI / 2;
 }

 moveUserToPoint(x, y) {
  this.targetPosition.x = x;
  this.targetPosition.z = y;
 }
 
 moveUser() {
  if (this.user) {
   const speed = 5;
   const dx = this.targetPosition.x - this.user.position.x;
   const dz = this.targetPosition.z - this.user.position.z;
   const distance = Math.sqrt(dx * dx + dz * dz);
   if (distance > 0.1) {
    this.user.position.x += (dx / distance) * speed * this.delta;
    this.user.position.z += (dz / distance) * speed * this.delta;
   }
  }
 }

 createChatBubble(message) {
  let chatBubble;
  if (chatBubble) this.scene.remove(chatBubble);
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  context.font = '40px Verdana';
  context.fillText(message, 10, 30);
  chatBubble = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(canvas) }));
  chatBubble.position.set(this.user.position.x, this.user.position.y + 1.5, this.user.position.z);
  this.scene.add(chatBubble);
  setTimeout(() => {
   this.scene.remove(chatBubble);
   chatBubble = null;
  }, 10000);
 }
}
