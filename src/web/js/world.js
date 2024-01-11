
class World {
 
  constructor() {
 
 
   this.scene = new THREE.Scene();
   this.deltaTime = 0;
   this.currentTime = 0;
   this.lastTime = Date.now();
   this.frameCount = 0;
 
   this.renderer = new THREE.WebGLRenderer({
     antialias: true
 })
 
 this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
 
 // Tone mapping
 // this.renderer.toneMapping = THREE.ACESFilmicToneMapping
 // this.renderer.toneMappingExposure = 3
 
   this.renderer.setSize(window.innerWidth, window.innerHeight);
   this.renderer.shadowMap.enabled = true;
   this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
   this.renderer.shadowMap.needsUpdate = true;
   document.body.appendChild(this.renderer.domElement);
   this.getLight();
   this.getFloor();
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

   this.css2dRenderer = new THREE.CSS2DRenderer();
  
   this.css2dRenderer.setSize(window.innerWidth, window.innerHeight);
   this.css2dRenderer.domElement.style.position = 'absolute';
   this.css2dRenderer.domElement.style.top = '0px';

  //  this.css2dRenderer.domElement.style.zIndex = '100';
   
   document.body.appendChild(this.css2dRenderer.domElement);
   

  }
 

  update() {
   requestAnimationFrame(this.update)
   this.moveUser(); // TODO: move only if not standing
   if (this.light.position.x < -10) this.lightDirectionX = true;
   if (this.light.position.x > 10) this.lightDirectionX = false;
   if (this.light.position.z < -5) this.lightDirectionZ = true;
   if (this.light.position.z > 5) this.lightDirectionZ = false;
   const speed = 3 * (this.deltaTime / 1000);
   this.light.position.set(this.lightDirectionX ? this.light.position.x + speed : this.light.position.x - speed, this.light.position.y, this.lightDirectionZ ? this.light.position.z + speed : this.light.position.z - speed);
   const lightHelper = new THREE.DirectionalLightHelper(this.light, 2);
   this.scene.add(lightHelper);

   this.renderer.render(this.scene, this.camera);


 
   this.scene.remove(lightHelper);
   const now = Date.now();
   this.deltaTime = now - this.lastTime;
   this.currentTime += this.deltaTime;
   this.frameCount++;
   if (this.currentTime >= 1000) {
    const fps = this.frameCount / (this.currentTime / 1000);
    ui.showFPS(fps.toFixed(2));
    this.frameCount = 0;
    this.currentTime = 0;
   }
   this.lastTime = now;

  }
 
  getHelpers() {
   const axesHelper = new THREE.AxesHelper(2);
   this.scene.add(axesHelper);
   const gridHelper = new THREE.GridHelper(100, 100);
   this.scene.add(gridHelper);
  }
 
  getLight() {
   this.light = new THREE.DirectionalLight(0xFFFFFF, 1.4);
   this.light.position.set(0, 5, 0);
   this.light.castShadow = true;
   
   //set to fit
   this.light.shadow.mapSize.width = 1024; 
   this.light.shadow.mapSize.height = 1024; 
   this.light.shadow.camera.near = 0.5; 
   this.light.shadow.camera.far = 500; 
   this.scene.add(this.light);
  }
 
