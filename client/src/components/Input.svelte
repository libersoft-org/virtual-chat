<script lang="ts">
	interface Props {
		type?: string;
		placeholder?: string;
		maxlength?: number;
		value: string;
		ref?: HTMLInputElement | undefined;
	}

	let { type = 'text', placeholder, maxlength, value = $bindable(), ref = $bindable(undefined) }: Props = $props();
	void ref;
</script>

<style>
	input {
		padding: 1vh;
		border: 0.2vh solid #000;
		border-radius: 1vh;
		background-color: var(--form-bg);
		color: var(--form-text);
		font-size: 1.6vh;
		box-sizing: border-box;
		width: 100%;
	}
</style>

<input {type} {placeholder} {maxlength} bind:value bind:this={ref} />
