import * as THREE from 'three';
import { get } from 'svelte/store';
import { debugMode } from './stores.ts';
import type { World } from './world.ts';

export function setupInput(world: World): () => void {
	const onResize = () => onWindowResize(world);
	const onWheel = (e: WheelEvent) => onDocumentWheel(e, world);
	const onClick = (e: MouseEvent) => onDocumentClick(e, world);

	window.addEventListener('resize', onResize);
	document.addEventListener('wheel', onWheel);
	document.addEventListener('click', onClick);

	return () => {
		window.removeEventListener('resize', onResize);
		document.removeEventListener('wheel', onWheel);
		document.removeEventListener('click', onClick);
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
		const raycaster = new THREE.Raycaster();
		const mouse = new THREE.Vector2();
		mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
		mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
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
}

function createDotAtPoint(x: number, z: number, world: World) {
	const dot = new THREE.Mesh(new THREE.CircleGeometry(0.1, 10), new THREE.MeshBasicMaterial({ color: 0xff0000 }));
	dot.position.set(x, 0, z);
	dot.rotation.x = -Math.PI / 2;
	world.scene.add(dot);
	setTimeout(() => {
		world.scene.remove(dot);
	}, 2000);
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
