import * as THREE from 'three';
import { CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js';

export function createRenderer(container: HTMLElement): THREE.WebGLRenderer {
	const renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;
	renderer.shadowMap.needsUpdate = true;
	container.appendChild(renderer.domElement);
	return renderer;
}

export function createCSS2DRenderer(container: HTMLElement): CSS2DRenderer {
	const renderer = new CSS2DRenderer();
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.domElement.style.position = 'absolute';
	renderer.domElement.style.top = '0px';
	renderer.domElement.style.pointerEvents = 'none';
	container.appendChild(renderer.domElement);
	return renderer;
}

export function createCamera(): THREE.PerspectiveCamera {
	const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
	camera.position.set(0, 10, 10);
	camera.lookAt(0, 0, 0);
	return camera;
}

export function createLights(scene: THREE.Scene): THREE.DirectionalLight {
	const ambient = new THREE.AmbientLight(0xffffff, 1.0);
	scene.add(ambient);
	const light = new THREE.DirectionalLight(0xffffff, 3.0);
	light.position.set(10, 15, 5);
	light.castShadow = true;
	light.shadow.mapSize.width = 1024;
	light.shadow.mapSize.height = 1024;
	light.shadow.camera.near = 0.5;
	light.shadow.camera.far = 50;
	light.shadow.camera.left = -15;
	light.shadow.camera.right = 15;
	light.shadow.camera.top = 10;
	light.shadow.camera.bottom = -10;
	scene.add(light);
	return light;
}

export function createSky(scene: THREE.Scene): void {
	scene.background = new THREE.Color(0x87ceeb);
}

export function createFloor(scene: THREE.Scene): THREE.Mesh {
	const x = 20;
	const y = 10;
	const textureLoader = new THREE.TextureLoader();
	const tileSize = 10;
	const loadTex = (path: string) => {
		const tex = textureLoader.load(path);
		tex.wrapS = THREE.RepeatWrapping;
		tex.wrapT = THREE.RepeatWrapping;
		tex.repeat.set(x / tileSize, y / tileSize);
		return tex;
	};
	const colorTex = loadTex('img/tiles_0115_color_1k.jpg');
	colorTex.colorSpace = THREE.SRGBColorSpace;
	const floorMaterial = new THREE.MeshStandardMaterial({
		map: colorTex,
	});
	const floorGeometry = new THREE.PlaneGeometry(x, y);
	const floor = new THREE.Mesh(floorGeometry, floorMaterial);
	floor.rotation.x = -Math.PI / 2;
	floor.receiveShadow = true;
	scene.add(floor);
	return floor;
}

export function createHelpers(scene: THREE.Scene) {
	const axesHelper = new THREE.AxesHelper(2);
	scene.add(axesHelper);
	const gridHelper = new THREE.GridHelper(100, 100);
	scene.add(gridHelper);
}
