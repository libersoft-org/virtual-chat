<script lang="ts">
	interface Props {
		items: { id: string; label: string; class?: string }[];
		selected: string | null;
		onselect: (id: string | null) => void;
	}
	let { items, selected, onselect }: Props = $props();

	function select(id: string) {
		onselect(selected === id ? null : id);
	}

	function onKeydown(e: KeyboardEvent, id: string) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			select(id);
		}
	}
</script>

<style>
	.listbox {
		overflow-y: auto;
		padding: 1vh;
		background-color: var(--form-bg);
		color: var(--form-text);
		box-sizing: border-box;
		font-size: 1.6vh;
		font-weight: bold;
		border: 0.2vh solid #000;
		border-radius: 1vh;
	}

	.item {
		padding: 0.3vh 0.5vh;
		border-radius: 0.5vh;
		cursor: pointer;
		user-select: none;
	}

	.item:hover {
		background-color: rgba(0, 0, 0, 0.1);
	}

	.item.selected {
		background-color: rgba(0, 0, 0, 0.2);
	}
</style>

<div class="listbox" role="listbox">
	{#each items as item}
		<div class="item {item.class ?? ''}" class:selected={selected === item.id} role="option" aria-selected={selected === item.id} tabindex="0" onclick={() => select(item.id)} onkeydown={e => onKeydown(e, item.id)}>{item.label}</div>
	{/each}
</div>
