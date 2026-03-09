import * as THREE from 'three';
import { get } from 'svelte/store';
import { debugMode } from './stores.ts';
import type { World } from './world.ts';

export function setupInput(world: World): () => void {
	const onResize = () => onWindowResize(world);
	const onWheel = (e: WheelEvent) => onDocumentWheel(e, world);
	const onClick = (e: MouseEvent) => onDocumentClick(e, world);
	let isRightDragging = false;
	let lastMouseX = 0;
	let lastPinchDist = 0;
	let isTouchDragging = false;
	let lastTouchX = 0;
	let touchStartX = 0;
	let touchStartY = 0;
	const TAP_THRESHOLD = 10;
	const onMouseDown = (e: MouseEvent) => {
		if (e.button === 2 && e.target === world.renderer.domElement) {
			isRightDragging = true;
			lastMouseX = e.clientX;
		}
	};
	const onMouseMove = (e: MouseEvent) => {
		if (!isRightDragging) return;
		const dx = e.clientX - lastMouseX;
		world.cameraAngle -= dx * 0.005;
		lastMouseX = e.clientX;
	};
	const onMouseUp = (e: MouseEvent) => {
		if (e.button === 2) isRightDragging = false;
	};
	const onContextMenu = (e: MouseEvent) => {
		if (e.target === world.renderer.domElement) e.preventDefault();
	};
	const onTouchStart = (e: TouchEvent) => {
		if (e.target !== world.renderer.domElement) return;
		if (e.touches.length === 2) {
			e.preventDefault();
			isTouchDragging = false;
			const dx = e.touches[0]!.clientX - e.touches[1]!.clientX;
			const dy = e.touches[0]!.clientY - e.touches[1]!.clientY;
			lastPinchDist = Math.sqrt(dx * dx + dy * dy);
		} else if (e.touches.length === 1) {
			touchStartX = e.touches[0]!.clientX;
			touchStartY = e.touches[0]!.clientY;
			lastTouchX = e.touches[0]!.clientX;
			isTouchDragging = false;
		}
	};
	const onTouchMove = (e: TouchEvent) => {
		if (e.target !== world.renderer.domElement) return;
		if (e.touches.length === 2) {
			e.preventDefault();
			const dx = e.touches[0]!.clientX - e.touches[1]!.clientX;
			const dy = e.touches[0]!.clientY - e.touches[1]!.clientY;
			const dist = Math.sqrt(dx * dx + dy * dy);
			const delta = dist - lastPinchDist;
			world.camera.zoom += delta * 0.005;
			world.camera.zoom = Math.max(Math.min(world.camera.zoom, 3), 0.5);
			world.camera.updateProjectionMatrix();
			lastPinchDist = dist;
		} else if (e.touches.length === 1) {
			const dx = e.touches[0]!.clientX - touchStartX;
			const dy = e.touches[0]!.clientY - touchStartY;
			if (!isTouchDragging && Math.sqrt(dx * dx + dy * dy) > TAP_THRESHOLD) isTouchDragging = true;
			if (isTouchDragging) {
				e.preventDefault();
				const moveDx = e.touches[0]!.clientX - lastTouchX;
				world.cameraAngle -= moveDx * 0.005;
				lastTouchX = e.touches[0]!.clientX;
			}
		}
	};
	const onTouchEnd = (e: TouchEvent) => {
		if (e.target !== world.renderer.domElement) return;
		if (!isTouchDragging && e.changedTouches.length === 1 && e.touches.length === 0) {
			const touch = e.changedTouches[0]!;
			const dx = touch.clientX - touchStartX;
			const dy = touch.clientY - touchStartY;
			if (Math.sqrt(dx * dx + dy * dy) <= TAP_THRESHOLD) onTouchTap(touch, world);
		}
		isTouchDragging = false;
	};
	window.addEventListener('resize', onResize);
	document.addEventListener('wheel', onWheel);
	document.addEventListener('click', onClick);
	document.addEventListener('mousedown', onMouseDown);
	document.addEventListener('mousemove', onMouseMove);
	document.addEventListener('mouseup', onMouseUp);
	document.addEventListener('contextmenu', onContextMenu);
	document.addEventListener('touchstart', onTouchStart, { passive: false });
	document.addEventListener('touchmove', onTouchMove, { passive: false });
	document.addEventListener('touchend', onTouchEnd);
	return () => {
		window.removeEventListener('resize', onResize);
		document.removeEventListener('wheel', onWheel);
		document.removeEventListener('click', onClick);
		document.removeEventListener('mousedown', onMouseDown);
		document.removeEventListener('mousemove', onMouseMove);
		document.removeEventListener('mouseup', onMouseUp);
		document.removeEventListener('contextmenu', onContextMenu);
		document.removeEventListener('touchstart', onTouchStart);
		document.removeEventListener('touchmove', onTouchMove);
		document.removeEventListener('touchend', onTouchEnd);
	};
}

