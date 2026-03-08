<script lang="ts">
	import { createSession, type Session } from '$lib/session';
	import { isLoggedIn, debugMode } from '$lib/stores';
	import LoginForm from '../components/LoginForm.svelte';
	import ChatWindow from '../components/ChatWindow.svelte';
	import UserList from '../components/UserList.svelte';
	import MessageInput from '../components/MessageInput.svelte';
	import StatusBar from '../components/StatusBar.svelte';
	import FpsCounter from '../components/FpsCounter.svelte';
	import Alert from '../components/Alert.svelte';
	import NetworkLog from '../components/NetworkLog.svelte';
	import ExpressionPicker from '../components/ExpressionPicker.svelte';
	import Button from '../components/Button.svelte';
	import World from '../components/World.svelte';
	let session: Session;
	const wsUrl = import.meta.env['VITE_SERVER_URL'] || (import.meta.env.DEV ? `${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.hostname}:7010` : `${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}`);

	function initSession(container: HTMLDivElement) {
		session = createSession(container, wsUrl);
		return () => session.destroy();
	}
</script>

<style>
	.buttons {
		z-index: 10;
		position: absolute;
		top: 1vh;
		right: 1vh;
		display: flex;
		flex-direction: column;
		gap: 1vh;
	}

	.chat {
		z-index: 10;
		position: absolute;
		top: 1vh;
		left: 1vh;
		display: flex;
		flex-direction: column;
		gap: 1vh;
	}
</style>

<World onready={initSession} />

{#if !$isLoggedIn}
	<LoginForm onenter={session.enter} />
{:else}
	<div class="chat">
		<UserList />
		<ChatWindow />
		<MessageInput onsend={session.sendMessage} />
	</div>
	<div class="buttons">
		<Button onclick={session.leave} text="Leave" />
		<Button onclick={() => debugMode.update(v => !v)} text="Debug" />
	</div>
	<ExpressionPicker onpick={session.setExpression} />
{/if}
{#if $debugMode}
	<FpsCounter />
	<NetworkLog />
{/if}
<StatusBar />
<Alert />
