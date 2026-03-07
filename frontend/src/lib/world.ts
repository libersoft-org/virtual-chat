import * as THREE from 'three';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { fpsValue } from './stores';

export class World {
	container: HTMLElement;
	onMove: (x: number, y: number) => void;
	scene: THREE.Scene;
	deltaTime = 0;
	currentTime = 0;
	lastTime = Date.now();
	frameCount = 0;
	renderer: THREE.WebGLRenderer;
	camera!: THREE.PerspectiveCamera;
	css2dRenderer!: CSS2DRenderer;
	light!: THREE.DirectionalLight;
	lightDirectionX = false;
	lightDirectionZ = false;
	lightHelper!: THREE.DirectionalLightHelper;
	floor!: THREE.Mesh;
	user?: THREE.Group;
	targetPosition: THREE.Vector3;
	labelObject?: CSS2DObject;
	chatBubbles: { obj: CSS2DObject; user: THREE.Group }[] = [];

	constructor(container: HTMLElement, onMove: (x: number, y: number) => void) {
		this.container = container;
		this.onMove = onMove;
		this.scene = new THREE.Scene();

		this.renderer = new THREE.WebGLRenderer({ antialias: true });
		this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.renderer.shadowMap.enabled = true;
		this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
		this.renderer.shadowMap.needsUpdate = true;
		container.appendChild(this.renderer.domElement);

		this.getLight();
		this.getFloor();

		this.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
		this.camera.position.set(0, 10, 10);
		this.camera.lookAt(this.scene.position);

		window.addEventListener('resize', this.onWindowResize.bind(this), false);
		document.addEventListener('wheel', this.onDocumentWheel.bind(this), false);
		document.addEventListener('click', this.onDocumentClick.bind(this), false);

		this.targetPosition = new THREE.Vector3();

		this.css2dRenderer = new CSS2DRenderer();
		this.css2dRenderer.setSize(window.innerWidth, window.innerHeight);
		this.css2dRenderer.domElement.style.position = 'absolute';
		this.css2dRenderer.domElement.style.top = '0px';
		container.appendChild(this.css2dRenderer.domElement);

		this.update = this.update.bind(this);
		this.update();
	}

