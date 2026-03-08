<script lang="ts">
	let { onleave }: { onleave: () => void } = $props();
</script>

<style>
	#leave {
		position: absolute;
		top: 10px;
		right: 10px;
		z-index: 10;
	}
</style>

<button id="leave" class="button" onclick={onleave}>Leave</button>
