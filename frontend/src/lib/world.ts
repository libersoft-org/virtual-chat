import * as THREE from 'three';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { fpsValue } from './stores.ts';
import { createRenderer, createCSS2DRenderer, createCamera, createLights, createFloor } from './scene.ts';
import { colorMap, createCharacter, createNameTag, updateFaceTexture, type FaceMaterial } from './character.ts';
import { setupInput } from './input.ts';

export class World {
	container: HTMLElement;
	onMove: (x: number, y: number, angle: number) => void;
	scene: THREE.Scene;
	deltaTime = 0;
	currentTime = 0;
	lastTime = Date.now();
	frameCount = 0;
	renderer: THREE.WebGLRenderer;
	camera: THREE.PerspectiveCamera;
	css2dRenderer: CSS2DRenderer;
	floor: THREE.Mesh;
	user: THREE.Group | undefined;
	targetPosition: THREE.Vector3;
	labelObject: CSS2DObject | undefined;
	userFace: FaceMaterial | undefined;
	userColor: number = 0xff0000;
	chatBubbles: { obj: CSS2DObject; user: THREE.Group }[] = [];
	otherPlayers: Map<
		string,
		{
			group: THREE.Group;
			label: CSS2DObject;
			target: THREE.Vector3;
			targetAngle: number;
			face: FaceMaterial;
			color: number;
		}
	> = new Map();

	constructor(container: HTMLElement, onMove: (x: number, y: number, angle: number) => void) {
		this.container = container;
		this.onMove = onMove;
		this.scene = new THREE.Scene();
		this.renderer = createRenderer(container);
		createLights(this.scene);
		this.floor = createFloor(this.scene);
		this.camera = createCamera();
		setupInput(this);
		this.targetPosition = new THREE.Vector3();
		this.css2dRenderer = createCSS2DRenderer(container);
		this.update = this.update.bind(this);
		this.update();
	}

	update() {
		requestAnimationFrame(this.update);
		this.moveUser();
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

	getUser(_name = 'User', _color = 1, _sex = true, _x = 0, _y = 0, _angle = 0) {
		this.userColor = colorMap[_color] ?? 0xff0000;
		const { group, face } = createCharacter(_color, 1);
		this.userFace = face;
		this.user = group;
		this.scene.add(this.user);
		this.targetPosition.set(0, 0, 0);
	}

	setExpression(faceNum: number) {
		if (this.userFace) updateFaceTexture(this.userFace.ctx, this.userFace.texture, this.userColor, faceNum);
	}

	setOtherPlayerExpression(uuid: string, faceNum: number) {
		const player = this.otherPlayers.get(uuid);
		if (player) updateFaceTexture(player.face.ctx, player.face.texture, player.color, faceNum);
	}

	moveUserToPoint(x: number, y: number) {
		this.targetPosition.x = x;
		this.targetPosition.z = y;
	}

	moveUser() {
		const speed = 5;
		if (this.user) {
			const dx = this.targetPosition.x - this.user.position.x;
			const dz = this.targetPosition.z - this.user.position.z;
			const distance = Math.sqrt(dx * dx + dz * dz);
			if (distance > 0.1) {
				this.user.position.x += (dx / distance) * speed * (this.deltaTime / 1000);
				this.user.position.z += (dz / distance) * speed * (this.deltaTime / 1000);
			}
		}
		for (const [, player] of this.otherPlayers) {
			const dx = player.target.x - player.group.position.x;
			const dz = player.target.z - player.group.position.z;
			const distance = Math.sqrt(dx * dx + dz * dz);
			if (distance > 0.1) {
				player.group.position.x += (dx / distance) * speed * (this.deltaTime / 1000);
				player.group.position.z += (dz / distance) * speed * (this.deltaTime / 1000);
			}
			player.group.rotation.y = player.targetAngle;
			player.label.position.set(player.group.position.x, player.group.position.y - 1, player.group.position.z);
		}
	}

	updateOverlays() {
		if (this.user && this.labelObject) this.labelObject.position.set(this.user.position.x, this.user.position.y - 1, this.user.position.z);
		for (const bubble of this.chatBubbles) bubble.obj.position.set(bubble.user.position.x + 0.2, bubble.user.position.y + 2, bubble.user.position.z);
	}

	createLabel(name: string) {
		if (!this.user) return;
		const label = createNameTag(name);
		this.scene.add(label);
		label.position.set(this.user.position.x, this.user.position.y - 1, this.user.position.z);
		this.labelObject = label;
	}

	removeUser() {
		if (this.user) {
			this.scene.remove(this.user);
			this.user = undefined;
		}
		if (this.labelObject) {
			this.scene.remove(this.labelObject);
			this.labelObject = undefined;
		}
		for (const bubble of this.chatBubbles) this.scene.remove(bubble.obj);
		this.chatBubbles = [];
		for (const [, player] of this.otherPlayers) {
			this.scene.remove(player.group);
			this.scene.remove(player.label);
		}
		this.otherPlayers.clear();
	}

	addOtherPlayer(uuid: string, name: string, color: number, x: number, y: number, angle: number, expression = 1) {
		if (this.otherPlayers.has(uuid)) return;
		const baseColor = colorMap[color] ?? 0x888888;
		const { group, face } = createCharacter(color, expression);
		const angleRad = (angle * Math.PI) / 180;
		group.position.set(x, 0, y);
		group.rotation.y = angleRad;
		this.scene.add(group);
		const label = createNameTag(name);
		label.position.set(x, -1, y);
		this.scene.add(label);
		const target = new THREE.Vector3(x, 0, y);
		this.otherPlayers.set(uuid, { group, label, target, targetAngle: angleRad, face, color: baseColor });
	}

	removeOtherPlayer(uuid: string) {
		const player = this.otherPlayers.get(uuid);
		if (!player) return;
		this.scene.remove(player.group);
		this.scene.remove(player.label);
		this.otherPlayers.delete(uuid);
	}

	moveOtherPlayer(uuid: string, x: number, y: number, angle: number) {
		const player = this.otherPlayers.get(uuid);
		if (!player) return;
		player.target.set(x, 0, y);
		player.targetAngle = (angle * Math.PI) / 180;
	}

	createChatBubble(message: string, playerGroup: THREE.Group) {
		const existing = this.chatBubbles.find(b => b.user === playerGroup);
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
		const entry = { obj: chatBubble2DObject, user: playerGroup };
		this.chatBubbles.push(entry);
		setTimeout(() => {
			this.scene.remove(chatBubble2DObject);
			this.chatBubbles = this.chatBubbles.filter(b => b !== entry);
		}, 7000);
	}
}
