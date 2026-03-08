<script lang="ts">
	import { createSession, type Session } from '$lib/session';
	import { isLoggedIn, debugMode } from '$lib/stores';
	import LoginForm from '../components/LoginForm.svelte';
	import ChatWindow from '../components/ChatWindow.svelte';
	import MessageInput from '../components/MessageInput.svelte';
	import StatusBar from '../components/StatusBar.svelte';
	import FpsCounter from '../components/FpsCounter.svelte';
	import LeaveButton from '../components/LeaveButton.svelte';
	import Alert from '../components/Alert.svelte';
	import DebugPanel from '../components/DebugPanel.svelte';
	import ExpressionPicker from '../components/ExpressionPicker.svelte';
	import World from '../components/World.svelte';
	let session: Session;
	const wsUrl = import.meta.env['VITE_BACKEND_URL'] || (import.meta.env.DEV ? `${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.hostname}:7010` : `${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}`);

	function initSession(container: HTMLDivElement) {
		session = createSession(container, wsUrl);
		return () => session.destroy();
	}
</script>

<style>
	#debug {
		position: absolute;
		top: 50px;
		right: 10px;
		z-index: 10;
	}
</style>

<World onready={initSession} />

{#if !$isLoggedIn}
	<LoginForm onenter={session.enter} />
{:else}
	<ChatWindow />
	<FpsCounter />
	<MessageInput onsend={session.sendMessage} />
	<LeaveButton onleave={session.leave} />
	<button class="button" id="debug" onclick={() => debugMode.update(v => !v)}>Debug</button>
	<ExpressionPicker onpick={session.setExpression} />
{/if}

{#if $debugMode}
	<DebugPanel />
{/if}
<StatusBar />
<Alert />
