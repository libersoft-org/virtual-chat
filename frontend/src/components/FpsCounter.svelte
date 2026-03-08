<script lang="ts">
	import { fpsValue } from '../lib/stores.js';
</script>

<style>
	#fps {
		position: absolute;
		top: 10px;
		left: calc(25vw + 40px);
		font-weight: bold;
		font-size: 20px;
		color: #f00;
		z-index: 10;
	}
</style>

<div id="fps">FPS: {$fpsValue}</div>
