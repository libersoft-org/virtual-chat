<script lang="ts">
	import { netLog, type NetLogItem } from '$lib/stores';
	let items: NetLogItem[] = $state([]);
	let open = $state(false);
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
	}

	.header {
		padding: 10px;
		font-weight: bold;
		cursor: pointer;
		user-select: none;
		display: flex;
		justify-content: space-between;
		align-items: center;
		background: none;
		border: none;
		color: var(--form-text);
		font-size: inherit;
		font-family: inherit;
		width: 100%;
		text-align: left;
	}

	.content {
		display: flex;
		flex-direction: column;
		height: 300px;
		width: 450px;
		border-top: 1px solid #000;
	}

	.log {
		overflow-y: auto;
		flex: 1;
		font-size: 11px;
		padding: 8px;
	}

	.entry {
		font-family: monospace;
		word-break: break-all;
		padding: 2px 0;
		border-bottom: 1px solid rgba(0, 0, 0, 0.1);
	}

	.out {
		color: #0055cc;
	}
	.in {
		color: #008800;
	}
	.time {
		color: #666;
	}

	.toolbar {
		padding: 6px 8px;
		text-align: right;
		border-top: 1px solid rgba(0, 0, 0, 0.15);
	}

	.toolbar button {
		font-size: 11px;
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
	<button class="header" onclick={() => (open = !open)}>
		{open ? '▼' : '▶'} Network log ({items.length})
	</button>

	{#if open}
		<div class="content">
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
	{/if}
</div>
