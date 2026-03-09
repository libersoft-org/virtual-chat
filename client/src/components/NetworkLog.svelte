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
		display: flex;
		flex-direction: column;
		height: 30vh;
		width: 50vw;
		box-sizing: border-box;
	}

	.header {
		padding: 1vh;
		font-weight: bold;
		font-size: 1.6vh;
	}

	.log {
		overflow-y: auto;
		flex: 1;
		font-size: 1.4vh;
		padding: 0.8vh;
		border-top: 0.1vh solid #000;
	}

	.entry {
		font-family: monospace;
		word-break: break-all;
		padding: 0.2vh 0;
		border-bottom: 0.1vh solid rgba(0, 0, 0, 0.1);
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
		padding: 0.6vh 0.8vh;
		text-align: right;
		border-top: 0.1vh solid rgba(0, 0, 0, 0.15);
	}

	.toolbar button {
		font-size: 1.4vh;
		padding: 0.4vh 1.2vh;
		cursor: pointer;
		background-color: var(--form-bg);
		color: var(--form-text);
		border: 0.2vh solid #000;
		border-radius: 1vh;
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
