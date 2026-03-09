<script lang="ts">
	let { onpick }: { onpick: (expression: number) => void } = $props();
	const expressions = Array.from({ length: 16 }, (_, i) => i + 1);
</script>

<style>
	.grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 0.4vh;
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
</style>

<div class="grid">
	{#each expressions as expr}
		<button class="face" onclick={() => onpick(expr)}>
			<img src="img/face{String(expr).padStart(2, '0')}.webp" alt="Expression {expr}" />
		</button>
	{/each}
</div>
