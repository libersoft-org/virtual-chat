<script lang="ts">
	import type { World } from '../lib/world.ts';
	let { world }: { world: World } = $props();
	let floorRotation = $state(-Math.PI / 2);

	function onInput(e: Event) {
		floorRotation = parseFloat((e.target as HTMLInputElement).value);
		world.setFloorRotation(floorRotation);
	}
</script>

<style>
	#debug-panel {
		position: absolute;
		top: 10px;
		right: 60px;
		z-index: 10;
		background-color: rgba(255, 255, 255, 0.75);
		border: 1px solid #000;
		border-radius: 10px;
		padding: 10px;
		font-size: 12px;
		min-width: 180px;
	}

	summary {
		font-weight: bold;
		cursor: pointer;
	}

	input[type='range'] {
		width: 100%;
		border: none;
		padding: 2px 0;
	}

	span {
		font-family: monospace;
	}
</style>

<div id="debug-panel">
	<details open>
		<summary>Floor Rotation X</summary>
		<input type="range" min={-Math.PI} max={Math.PI} step={0.000001} value={floorRotation} oninput={onInput} />
		<span>{floorRotation.toFixed(4)}</span>
	</details>
</div>
