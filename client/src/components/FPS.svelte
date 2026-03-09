<script lang="ts">
	import { fpsValue } from '../lib/stores.js';
</script>

<style>
	#fps {
		font-weight: bold;
		font-size: 2vh;
		color: #f00;
	}
</style>

<div id="fps">FPS: {$fpsValue}</div>
