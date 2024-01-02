//import * as THREE from 'three';
//import { CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js';

const ui = new UI();
const world = new World();
const net = new Network('wss://' + location.hostname);

function qs(el) {
 return document.querySelector(el);
}

function qsa(el) {
 return document.querySelectorAll(el);
}