  getFloor() {
   const x = 20;
   const y = 10;

   const textureLoader = new THREE.TextureLoader();
 
 // Load textures
 const floorRoughnessTexture = textureLoader.load('img/ground_materials/ground_0040_roughness_2k.jpg');
 const floorNormalTexture = textureLoader.load('img/ground_materials/ground_0040_normal_opengl_2k.png');
//  const floorHeightTexture = textureLoader.load('img/ground_materials/ground_0040_height_2k.png');
 const floorColorTexture = textureLoader.load('img/ground_materials/ground_0040_color_2k.jpg');
//  const floorAmbientOcclusionTexture = textureLoader.load('img/ground_materials/ground_0040_ao_2k.jpg');
 

 
//  floorAmbientOcclusionTexture.minFilter = THREE.NearestFilter
//  floorAmbientOcclusionTexture.magFilter = THREE.NearestFilter
 
//  Set color space for color texture
 floorColorTexture.colorSpace = THREE.SRGBColorSpace
 
 const floorMaterial = new THREE.MeshStandardMaterial({
  map: floorColorTexture,
  // aoMap: floorAmbientOcclusionTexture,
  // aoMapIntensity: 0.02,
  roughnessMap: floorRoughnessTexture,
  // roughness: 0, 
  // normalMap: floorNormalTexture,
  // displacementMap: floorHeightTexture,
  // displacementScale: 0.1,
  // envMapIntensity: 0.1,
  metalness: 0, // Set reflectivity to 0 to minimize reflections

});
 
 
   
 // Create floor geometry and mesh

 const floorGeometry = new THREE.PlaneGeometry(x, y);
 this.floor = new THREE.Mesh(floorGeometry, floorMaterial);
//  this.floor = new THREE.Mesh(floorGeometry,new THREE.MeshBasicMaterial({ color: 0xffffff }))
 
   // this.floor = new THREE.Mesh(new THREE.PlaneGeometry(x, y), new THREE.MeshStandardMaterial({ map: floorTexture,  roughness: 0.1 }));
 
   this.floor.rotation.x =  -Math.PI / 2
  //  this.floor.position.y -= 0.6
   const floorRotationX  =  -Math.PI / 2;

   
 
   const rotateFloorX = () => {
     const newRotationX = setFloorRotation.rotationX;
     this.floor.rotation.x = newRotationX;
 };
 
 
 const GUI = lil.GUI;
 const gui = new GUI();
 
 const setFloorRotation = { rotationX: floorRotationX }; 
 this.floor.receiveShadow = true;
 this.scene.add(this.floor);
 
 const folderRotation = gui.addFolder('Floor Rotation X');
 folderRotation.add(setFloorRotation, 'rotationX', -Math.PI, Math.PI, 0.000001).onChange(rotateFloorX);
 folderRotation.open();
 
 
 // function checkTextureLoading(texture, textureName) {
 //   textureLoader.load(
 //       texture,
 //       // onLoad callback - called when the texture is successfully loaded
 //       () => {
 //           console.log(`${textureName} loaded successfully.`);
 //       },
 //       // onError callback - called when there is an error loading the texture
 //       (error) => {
 //           console.error(`Error loading ${textureName}:`, error);
 //       }
 //   );
 // }
 
 // // Check loading status for each texture
 // checkTextureLoading('img/ground_materials/ground_color.jpg', 'floorColorTexture');
 // checkTextureLoading('img/ground_materials/ground_aok.jpg', 'floorAmbientOcclusionTexture');
 // checkTextureLoading('img/ground_materials/ground_height.png', 'floorHeightTexture');
 // checkTextureLoading('img/ground_materials/ground_0040_normal_direct_1k.png', 'floorNormalTexture');
 // checkTextureLoading('img/ground_materials/ground_roughness.jpg', 'floorRoughnessTexture');
 
  }
 
