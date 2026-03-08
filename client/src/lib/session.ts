import { Network } from './network.ts';
import { World } from './world.ts';
import { chatMessages, isLoggedIn } from './stores.ts';
import type { EnterData, LeaveData, MoveData, MessageData, UsersEntry, ExpressionData } from '@shared/protocol.ts';

export interface Session {
	enter: (name: string, sex: boolean | null, color: number) => void;
	leave: () => void;
	sendMessage: (text: string) => void;
	setExpression: (expression: number) => void;
	destroy: () => void;
}

export function createSession(container: HTMLElement, wsUrl: string): Session {
	const network = new Network(wsUrl, {
		onEnter: (data: EnterData) => {
			network.myUuid = data.uuid;
			isLoggedIn.set(true);
			world.spawnUser(data.name, data.color, data.sex, data.x, data.z, data.angle);
			world.createLabel(data.name);
			network.sendUsers();
		},
		onUserEntered: (data: EnterData) => {
			world.addOtherPlayer(data.uuid, data.name, data.color, data.x, data.z, data.angle, data.expression);
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
			world.moveOtherPlayer(data.user, data.x, data.z, data.angle);
		},
		onMessage: (data: MessageData) => {
			chatMessages.update(msgs => [...msgs.slice(-199), { name: data.name, message: data.message }]);
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
					world.addOtherPlayer(entry.uuid, entry.user.name, entry.user.color, entry.user.x, entry.user.z, entry.user.angle, entry.user.expression);
				}
			}
		},
		onExpression: (data: ExpressionData) => {
			if (data.user === network.myUuid) world.setExpression(data.expression);
			else world.setOtherPlayerExpression(data.user, data.expression);
		},
	});

	const world = new World(container, (x: number, z: number, angle: number) => {
		network.sendMove(x, z, angle);
	});

	return {
		enter: (name, sex, color) => network.sendEnter(name, sex, color),
		leave: () => network.sendLeave(),
		sendMessage: text => network.sendMessage(text),
		setExpression: expression => network.sendExpression(expression),
		destroy: () => world.destroy(),
	};
}
