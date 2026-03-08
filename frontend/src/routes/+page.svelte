<script lang="ts">
	import { onMount } from 'svelte';
	import { Network } from '$lib/network';
	import { World } from '$lib/world';
	import { chatMessages, isLoggedIn } from '$lib/stores';
	import type { EnterData, LeaveData, MoveData, MessageData, UsersEntry, ExpressionData } from '@shared/protocol.ts';
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
	let world: World;
	let network: Network;
	const wsUrl = import.meta.env['VITE_BACKEND_URL'] || (import.meta.env.DEV ? `${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.hostname}:7010` : `${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}`);

	onMount(() => {
		world = new World(container, (x: number, y: number, angle: number) => {
			network.sendMove(x, y, angle);
		});

		network = new Network(wsUrl, {
			onEnter: (data: EnterData) => {
				network.myUuid = data.uuid;
				isLoggedIn.set(true);
				world.getUser(data.name, data.color, data.sex, data.x, data.y, data.angle);
				world.createLabel(data.name);
				network.sendUsers();
			},
			onUserEntered: (data: EnterData) => {
				world.addOtherPlayer(data.uuid, data.name, data.color, data.x, data.y, data.angle, data.expression);
			},
			onLeave: (data: LeaveData) => {
				if (data.uuid === network.myUuid) {
					world.removeUser();
					network.myUuid = undefined;
					isLoggedIn.set(false);
				} else {
					world.removeOtherPlayer(data.uuid);
				}
			},
			onMove: (data: MoveData) => {
				world.moveOtherPlayer(data.user, data.x, data.y, data.angle);
			},
			onMessage: (data: MessageData) => {
				chatMessages.update(msgs => [...msgs, { name: data.name, message: data.message }]);
				if (data.user === network.myUuid) {
					if (world.user) world.createChatBubble(data.message, world.user);
				} else {
					const player = world.otherPlayers.get(data.user);
					if (player) world.createChatBubble(data.message, player.group);
				}
			},
			onUsers: (data: UsersEntry[]) => {
				for (const entry of data) {
					if (entry.uuid !== network.myUuid) {
						world.addOtherPlayer(entry.uuid, entry.user.name, entry.user.color, entry.user.x, entry.user.y, entry.user.angle, entry.user.expression);
					}
				}
			},
			onExpression: (data: ExpressionData) => {
				if (data.user === network.myUuid) world.setExpression(data.expression);
				else world.setOtherPlayerExpression(data.user, data.expression);
			},
		});
	});

	function handleEnter(name: string, sex: boolean | null, color: number) {
		network.sendEnter(name, sex, color);
	}

	function handleLeave() {
		network.sendLeave();
	}

	function handleSendMessage(text: string) {
		network.sendMessage(text);
	}

	function handleExpression(expression: number) {
		network.sendExpression(expression);
	}
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
	<LoginForm onenter={handleEnter} />
{:else}
	<ChatWindow />
	<FpsCounter />
	<MessageInput onsend={handleSendMessage} />
	<LeaveButton onleave={handleLeave} />
	<ExpressionPicker onpick={handleExpression} />
{/if}

<DebugPanel />
<StatusBar />
<Alert />
