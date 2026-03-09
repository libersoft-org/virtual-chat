import { Network } from './network.ts';
import { World } from './world.ts';
import { chatMessages, isLoggedIn, userList, selectedUser } from './stores.ts';
import { get } from 'svelte/store';
import type { EnterData, LeaveData, MoveData, MessageData, UsersEntry, ExpressionData } from '@shared/protocol.ts';

export interface Session {
	enter: (name: string, sex: boolean | null, color: number) => void;
	leave: () => void;
	sendMessage: (text: string, to?: string) => void;
	setExpression: (expression: number) => void;
	destroy: () => void;
}

export function createSession(container: HTMLElement, wsUrl: string): Session {
	const network = new Network(wsUrl, {
		onEnter: (data: EnterData) => {
			network.myUuid = data.uuid;
			isLoggedIn.set(true);
			world.spawnUser(data.name, data.color, data.sex, data.x, data.z, data.angle);
			world.createLabel(data.name, data.sex);
			userList.update(list => [...list, { uuid: data.uuid, name: data.name, sex: data.sex }]);
			network.sendUsers();
		},
		onUserEntered: (data: EnterData) => {
			world.addOtherPlayer(data.uuid, data.name, data.color, data.sex, data.x, data.z, data.angle, data.expression);
			userList.update(list => [...list, { uuid: data.uuid, name: data.name, sex: data.sex }]);
			chatMessages.update(msgs => [...msgs.slice(-199), { name: data.name, message: 'joined', system: true, sex: data.sex }]);
		},
		onLeave: (data: LeaveData) => {
			if (data.uuid === network.myUuid) {
				world.removeUser();
				network.myUuid = undefined;
				isLoggedIn.set(false);
				userList.set([]);
				selectedUser.set(null);
			} else {
				const leaving = get(userList).find(u => u.uuid === data.uuid);
				world.removeOtherPlayer(data.uuid);
				userList.update(list => list.filter(u => u.uuid !== data.uuid));
				if (get(selectedUser) === data.uuid) selectedUser.set(null);
				if (leaving) chatMessages.update(msgs => [...msgs.slice(-199), { name: leaving.name, message: data.reason === 'idle' ? 'left due to inactivity' : 'left', system: true, sex: leaving.sex }]);
			}
		},
		onMove: (data: MoveData) => {
			if (data.user === network.myUuid) world.moveUserFromServer(data.x, data.z, data.angle);
			else world.moveOtherPlayer(data.user, data.x, data.z, data.angle);
		},
		onMessage: (data: MessageData) => {
			const sender = get(userList).find(u => u.uuid === data.user);
			const toUser = data.toName ? get(userList).find(u => u.name === data.toName) : undefined;
			chatMessages.update(msgs => [
				...msgs.slice(-199),
				{
					name: data.name,
					message: data.message,
					timestamp: data.timestamp,
					...(sender ? { sex: sender.sex } : {}),
					...(data.private ? { private: true, toName: data.toName, ...(toUser ? { toSex: toUser.sex } : {}) } : {}),
				},
			]);
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
					world.addOtherPlayer(entry.uuid, entry.user.name, entry.user.color, entry.user.sex, entry.user.x, entry.user.z, entry.user.angle, entry.user.expression);
					userList.update(list => (list.some(u => u.uuid === entry.uuid) ? list : [...list, { uuid: entry.uuid, name: entry.user.name, sex: entry.user.sex }]));
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
		sendMessage: (text, to) => network.sendMessage(text, to),
		setExpression: expression => network.sendExpression(expression),
		destroy: () => world.destroy(),
	};
}
