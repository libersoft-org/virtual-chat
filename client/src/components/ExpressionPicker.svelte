<script lang="ts">
	import Button from './Button.svelte';
	let { onpick }: { onpick: (expression: number) => void } = $props();
	let open = $state(false);
	const expressions = Array.from({ length: 16 }, (_, i) => i + 1);

	function pick(expr: number) {
		onpick(expr);
		open = false;
	}
</script>

<style>
	.picker {
		position: absolute;
		bottom: 5vh;
		left: 1vh;
		z-index: 10;
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 0.4vh;
		padding: 0.5vh;
		background-color: var(--form-bg);
		color: var(--form-text);
		border: 0.1vh solid #000;
		border-radius: 0.7vh;
		margin-bottom: 0.4vh;
	}

	.face {
		width: 5vh;
		height: 5vh;
		cursor: pointer;
		border: 0.12vh solid #000;
		border-radius: 0.5vh;
		background-color: var(--form-bg);
		padding: 0.25vh;
	}

	.face img {
		width: 100%;
		height: 100%;
		display: block;
	}

	.face:hover {
		outline: 0.15vw solid #000;
	}

	.toggle {
		display: inline-block;
	}
</style>

<div class="picker">
	{#if open}
		<div class="grid">
			{#each expressions as expr}
				<button class="face" onclick={() => pick(expr)}>
					<img src="img/face{String(expr).padStart(2, '0')}.webp" alt="Expression {expr}" />
				</button>
			{/each}
		</div>
	{/if}
	<div class="toggle">
		<Button onclick={() => (open = !open)} text="{open ? '▼' : '▶'} Expression" />
	</div>
</div>
