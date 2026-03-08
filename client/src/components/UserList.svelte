<script lang="ts">
	import { userList } from '../lib/stores';
	import Listbox from './Listbox.svelte';

	let selected = $state<string | null>(null);

	let items = $derived(
		$userList.map(u => ({
			id: u.uuid,
			label: u.name,
			class: u.sex ? 'male' : 'female',
		}))
	);
</script>

<style>
	.user-list {
		width: 30vh;
		height: 12vh;
	}

	:global(.user-list .male) {
		color: var(--male-color);
	}

	:global(.user-list .female) {
		color: var(--female-color);
	}
</style>

<div class="user-list">
	<Listbox {items} {selected} onselect={id => (selected = id)} />
</div>
