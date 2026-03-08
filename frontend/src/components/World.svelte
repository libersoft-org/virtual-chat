<script lang="ts">
	import { onMount } from 'svelte';
	let { onready }: { onready: (container: HTMLDivElement) => void } = $props();
	let container: HTMLDivElement;

	onMount(() => onready(container));
</script>

<style>
	#world-container {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
	}
</style>

<div id="world-container" bind:this={container}></div>
