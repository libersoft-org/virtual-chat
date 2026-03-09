<script lang="ts">
	import { chatMessages } from '../lib/stores';

	let chatEl: HTMLDivElement;

	function formatTime(iso: string): string {
		const d = new Date(iso);
		return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
	}

	chatMessages.subscribe(() => {
		if (chatEl) setTimeout(() => (chatEl.scrollTop = chatEl.scrollHeight), 0);
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
	.time {
		color: #888;
	}
</style>

<div id="chat" bind:this={chatEl}>
	{#each $chatMessages as msg}
		{#if msg.system}
			<div class="system"><span class="bold {msg.sex ? 'male' : 'female'}">{msg.name}</span> {msg.message}</div>
		{:else if msg.private}
			<div>
				{#if msg.timestamp}<span class="time">{formatTime(msg.timestamp)}</span>{/if} <span class="bold {msg.sex ? 'male' : 'female'}">{msg.name}</span> -> <span class="bold {msg.toSex ? 'male' : 'female'}">{msg.toName} (PM)</span>: {msg.message}
			</div>
		{:else}
			<div>
				{#if msg.timestamp}<span class="time">{formatTime(msg.timestamp)}</span>{/if} <span class="bold {msg.sex ? 'male' : 'female'}">{msg.name}</span>: {msg.message}
			</div>
		{/if}
	{/each}
</div>
