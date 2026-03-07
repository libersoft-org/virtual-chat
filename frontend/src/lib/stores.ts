import { writable } from 'svelte/store';

interface ChatMessage {
	name: string;
	message: string;
}

export const connectionStatus = writable({ text: 'Not connected', color: 'red' });
export const chatMessages = writable<ChatMessage[]>([]);
export const isLoggedIn = writable(false);
export const fpsValue = writable('-');
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
		}
	};
}

export const alerts = createAlerts();
