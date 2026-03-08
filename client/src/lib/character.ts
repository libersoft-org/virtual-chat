import * as THREE from 'three';
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

export const playerColors = ['#f00', '#f80', '#ff0', '#0c0', '#00f', '#80f', '#333', '#888', '#fff'];

function cssToHex(css: string): number {
	const r = parseInt(css[1]! + css[1]!, 16);
	const g = parseInt(css[2]! + css[2]!, 16);
	const b = parseInt(css[3]! + css[3]!, 16);
	return (r << 16) | (g << 8) | b;
}

export function getThreeColor(index: number): number {
	return cssToHex(playerColors[index - 1] ?? '#888');
}

export interface FaceMaterial {
	material: THREE.MeshStandardMaterial;
	ctx: CanvasRenderingContext2D;
	texture: THREE.CanvasTexture;
}

export function createFaceMaterial(color: number, faceNum: number): FaceMaterial {
	const size = 256;
	const canvas = document.createElement('canvas');
	canvas.width = size;
	canvas.height = size;
	const ctx = canvas.getContext('2d')!;
	const hex = '#' + color.toString(16).padStart(6, '0');
	ctx.fillStyle = hex;
	ctx.fillRect(0, 0, size, size);
	const texture = new THREE.CanvasTexture(canvas);
	texture.colorSpace = THREE.SRGBColorSpace;
	const material = new THREE.MeshStandardMaterial({ map: texture });
	const img = new Image();
	img.src = `img/face${String(faceNum).padStart(2, '0')}.webp`;
	img.onload = () => {
		ctx.drawImage(img, 0, 0, size, size);
		texture.needsUpdate = true;
	};
	return { material, ctx, texture };
}

export function updateFaceTexture(ctx: CanvasRenderingContext2D, texture: THREE.CanvasTexture, color: number, faceNum: number) {
	const size = ctx.canvas.width;
	const hex = '#' + color.toString(16).padStart(6, '0');
	ctx.fillStyle = hex;
	ctx.fillRect(0, 0, size, size);
	const img = new Image();
	img.src = `img/face${String(faceNum).padStart(2, '0')}.webp`;
	img.onload = () => {
		ctx.drawImage(img, 0, 0, size, size);
		texture.needsUpdate = true;
	};
}

export function createCharacter(color: number, expression: number): { group: THREE.Group; face: FaceMaterial } {
	const baseColor = getThreeColor(color);
	const cubeGeometry = new RoundedBoxGeometry(1, 1, 1, 4, 0.1);
	const baseMaterial = new THREE.MeshStandardMaterial({ color: baseColor });
	const face = createFaceMaterial(baseColor, expression);
	// Three.js face order: +X, -X, +Y, -Y, +Z, -Z
	const cubeMaterials = [baseMaterial, baseMaterial, baseMaterial, baseMaterial, face.material, baseMaterial];
	const cube = new THREE.Mesh(cubeGeometry, cubeMaterials);
	cube.position.set(0, 0.5, 0);
	cube.castShadow = true;
	const group = new THREE.Group();
	group.add(cube);
	return { group, face };
}

export function createNameTag(name: string, sex: boolean): CSS2DObject {
	const span = document.createElement('span');
	span.textContent = name;
	span.classList.add('name-tag');
	span.style.color = sex ? '#22f' : '#a22';
	return new CSS2DObject(span);
}
