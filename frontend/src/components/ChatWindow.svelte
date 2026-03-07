<script lang="ts">
	import { chatMessages } from '../lib/stores';

	let chatEl: HTMLDivElement;

	$effect(() => {
		if ($chatMessages.length && chatEl) {
			chatEl.scrollTop = chatEl.scrollHeight;
		}
	});
</script>

<div id="chat" class="form" bind:this={chatEl}>
	{#each $chatMessages as msg}
		<div><span class="bold">{msg.name}</span>: {msg.message}</div>
	{/each}
</div>
