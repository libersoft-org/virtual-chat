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
		position: absolute;
		top: 10px;
		left: 10px;
		width: 25vw;
		height: 20vh;
		overflow: auto;
		padding: 10px;
		background-color: var(--form-bg);
		color: var(--form-text);
		z-index: 10;
		box-sizing: border-box;
	}
</style>

<div id="chat" class="form" bind:this={chatEl}>
	{#each $chatMessages as msg}
		<div><span class="bold">{msg.name}</span>: {msg.message}</div>
	{/each}
</div>
