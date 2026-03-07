<script lang="ts">
	let { onsend }: { onsend: (text: string) => void } = $props();
	let message = $state('');
	let inputEl: HTMLInputElement;

	function onKeyDown(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			if (document.activeElement !== inputEl) {
				inputEl.focus();
				return;
			}
			if (message.trim()) {
				onsend(message);
				message = '';
			} else inputEl.blur();
		}
	}
</script>

<svelte:document onkeydown={onKeyDown} />
<input id="message" type="text" placeholder="Enter your message" maxlength="250" bind:value={message} bind:this={inputEl} />
