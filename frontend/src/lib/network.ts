import { connectionStatus, alerts } from './stores';

interface NetworkCallbacks {
	onEnter: (data: any) => void;
	onUserEntered: (data: any) => void;
	onLeave: (data: any) => void;
	onMove: (data: any) => void;
	onMessage: (data: any) => void;
	onUsers: (data: any) => void;
}

export class Network {
	ws: WebSocket;
	callbacks: NetworkCallbacks;
	myUuid: string | undefined;

	constructor(url: string, callbacks: NetworkCallbacks) {
		this.callbacks = callbacks;
		this.ws = new WebSocket(url);

		this.ws.onopen = () => {
			connectionStatus.set({ text: 'Connected', color: 'green' });
		};

		this.ws.onmessage = (e: MessageEvent) => {
			const res = JSON.parse(e.data);
			if (res.error === 0) {
				switch (res.method) {
					case 'enter':
						this.callbacks.onEnter(res.data);
						break;
					case 'user_entered':
						this.callbacks.onUserEntered(res.data);
						break;
					case 'leave':
						this.callbacks.onLeave(res.data);
						break;
					case 'move':
						this.callbacks.onMove(res.data);
						break;
					case 'message':
						this.callbacks.onMessage(res.data);
						break;
					case 'users':
						this.callbacks.onUsers(res.data);
						break;
					default:
						console.error('Unknown method from server:', res.method);
				}
			} else {
				alerts.add(res.message || 'Unknown error');
			}
		};

		this.ws.onerror = (e: Event) => {
			console.error('WS error:', e);
		};

		this.ws.onclose = () => {
			connectionStatus.set({ text: 'Disconnected', color: 'red' });
		};
	}

	send(obj: object) {
		this.ws.send(JSON.stringify(obj));
	}

	sendEnter(name: string, sex: boolean | null, color: number) {
		this.send({
			method: 'enter',
			data: { name, sex, color: Number(color) },
		});
	}

	sendLeave() {
		this.send({ method: 'leave', data: {} });
	}

	sendUsers() {
		this.send({ method: 'users', data: {} });
	}

	sendMove(x: number, y: number, angle: number) {
		this.send({ method: 'move', data: { x, y, angle } });
	}

	sendMessage(text: string) {
		this.send({
			method: 'message',
			data: { message: text },
		});
	}
}
