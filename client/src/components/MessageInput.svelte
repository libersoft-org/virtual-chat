<script lang="ts">
	import Input from './Input.svelte';
	let { onsend }: { onsend: (text: string) => void } = $props();
	let message = $state('');
	let inputEl = $state<HTMLInputElement>();

	function onKeyDown(event: KeyboardEvent) {
		if (!inputEl || event.key !== 'Enter') return;
		if (document.activeElement !== inputEl) {
			inputEl.focus();
			return;
		}
		if (message.trim()) {
			onsend(message);
			message = '';
		} else inputEl.blur();
	}
</script>

<style>
	.message {
		width: 30vh;
	}
</style>

<svelte:document onkeydown={onKeyDown} />
<div class="message">
	<Input placeholder="Enter your message" maxlength={250} bind:value={message} bind:ref={inputEl} />
</div>
