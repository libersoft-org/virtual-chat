<script lang="ts">
	import { connectionStatus } from '../lib/stores.js';
</script>

<div id="status">
	<div class="dot {$connectionStatus.color}"></div>
	<div class="text">{$connectionStatus.text}</div>
</div>
