import { ErrorCode, type EnterData, type LeaveData, type MoveData, type MessageData, type UsersEntry, type ExpressionData } from '@shared/protocol.ts';
import { connectionStatus, alerts, netLog } from './stores.ts';

const errorMessages: Record<ErrorCode, string> = {
	INVALID_JSON: 'Invalid data sent to server',
	INVALID_COMMAND: 'Invalid command',
	UNKNOWN_METHOD: 'Unknown command',
	ALREADY_IN_ROOM: 'You are already in the room',
	MISSING_NAME: 'Name is required',
	WRONG_NAME: 'Wrong name format — use 3-16 characters: letters, numbers, dot, dash or underscore',
	MISSING_SEX: 'Sex is required',
	WRONG_SEX: 'Invalid sex value',
	MISSING_COLOR: 'Color is required',
	WRONG_COLOR: 'Invalid color',
	NOT_IN_ROOM: 'You are not in the room',
	INVALID_COORDS: 'Invalid coordinates',
	WRONG_COORDS: 'Coordinates out of bounds',
	WRONG_ANGLE: 'Invalid angle',
	MISSING_MESSAGE: 'Message is required',
	EMPTY_MESSAGE: 'Message cannot be empty',
	RATE_LIMITED: 'Too many requests, slow down',
	WRONG_EXPRESSION: 'Invalid expression',
};

interface NetworkCallbacks {
	onEnter: (data: EnterData) => void;
	onUserEntered: (data: EnterData) => void;
	onLeave: (data: LeaveData) => void;
	onMove: (data: MoveData) => void;
	onMessage: (data: MessageData) => void;
	onUsers: (data: UsersEntry[]) => void;
	onExpression: (data: ExpressionData) => void;
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
			netLog.add('in', e.data);
			const res = JSON.parse(e.data);
			if (!res.error) {
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
					case 'expression':
						this.callbacks.onExpression(res.data);
						break;
					default:
						console.error('Unknown method from server:', res.method);
				}
			} else {
				alerts.add(errorMessages[res.error as ErrorCode] || `Unknown error: ${res.error}`);
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
		const json = JSON.stringify(obj);
		netLog.add('out', json);
		this.ws.send(json);
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

	sendExpression(expression: number) {
		this.send({
			method: 'expression',
			data: { expression },
		});
	}
}
