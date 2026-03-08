<script lang="ts">
	import { fpsValue, debugMode } from '../lib/stores.js';
</script>

<style>
	#fps {
		position: absolute;
		top: 10px;
		left: calc(25vw + 20px);
		font-weight: bold;
		font-size: 20px;
		color: #f00;
		z-index: 10;
	}
</style>

{#if $debugMode}
	<div id="fps">FPS: {$fpsValue}</div>
{/if}