	update() {
		requestAnimationFrame(this.update);
		this.moveUser();

		if (this.light.position.x < -10) this.lightDirectionX = true;
		if (this.light.position.x > 10) this.lightDirectionX = false;
		if (this.light.position.z < -5) this.lightDirectionZ = true;
		if (this.light.position.z > 5) this.lightDirectionZ = false;

		const speed = 3 * (this.deltaTime / 1000);
		this.light.position.set(
			this.lightDirectionX ? this.light.position.x + speed : this.light.position.x - speed,
			this.light.position.y,
			this.lightDirectionZ ? this.light.position.z + speed : this.light.position.z - speed
		);

		this.lightHelper.update();
		this.updateOverlays();
		this.renderer.render(this.scene, this.camera);
		this.css2dRenderer.render(this.scene, this.camera);

		const now = Date.now();
		this.deltaTime = now - this.lastTime;
		this.currentTime += this.deltaTime;
		this.frameCount++;
		if (this.currentTime >= 1000) {
			const fps = this.frameCount / (this.currentTime / 1000);
			fpsValue.set(fps.toFixed(2));
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
		this.light.shadow.mapSize.width = 1024;
		this.light.shadow.mapSize.height = 1024;
		this.light.shadow.camera.near = 0.5;
		this.light.shadow.camera.far = 500;
		this.scene.add(this.light);
		this.lightHelper = new THREE.DirectionalLightHelper(this.light, 2);
		this.scene.add(this.lightHelper);
	}

	getFloor() {
		const x = 20;
		const y = 10;
		const textureLoader = new THREE.TextureLoader();
		const floorColorTexture = textureLoader.load('img/ground_0014_color_4k.jpg');
		floorColorTexture.colorSpace = THREE.SRGBColorSpace;

		const floorMaterial = new THREE.MeshStandardMaterial({
			map: floorColorTexture,
			metalness: 0,
		});
		const floorGeometry = new THREE.PlaneGeometry(x, y);
		this.floor = new THREE.Mesh(floorGeometry, floorMaterial);
		this.floor.rotation.x = -Math.PI / 2;
		this.floor.receiveShadow = true;
		this.scene.add(this.floor);
	}

	setFloorRotation(value: number) {
		if (this.floor) this.floor.rotation.x = value;
	}

	getUser(_name = 'User', _color = 1, _sex = true, _x = 0, _y = 0, _angle = 0) {
		const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
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
		const hair = new THREE.Mesh(hairGeometry, hairMaterial);
		hair.position.set(0, 1.25, -0.5);
		hair.castShadow = true;
		cube.castShadow = true;

		this.user = new THREE.Group();
		this.user.add(cube);
		this.user.add(hair);
		this.scene.add(this.user);
	}

	onWindowResize() {
		this.camera.aspect = window.innerWidth / window.innerHeight;
		this.camera.updateProjectionMatrix();
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.css2dRenderer.setSize(window.innerWidth, window.innerHeight);
	}

	onDocumentWheel(event: WheelEvent) {
		event.preventDefault();
		this.camera.zoom += event.deltaY * -0.001;
		this.camera.zoom = Math.max(Math.min(this.camera.zoom, 3), 0.5);
		this.camera.updateProjectionMatrix();
	}

	onDocumentClick(event: MouseEvent) {
		if (this.user) {
			event.preventDefault();
			const raycaster = new THREE.Raycaster();
			const mouse = new THREE.Vector2();
			mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
			mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
			raycaster.setFromCamera(mouse, this.camera);
			const intersects = raycaster.intersectObject(this.floor);
			if (intersects.length > 0) {
				const point = intersects[0]!.point;
				this.onMove(point.x, point.z);
				this.setUserRotation(point.x, point.z);
				this.moveUserToPoint(point.x, point.z);
			}
		}
	}

	createDotAtPoint(x: number, y: number) {
		const dot = new THREE.Mesh(
			new THREE.CircleGeometry(0.1, 10),
			new THREE.MeshBasicMaterial({ color: 0xFF0000 })
		);
		dot.position.set(x, 0, y);
		dot.rotation.x = -Math.PI / 2;
		this.scene.add(dot);
		setTimeout(() => { this.scene.remove(dot); }, 2000);
	}

	setUserRotation(x: number, y: number) {
		if (!this.user) return;
		this.createDotAtPoint(this.user.position.x, this.user.position.z);
		this.createDotAtPoint(x, y);
		const direction = new THREE.Vector3(x - this.user.position.x, 0, y - this.user.position.z);
		direction.normalize();
		const distance = new THREE.Vector3(this.user.position.x, 0, this.user.position.z)
			.distanceTo(new THREE.Vector3(x, 0, y));
		const arrowHelper = new THREE.ArrowHelper(direction, this.user.position.clone(), distance, 0xFF0000);
		this.scene.add(arrowHelper);
		setTimeout(() => { this.scene.remove(arrowHelper); }, 2000);
		this.user.rotation.y = Math.atan2(-direction.x, -direction.z);
	}

	moveUserToPoint(x: number, y: number) {
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

	updateOverlays() {
		if (this.user && this.labelObject) {
			this.labelObject.position.set(this.user.position.x, this.user.position.y - 1, this.user.position.z);
		}
		for (const bubble of this.chatBubbles) {
			bubble.obj.position.set(bubble.user.position.x + 0.2, bubble.user.position.y + 2, bubble.user.position.z);
		}
	}

	createLabel(name: string) {
		if (!this.user) return;
		const nameTagSpan = document.createElement('span');
		nameTagSpan.textContent = name;
		nameTagSpan.classList.add('name-tag');
		const nameTag2DObject = new CSS2DObject(nameTagSpan);
		this.scene.add(nameTag2DObject);
		nameTag2DObject.position.set(this.user.position.x, this.user.position.y - 1, this.user.position.z);
		this.labelObject = nameTag2DObject;
	}

	createChatBubble(message: string) {
		if (!this.user) return;
		// Remove existing bubble for this user
		const existing = this.chatBubbles.find(b => b.user === this.user);
		if (existing) {
			this.scene.remove(existing.obj);
			this.chatBubbles = this.chatBubbles.filter(b => b !== existing);
		}
		const chatBubbleP = document.createElement('p');
		chatBubbleP.textContent = message;
		chatBubbleP.classList.add('chat-bubble');
		const chatBubble2DObject = new CSS2DObject(chatBubbleP);
		chatBubble2DObject.center.set(0.5, 1);
		this.scene.add(chatBubble2DObject);
		const entry = { obj: chatBubble2DObject, user: this.user };
		this.chatBubbles.push(entry);
		setTimeout(() => {
			this.scene.remove(chatBubble2DObject);
			this.chatBubbles = this.chatBubbles.filter(b => b !== entry);
		}, 7000);
	}
}
