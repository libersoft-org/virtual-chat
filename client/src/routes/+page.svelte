<script lang="ts">
	import { createSession, type Session } from '$lib/session';
	import { isLoggedIn, selectedUser, debugMode } from '$lib/stores';
	import LoginForm from '../components/LoginForm.svelte';
	import Chat from '../components/Chat.svelte';
	import UserList from '../components/UserList.svelte';
	import MessageInput from '../components/MessageInput.svelte';
	import StatusBar from '../components/StatusBar.svelte';
	import FPSCounter from '../components/FPS.svelte';
	import Alert from '../components/Alert.svelte';
	import NetworkLog from '../components/NetworkLog.svelte';
	import ExpressionPicker from '../components/ExpressionPicker.svelte';
	import Accordion from '../components/Accordion.svelte';
	import Button from '../components/Button.svelte';
	import World from '../components/World.svelte';
	let session = $state<Session>() as Session;
	const wsUrl = import.meta.env['VITE_SERVER_URL'] || (import.meta.env.DEV ? `${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.hostname}:7010` : `${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}`);
	let chatOpen = $state(window.innerWidth > 768);
	let exprOpen = $state(false);

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

	.debug-pos {
		z-index: 10;
		position: absolute;
		bottom: 5vh;
		right: 1vh;
	}

	.chat-pos {
		z-index: 10;
		position: absolute;
		top: 1vh;
		left: 1vh;
	}

	.expr-pos {
		z-index: 10;
		position: absolute;
		bottom: 5vh;
		left: 1vh;
	}
</style>

<World onready={initSession} />

{#if !$isLoggedIn}
	<LoginForm onenter={session.enter} />
{:else}
	<div class="chat-pos">
		<Accordion title="Chat" bind:open={chatOpen}>
			<UserList />
			<Chat />
			<MessageInput onsend={text => session.sendMessage(text, $selectedUser ?? undefined)} />
		</Accordion>
	</div>
	<div class="expr-pos">
		<Accordion title="Expression" bind:open={exprOpen} headerBottom>
			<ExpressionPicker onpick={session.setExpression} />
		</Accordion>
	</div>
	<div class="buttons">
		<Button onclick={session.leave} text="Leave" />
	</div>
	<div class="debug-pos">
		<Accordion title="Debug" bind:open={$debugMode} headerBottom alignRight>
			<FPSCounter />
			<NetworkLog />
		</Accordion>
	</div>
{/if}
<StatusBar />
<Alert />
