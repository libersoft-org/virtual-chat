<script lang="ts">
	import { connectionStatus } from '../lib/stores.js';
</script>

<style>
	#status {
		position: absolute;
		display: flex;
		bottom: 0;
		padding: 1vh;
		gap: 1vh;
		align-items: center;
		width: calc(100% - 2vh);
		background-color: rgba(50, 50, 50, 0.75);
		color: #fff;
		z-index: 10;
		font-size: 1.6vh;
	}

	.dot {
		display: inline-block;
		width: 2vh;
		height: 2vh;
		border-radius: 50%;
	}
</style>

<div id="status">
	<div class="dot" style="background-color: {$connectionStatus.color}"></div>
	<div class="text">{$connectionStatus.text}</div>
</div>
