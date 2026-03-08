<script lang="ts">
	import { chatMessages } from '../lib/stores';

	let chatEl: HTMLDivElement;

	$effect(() => {
		if ($chatMessages.length && chatEl) {
			chatEl.scrollTop = chatEl.scrollHeight;
		}
	});
</script>

<style>
	#chat {
		width: 30vh;
		height: 20vh;
		overflow: auto;
		padding: 1vh;
		background-color: var(--form-bg);
		color: var(--form-text);
		box-sizing: border-box;
		font-size: 1.6vh;
		border: 0.2vh solid #000;
		border-radius: 1vh;
	}
	.system {
		color: #999;
		font-style: italic;
	}
	.male {
		color: var(--male-color);
	}
	.female {
		color: var(--female-color);
	}
</style>

<div id="chat" bind:this={chatEl}>
	{#each $chatMessages as msg}
		{#if msg.system}
			<div class="system"><span class="bold {msg.sex ? 'male' : 'female'}">{msg.name}</span> {msg.message}</div>
		{:else}
			<div><span class="bold">{msg.name}</span>: {msg.message}</div>
		{/if}
	{/each}
</div>
