<script lang="ts">
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
		bottom: 50px;
		left: 10px;
		z-index: 10;
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 6px;
		padding: 8px;
		background-color: var(--form-bg);
		color: var(--form-text);
		border: 1px solid #000;
		border-radius: 10px;
		margin-bottom: 6px;
	}

	.face {
		width: 48px;
		height: 48px;
		cursor: pointer;
		border: 1px solid #000;
		border-radius: 8px;
		background-color: var(--form-bg);
		padding: 4px;
	}

	.face img {
		width: 100%;
		height: 100%;
		display: block;
	}

	.face:hover {
		outline: 2px solid #000;
	}

	.toggle {
		padding: 10px;
		border-radius: 10px;
		text-align: center;
		font-weight: bold;
		border: 1px solid #000;
		background-color: var(--form-bg);
		color: var(--form-text);
		cursor: pointer;
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
	<button class="toggle" onclick={() => (open = !open)}>
		{open ? '▼' : '▶'} Expression
	</button>
</div>