function onWindowResize(world: World) {
	world.camera.aspect = window.innerWidth / window.innerHeight;
	world.camera.updateProjectionMatrix();
	world.renderer.setSize(window.innerWidth, window.innerHeight);
	world.css2dRenderer.setSize(window.innerWidth, window.innerHeight);
}

function onDocumentWheel(event: WheelEvent, world: World) {
	if (event.target !== world.renderer.domElement) return;
	event.preventDefault();
	world.camera.zoom += event.deltaY * -0.001;
	world.camera.zoom = Math.max(Math.min(world.camera.zoom, 3), 0.5);
	world.camera.updateProjectionMatrix();
}

function onDocumentClick(event: MouseEvent, world: World) {
	if (world.user && event.target === world.renderer.domElement) {
		event.preventDefault();
		moveUserToTouch(event.clientX, event.clientY, world);
	}
}

function onTouchTap(touch: Touch, world: World) {
	if (world.user) moveUserToTouch(touch.clientX, touch.clientY, world);
}

function moveUserToTouch(clientX: number, clientY: number, world: World) {
	const raycaster = new THREE.Raycaster();
	const mouse = new THREE.Vector2();
	mouse.x = (clientX / window.innerWidth) * 2 - 1;
	mouse.y = -(clientY / window.innerHeight) * 2 + 1;
	raycaster.setFromCamera(mouse, world.camera);
	const intersects = raycaster.intersectObject(world.floor);
	if (intersects.length > 0) {
		const point = intersects[0]!.point;
		setUserRotation(point.x, point.z, world);
		const angleDeg = ((((world.user!.rotation.y * 180) / Math.PI) % 360) + 360) % 360;
		world.onMove(point.x, point.z, angleDeg);
		world.moveUserToPoint(point.x, point.z);
	}
}

function createDotAtPoint(x: number, z: number, world: World) {
	const dot = new THREE.Mesh(new THREE.CircleGeometry(0.1, 10), new THREE.MeshBasicMaterial({ color: 0xff0000 }));
	dot.position.set(x, 0, z);
	dot.rotation.x = -Math.PI / 2;
	world.scene.add(dot);
	setTimeout(() => world.scene.remove(dot), 2000);
}

function setUserRotation(x: number, z: number, world: World) {
	if (!world.user) return;
	if (get(debugMode)) {
		createDotAtPoint(world.user.position.x, world.user.position.z, world);
		createDotAtPoint(x, z, world);
		const direction = new THREE.Vector3(x - world.user.position.x, 0, z - world.user.position.z);
		direction.normalize();
		const distance = new THREE.Vector3(world.user.position.x, 0, world.user.position.z).distanceTo(new THREE.Vector3(x, 0, z));
		const arrowHelper = new THREE.ArrowHelper(direction, world.user.position.clone(), distance, 0xff0000);
		world.scene.add(arrowHelper);
		setTimeout(() => world.scene.remove(arrowHelper), 2000);
	}
	const direction = new THREE.Vector3(x - world.user.position.x, 0, z - world.user.position.z);
	world.user.rotation.y = Math.atan2(direction.x, direction.z);
}
