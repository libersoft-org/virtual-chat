<script lang="ts">
	import { onMount } from 'svelte';
	import { createSession, type Session } from '$lib/session';
	import { isLoggedIn } from '$lib/stores';
	import LoginForm from '../components/LoginForm.svelte';
	import ChatWindow from '../components/ChatWindow.svelte';
	import MessageInput from '../components/MessageInput.svelte';
	import StatusBar from '../components/StatusBar.svelte';
	import FpsCounter from '../components/FpsCounter.svelte';
	import LeaveButton from '../components/LeaveButton.svelte';
	import Alert from '../components/Alert.svelte';
	import DebugPanel from '../components/DebugPanel.svelte';
	import ExpressionPicker from '../components/ExpressionPicker.svelte';
	let container: HTMLDivElement;
	let session: Session;
	const wsUrl = import.meta.env['VITE_BACKEND_URL'] || (import.meta.env.DEV ? `${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.hostname}:7010` : `${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}`);

	onMount(() => {
		session = createSession(container, wsUrl);
	});
</script>

<style>
	#world-container {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
	}
</style>

<div id="world-container" bind:this={container}></div>

{#if !$isLoggedIn}
	<LoginForm onenter={session.enter} />
{:else}
	<ChatWindow />
	<FpsCounter />
	<MessageInput onsend={session.sendMessage} />
	<LeaveButton onleave={session.leave} />
	<ExpressionPicker onpick={session.setExpression} />
{/if}

<DebugPanel />
<StatusBar />
<Alert />
