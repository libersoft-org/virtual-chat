import { writable } from 'svelte/store';

interface ChatMessage {
	name: string;
	message: string;
}

export const connectionStatus = writable({ text: 'Not connected', color: 'red' });
export const chatMessages = writable<ChatMessage[]>([]);
export const isLoggedIn = writable(false);
export const fpsValue = writable('-');
