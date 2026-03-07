<script lang="ts">
	let { onleave }: { onleave: () => void } = $props();
</script>

<button id="leave" class="button" onclick={onleave}>Leave</button>
