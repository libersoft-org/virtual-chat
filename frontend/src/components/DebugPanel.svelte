<script lang="ts">
	import { netLog, type NetLogItem } from '$lib/stores';
	let items: NetLogItem[] = $state([]);
	let logEl: HTMLDivElement = $state() as HTMLDivElement;
	netLog.subscribe(v => {
		items = v;
		if (logEl) setTimeout(() => (logEl.scrollTop = logEl.scrollHeight), 0);
	});
</script>

<style>
	.panel {
		position: fixed;
		bottom: 50px;
		right: 10px;
		z-index: 100;
		background-color: var(--form-bg);
		color: var(--form-text);
		border: 1px solid #000;
		border-radius: 10px;
		display: flex;
		flex-direction: column;
		height: 30vh;
		width: 50vw;
		box-sizing: border-box;
	}

	.header {
		padding: 10px;
		font-weight: bold;
	}

	.log {
		overflow-y: auto;
		flex: 1;
		font-size: 14px;
		padding: 8px;
		border-top: 1px solid #000;
	}

	.entry {
		font-family: monospace;
		word-break: break-all;
		padding: 2px 0;
		border-bottom: 1px solid rgba(0, 0, 0, 0.1);
	}

	.out {
		color: #00a;
	}
	.in {
		color: #a00;
	}
	.time {
		color: #080;
	}

	.toolbar {
		padding: 6px 8px;
		text-align: right;
		border-top: 1px solid rgba(0, 0, 0, 0.15);
	}

	.toolbar button {
		font-size: 14px;
		padding: 4px 12px;
		cursor: pointer;
		background-color: var(--form-bg);
		color: var(--form-text);
		border: 1px solid #000;
		border-radius: 10px;
		font-weight: bold;
	}
</style>

<div class="panel">
	<div class="header">Network log ({items.length})</div>
	<div class="log" bind:this={logEl}>
		{#each items as item}
			<div class="entry {item.dir}">
				<span class="time">{item.time}</span>
				{item.dir === 'out' ? '→' : '←'}
				{item.json}
			</div>
		{/each}
	</div>
	<div class="toolbar">
		<button onclick={() => netLog.clear()}>Clear</button>
	</div>
</div>
