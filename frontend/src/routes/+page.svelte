<script lang="ts">
	import { onMount } from 'svelte';
	import { Network } from '$lib/network';
	import { World } from '$lib/world';
	import { chatMessages, isLoggedIn } from '$lib/stores';
	import LoginForm from '../components/LoginForm.svelte';
	import ChatWindow from '../components/ChatWindow.svelte';
	import MessageInput from '../components/MessageInput.svelte';
	import StatusBar from '../components/StatusBar.svelte';
	import FpsCounter from '../components/FpsCounter.svelte';
	import LeaveButton from '../components/LeaveButton.svelte';
	import Alert from '../components/Alert.svelte';
	import DebugPanel from '../components/DebugPanel.svelte';

	let container: HTMLDivElement;
	let world: World;
	let network: Network;

	const wsUrl = import.meta.env['VITE_BACKEND_URL']
		|| (import.meta.env.DEV
			? `${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.hostname}:7010`
			: `${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}`);

	onMount(() => {
		world = new World(container, (x: number, y: number) => {
			network.sendMove(x, y);
		});

		network = new Network(wsUrl, {
			onEnter: (data: any) => {
				network.myUuid = data.uuid;
				isLoggedIn.set(true);
				world.getUser(data.name, data.sex, data.color, data.x, data.y, data.angle);
				world.createLabel(data.name);
				network.sendUsers();
			},
			onUserEntered: (data: any) => {
				world.addOtherPlayer(data.uuid, data.name, data.x, data.y);
			},
			onLeave: (data: any) => {
				if (data.uuid === network.myUuid) {
					world.removeUser();
					network.myUuid = undefined;
					isLoggedIn.set(false);
				} else {
					world.removeOtherPlayer(data.uuid);
				}
			},
			onMove: (data: any) => {
				world.moveOtherPlayer(data.user, data.x, data.y);
			},
			onMessage: (data: any) => {
				chatMessages.update((msgs) => [...msgs, { name: data.name, message: data.message }]);
				world.createChatBubble(data.message);
			},
			onUsers: (data: any) => {
				for (const entry of data) {
					if (entry.uuid !== network.myUuid) {
						world.addOtherPlayer(entry.uuid, entry.user.name, entry.user.x, entry.user.y);
					}
				}
			}
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
</script>

<div id="world-container" bind:this={container}></div>

{#if !$isLoggedIn}
	<LoginForm onenter={handleEnter} />
{:else}
	<ChatWindow />
	<FpsCounter />
	<MessageInput onsend={handleSendMessage} />
	<LeaveButton onleave={handleLeave} />
	<DebugPanel {world} />
{/if}

<StatusBar />
<Alert />

<style>
	#world-container {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
	}
</style>
