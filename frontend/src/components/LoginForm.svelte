<script lang="ts">
	const colors = ['red', 'orange', 'yellow', 'green', 'blue', 'violet', 'gray', 'white'];

	import { alerts } from '$lib/stores';

	let { onenter }: { onenter: (name: string, sex: boolean | null, color: number) => void } = $props();

	const saved = JSON.parse(localStorage.getItem('vc_login') || '{}');
	let name = $state(saved.name || '');
	let sex = $state(saved.sex || '');
	let color = $state(saved.color || 1);
	let loading = $state(false);

	alerts.subscribe(items => {
		if (items.length > 0) loading = false;
	});

	function setColor(id: number) {
		color = id;
	}

	function enter() {
		if (loading) return;
		loading = true;
		localStorage.setItem('vc_login', JSON.stringify({ name, sex, color }));
		let sexValue: boolean | null = sex === '1' ? true : sex === '0' ? false : null;
		onenter(name, sexValue, color);
	}
</script>

<div id="login" class="form">
	<div class="logo">Virtual chat</div>
	<input type="text" placeholder="Nickname" bind:value={name} />
	<select bind:value={sex}>
		<option value="" selected>-- Gender --</option>
		<option value="1">Male</option>
		<option value="0">Female</option>
	</select>
	<div class="color-picker">
		{#each colors as c, i}
			<button type="button" class="color {c}" class:active={color === i + 1} onclick={() => setColor(i + 1)} aria-label="Color {c}"></button>
		{/each}
	</div>
	<button id="enter" class="button" class:orange={!loading} class:gray={loading} onclick={enter}>
		{#if loading}
			<div class="loader"></div>
		{:else}
			Enter
		{/if}
	</button>
</div>
