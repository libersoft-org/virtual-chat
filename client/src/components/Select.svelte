<script lang="ts">
	import type { Snippet } from 'svelte';
	interface Props {
		value: string;
		children: Snippet;
	}
	let { value = $bindable(), children }: Props = $props();
</script>

<style>
	select {
		padding: 1vh;
		border: 0.2vh solid #000;
		border-radius: 1vh;
		background-color: var(--form-bg);
		color: var(--form-text);
		font-size: 1.6vh;
		width: 100%;
		box-sizing: border-box;
	}
</style>

<select bind:value>
	{@render children()}
</select>
