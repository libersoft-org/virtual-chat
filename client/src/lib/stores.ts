import { writable } from 'svelte/store';

interface ChatMessage {
	name: string;
	message: string;
}

export const connectionStatus = writable({
	text: 'Not connected',
	color: '#f00',
});
export const chatMessages = writable<ChatMessage[]>([]);
export const isLoggedIn = writable(false);
export const debugMode = writable(false);
export const fpsValue = writable('-');

export interface UserListEntry {
	uuid: string;
	name: string;
	sex: boolean;
}

export const userList = writable<UserListEntry[]>([]);
export interface AlertItem {
	id: number;
	message: string;
}

function createAlerts() {
	const { subscribe, update } = writable<AlertItem[]>([]);
	let nextId = 0;
	return {
		subscribe,
		add(message: string) {
			const id = nextId++;
			update(items => [...items, { id, message }]);
			setTimeout(() => {
				update(items => items.filter(i => i.id !== id));
			}, 5000);
		},
		remove(id: number) {
			update(items => items.filter(i => i.id !== id));
		},
	};
}

export const alerts = createAlerts();

export interface NetLogItem {
	dir: 'out' | 'in';
	json: string;
	time: string;
}

function createNetLog() {
	const { subscribe, update } = writable<NetLogItem[]>([]);
	return {
		subscribe,
		add(dir: 'out' | 'in', json: string) {
			const now = new Date();
			const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
			update(items => [...items.slice(-99), { dir, json, time }]);
		},
		clear() {
			update(() => []);
		},
	};
}

export const netLog = createNetLog();