  getUser(name = 'User', color = 1, sex = true, x = 0, y = 0, angle = 0) {
   const cubeTextureLoader = new THREE.CubeTextureLoader();
   cubeTextureLoader.setPath( 'img/' );
   // OLD material: new THREE.MeshPhongMaterial({ color: color })
   const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
 
   
 
   //const cubeMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF, envMap: cubeTextureLoader.load(['cube_front.jpg', 'cube_side.jpg', 'cube_side.jpg', 'cube_side.jpg', 'cube_side.jpg', 'cube_side.jpg']) });
 
   //phong material was not suitable for this case, update cube materials array instead 
 
   const cubeMaterials = [
     new THREE.MeshBasicMaterial({ color: 0xff0000 }), 
     new THREE.MeshBasicMaterial({ color: 0x00ff00 }), 
     new THREE.MeshBasicMaterial({ color: 0x0000ff }), 
     new THREE.MeshBasicMaterial({ color: 0xffff00 }), 
     new THREE.MeshBasicMaterial({ color: 0xff00ff }),
     new THREE.MeshBasicMaterial({ color: 0x00ffff }) 
   ];
 
 
 
   const hairMaterial = new THREE.MeshStandardMaterial({ color: 0xFF0000 });
   const cube = new THREE.Mesh(cubeGeometry, cubeMaterials);
   cube.position.set(0, 0.5, 0);
 
   const hairGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
   // const hairMaterial = new THREE.MeshPhongMaterial({ color: 0xFF0000 });
   const hair = new THREE.Mesh(hairGeometry, hairMaterial);
   hair.position.set(0, 1.25, -0.5);
 
   hair.castShadow = true;
   cube.castShadow = true;
 
   this.user = new THREE.Group();
   this.user = this.user.add(cube);
   this.user = this.user.add(hair);
   
   //const name = this.createLabel('Very long user name', this.user.position);
   //this.user.add(name);
   this.scene.add(this.user);
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
   if (this.user) {
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
     this.user.position.x += (dx / distance) * speed * (this.deltaTime / 1000);
     this.user.position.z += (dz / distance) * speed * (this.deltaTime / 1000);
    }
   }
  }
 
 
 //  //old chat bubble
 //  createChatBubble(message) {
 //   let chatBubble;
 //   if (chatBubble) this.scene.remove(chatBubble);
 //   const canvas = document.createElement('canvas');
 //   const context = canvas.getContext('2d');
 //   context.font = '40px Verdana';
 //   context.fillText(message, 10, 30);
 //   chatBubble = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(canvas) }));
 //   chatBubble.position.set(this.user.position.x, this.user.position.y + 1.5, this.user.position.z);
 //   this.scene.add(chatBubble);
 //   setTimeout(() => {
 //    this.scene.remove(chatBubble);
 //    chatBubble = null;
 //   }, 10000);
 //  }
 
 
 //lable
 
 createLabel(name) {
    
  const nameTagSpan = document.createElement('span');
  nameTagSpan.textContent = name;
  nameTagSpan.classList.add('name-tag');

  
  const nameTag2DObject = new THREE.CSS2DObject(nameTagSpan);
  this.scene.add(nameTag2DObject);
  nameTag2DObject.position.set(this.user.position.x, this.user.position.y - 1, this.user.position.z);
  
  this.css2dRenderer.render(this.scene, this.camera);
  
  const animate = () => {
    requestAnimationFrame(() => {
      animate();
    });
    nameTag2DObject.position.set(this.user.position.x, this.user.position.y - 1, this.user.position.z);
    this.css2dRenderer.render(this.scene, this.camera);
  };
  
  animate();

//chat bubble
 }
 
 createChatBubble(message) {

  let chatBubble2DObject;
  
  if (chatBubble2DObject) this.scene.remove(chatBubble2DObject);
  
  
  
  const chatBubbleP = document.createElement('p');
  chatBubbleP.textContent = message;
  chatBubbleP.classList.add('chat-bubble');
  
  chatBubble2DObject = new THREE.CSS2DObject(chatBubbleP);
  this.scene.add(chatBubble2DObject);

  // chatBubble2DObject.position.set(this.user.position.x + 1.7, this.user.position.y - 1.4, this.user.position.z);
  
  // this.css2dRenderer.render(this.scene, this.camera);
  
  const animate = () => {
    requestAnimationFrame(() => {
      animate();
    });
    chatBubble2DObject.position.set(this.user.position.x + 0.2, this.user.position.y + 2, this.user.position.z);
    this.css2dRenderer.render(this.scene, this.camera);
  };
  
  animate();
  
  // Optionally, remove the chat bubble after a certain time
  setTimeout(() => {
    this.scene.remove(chatBubble2DObject);
  }, 7000);
 
 
 }}