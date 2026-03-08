<script lang="ts">
	import { connectionStatus } from '../lib/stores.js';
</script>

<style>
	#status {
		position: absolute;
		display: flex;
		bottom: 0px;
		padding: 10px;
		gap: 10px;
		align-items: center;
		width: calc(100% - 20px);
		background-color: rgba(50, 50, 50, 0.75);
		color: #fff;
		z-index: 10;
	}

	.dot {
		display: inline-block;
		width: 20px;
		height: 20px;
		border-radius: 50%;
	}
</style>

<div id="status">
	<div class="dot" style="background-color: {$connectionStatus.color}"></div>
	<div class="text">{$connectionStatus.text}</div>
</div>
