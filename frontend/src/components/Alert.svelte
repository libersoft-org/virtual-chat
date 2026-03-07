<script lang="ts">
	import { alerts } from '$lib/stores';
</script>

{#if $alerts.length > 0}
	<div class="alert-container">
		{#each $alerts as alert (alert.id)}
			<div class="alert" role="alert">
				<span>{alert.message}</span>
				<button class="alert-close" onclick={() => alerts.remove(alert.id)}>&times;</button>
			</div>
		{/each}
	</div>
{/if}

<style>
	.alert-container {
		position: fixed;
		top: 20px;
		left: 50%;
		transform: translateX(-50%);
		z-index: 1000;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.alert {
		background-color: rgba(220, 50, 50, 0.9);
		color: #fff;
		padding: 12px 40px 12px 16px;
		border-radius: 10px;
		font-size: 14px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
		position: relative;
	}

	.alert-close {
		position: absolute;
		right: 10px;
		top: 50%;
		transform: translateY(-50%);
		background: none;
		border: none;
		color: #fff;
		font-size: 20px;
		cursor: pointer;
		padding: 0 4px;
	}
</style>
