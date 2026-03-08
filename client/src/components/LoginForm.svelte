<script lang="ts">
	import { playerColors } from '$lib/character';
	import { alerts } from '$lib/stores';
	import Button from './Button.svelte';
	import Input from './Input.svelte';
	import Select from './Select.svelte';

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
		loading = true;
		localStorage.setItem('vc_login', JSON.stringify({ name, sex, color }));
		let sexValue: boolean | null = sex === '1' ? true : sex === '0' ? false : null;
		onenter(name, sexValue, color);
	}
</script>

<style>
	#login {
		display: flex;
		flex-direction: column;
		gap: 10px;
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		padding: 10px;
		background-color: var(--form-bg);
		color: var(--form-text);
		z-index: 10;
		border: 0.2vh solid #000;
		border-radius: 1vh;
	}

	.logo {
		font-size: 25px;
		font-weight: bold;
		text-align: center;
	}

	.color-picker {
		display: flex;
		justify-content: center;
		gap: 0.5vh;
	}

	.color {
		cursor: pointer;
		width: 3vh;
		height: 3vh;
		border: 0.2vh solid #000;
		border-radius: 0.5vh;
	}

	.color.active {
		border: 0.4vh solid #000;
	}
</style>

<div id="login">
	<div class="logo">Virtual chat</div>
	<Input placeholder="Nickname" bind:value={name} />
	<Select bind:value={sex}>
		<option value="" selected>-- Gender --</option>
		<option value="1">Male</option>
		<option value="0">Female</option>
	</Select>
	<div class="color-picker">
		{#each playerColors as c, i}
			<button type="button" class="color" class:active={color === i + 1} style="background-color: {c}" onclick={() => setColor(i + 1)} aria-label="Color {i + 1}"></button>
		{/each}
	</div>
	<Button onclick={enter} text="Enter" color="#f80" {loading} />
</div>
