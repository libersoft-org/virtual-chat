<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { TransitionConfig } from 'svelte/transition';
	interface Props {
		title: string;
		open: boolean;
		headerBottom?: boolean;
		alignRight?: boolean;
		children: Snippet;
	}
	let { title, open = $bindable(), headerBottom = false, alignRight = false, children }: Props = $props();

	function expand(node: HTMLElement, { duration = 200 }: { duration?: number } = {}): TransitionConfig {
		const w = node.offsetWidth;
		const h = node.offsetHeight;
		return {
			duration,
			css: (t: number) => `overflow:hidden;width:${t * w}px;height:${t * h}px;`,
		};
	}
</script>

<style>
	.accordion {
		background-color: var(--form-bg);
		border: 0.2vh solid #000;
		border-radius: 1vh;
	}

	.header {
		padding: 1vh;
		font-weight: bold;
		font-size: 2vh;
		cursor: pointer;
		user-select: none;
		display: flex;
		align-items: center;
		gap: 0.5vh;
	}

	.header-right {
		flex-direction: row-reverse;
	}

	.arrow {
		width: 2vh;
		height: 2vh;
	}

	.body {
		display: flex;
		flex-direction: column;
		gap: 1vh;
		padding: 0 1vh 1vh;
		overflow: hidden;
	}

	.body-top {
		padding: 1vh 1vh 0;
	}
</style>

<div class="accordion">
	{#if !headerBottom}
		<div class="header" class:header-right={alignRight} role="button" tabindex="0" onclick={() => (open = !open)} onkeydown={e => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), (open = !open))}>
			<img class="arrow" src={open ? 'img/down.svg' : 'img/up.svg'} alt="" />
			{title}
		</div>
	{/if}
	{#if open}
		<div class="body" class:body-top={headerBottom} transition:expand>
			{@render children()}
		</div>
	{/if}
	{#if headerBottom}
		<div class="header" class:header-right={alignRight} role="button" tabindex="0" onclick={() => (open = !open)} onkeydown={e => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), (open = !open))}>
			<img class="arrow" src={open ? 'img/down.svg' : 'img/up.svg'} alt="" />
			{title}
		</div>
	{/if}
</div>
