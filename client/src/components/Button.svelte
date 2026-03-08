<script lang="ts">
	import Spinner from './Spinner.svelte';
	interface Props {
		onclick: () => void;
		text: string;
		color?: string;
		disabled?: boolean;
		loading?: boolean;
	}
	let { onclick, text, color, disabled = false, loading = false }: Props = $props();

	function handleClick() {
		if (disabled || loading) return;
		onclick();
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			if (disabled || loading) return;
			onclick();
		}
	}
</script>

<style>
	.button {
		padding: 1vh;
		border-radius: 1vh;
		text-align: center;
		font-weight: bold;
		font-size: 2vh;
		border: 0.2vh solid #000;
		background-color: var(--form-bg);
		color: var(--form-text);
		cursor: pointer;
		user-select: none;
	}

	.button.disabled {
		background-color: #888 !important;
		cursor: default;
	}
</style>

<div class="button" class:disabled={disabled || loading} style:background-color={color} role="button" tabindex="0" onclick={handleClick} onkeydown={handleKeydown}>
	{#if loading}
		<Spinner />
	{:else}
		{text}
	{/if}
</div>
