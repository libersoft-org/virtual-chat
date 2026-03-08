<script lang="ts">
	import { fpsValue } from '../lib/stores.js';
</script>

<style>
	#fps {
		position: fixed;
		bottom: 36vh;
		right: 1vh;
		z-index: 100;
		font-weight: bold;
		font-size: 2vh;
		color: #f00;
		padding: 1vh;
		background-color: var(--form-bg);
		border: 0.2vh solid #000;
		border-radius: 1vh;
	}
</style>

<div id="fps">FPS: {$fpsValue}</div>
