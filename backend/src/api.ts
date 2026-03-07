import { Common } from './common';
import type { Socket } from './socket';

interface UserData {
	name: string;
	color: number;
	sex: boolean;
	x: number;
	y: number;
	angle: number;
}

export class API {
	socket: Socket;
	users: Record<string, UserData> = {};
	rateLimits: Record<string, { moveTimestamps: number[]; messageTimestamps: number[] }> = {};

	constructor(socket: Socket) {
		this.socket = socket;
	}

	methods: Record<string, (uuid: string, data: Record<string, unknown>) => void> = {
		enter: (uuid, data) => this.getEnter(uuid, data),
		leave: uuid => this.getLeave(uuid),
		move: (uuid, data) => this.getMove(uuid, data),
		message: (uuid, data) => this.getMessage(uuid, data),
		users: uuid => this.getUsers(uuid),
	};

	handle(uuid: string, json: string): void {
		let msg;
		try {
			msg = JSON.parse(json);
		} catch {
			this.socket.send(uuid, { error: 'INVALID_JSON' });
			return;
		}
		if (!('method' in msg) || !('data' in msg)) {
			this.socket.send(uuid, { error: 'INVALID_COMMAND' });
			return;
		}
		const method = msg['method'] as string;
		const data = msg['data'] as Record<string, unknown>;
		Common.addLog(`API ${method} from ${uuid}`);
		const handler = this.methods[method];
		if (handler) handler(uuid, data);
		else this.socket.send(uuid, { method, error: 'UNKNOWN_METHOD' });
	}

	onConnect(_uuid: string): void {
		this.count();
	}

	onDisconnect(uuid: string): void {
		if (this.users[uuid]) this.leave(uuid);
		delete this.rateLimits[uuid];
		this.count();
	}

	count(): void {
		Common.addLog('WS connections: ' + Object.keys(this.socket.connections).length);
		Common.addLog('WS users: ' + Object.keys(this.users).length);
	}

	leave(uuid: string): void {
		this.socket.broadcast({ method: 'leave', error: '', data: { uuid } });
		delete this.users[uuid];
		this.count();
	}

	rateLimit(uuid: string, type: 'move' | 'message'): boolean {
		if (!this.rateLimits[uuid]) this.rateLimits[uuid] = { moveTimestamps: [], messageTimestamps: [] };
		const now = Date.now();
		const timestamps = type === 'move' ? this.rateLimits[uuid].moveTimestamps : this.rateLimits[uuid].messageTimestamps;
		const limit = type === 'move' ? (Common.settings.limits?.moves_per_second ?? 10) : (Common.settings.limits?.messages_per_second ?? 3);
		while (timestamps.length > 0 && timestamps[0]! <= now - 1000) {
			timestamps.shift();
		}
		if (timestamps.length >= limit) {
			this.socket.send(uuid, { method: type, error: 'RATE_LIMITED' });
			return false;
		}
		timestamps.push(now);
		return true;
	}

	validateEnterData(data: Record<string, unknown>): string | null {
		if (typeof data['name'] !== 'string') return 'MISSING_NAME';
		if (!/^[A-Za-z0-9._-]{3,16}$/.test(data['name'].trim())) return 'WRONG_NAME';
		if (!('sex' in data)) return 'MISSING_SEX';
		if (data['sex'] !== true && data['sex'] !== false) return 'WRONG_SEX';
		if (!('color' in data)) return 'MISSING_COLOR';
		if (!Number.isInteger(data['color']) || (data['color'] as number) < 1 || (data['color'] as number) > 8) return 'WRONG_COLOR';
		return null;
	}

	getEnter(uuid: string, data: Record<string, unknown>): void {
		if (!this.socket.connections[uuid]) return;
		if (this.users[uuid]) {
			this.socket.send(uuid, { method: 'enter', error: 'ALREADY_IN_ROOM' });
			return;
		}
		const validationError = this.validateEnterData(data);
		if (validationError) {
			this.socket.send(uuid, { method: 'enter', error: validationError });
			return;
		}
		this.users[uuid] = {
			name: (data['name'] as string).trim(),
			color: data['color'] as number,
			sex: data['sex'] as boolean,
			x: 0,
			y: 0,
			angle: 0,
		};
		this.count();
		const enterData = { uuid, ...this.users[uuid] };
		this.socket.send(uuid, { method: 'enter', error: '', data: enterData });
		this.socket.broadcastExcept(uuid, {
			method: 'user_entered',
			error: '',
			data: enterData,
		});
	}

	getLeave(uuid: string): void {
		if (!this.users[uuid]) {
			this.socket.send(uuid, { method: 'leave', error: 'NOT_IN_ROOM' });
		} else {
			this.leave(uuid);
		}
	}

	getMove(uuid: string, data: Record<string, unknown>): void {
		const user = this.users[uuid];
		if (!user) {
			this.socket.send(uuid, { method: 'move', error: 'NOT_IN_ROOM' });
			return;
		}
		if (typeof data['x'] !== 'number' || typeof data['y'] !== 'number' || typeof data['angle'] !== 'number' || !Number.isFinite(data['x']) || !Number.isFinite(data['y']) || !Number.isFinite(data['angle'])) {
			this.socket.send(uuid, { method: 'move', error: 'INVALID_COORDS' });
			return;
		}
		if (data['x'] < -10 || data['x'] > 10 || data['y'] < -5 || data['y'] > 5) {
			this.socket.send(uuid, { method: 'move', error: 'WRONG_COORDS' });
			return;
		}
		if (data['angle'] < 0 || data['angle'] > 360) {
			this.socket.send(uuid, { method: 'move', error: 'WRONG_ANGLE' });
			return;
		}
		if (!this.rateLimit(uuid, 'move')) return;
		user.x = data['x'];
		user.y = data['y'];
		user.angle = data['angle'];
		this.socket.broadcast({
			method: 'move',
			error: '',
			data: { user: uuid, x: data['x'], y: data['y'], angle: data['angle'] },
		});
	}

	getMessage(uuid: string, data: Record<string, unknown>): void {
		const user = this.users[uuid];
		if (!user) {
			this.socket.send(uuid, { method: 'message', error: 'NOT_IN_ROOM' });
			return;
		}
		if (typeof data['message'] !== 'string') {
			this.socket.send(uuid, { method: 'message', error: 'MISSING_MESSAGE' });
			return;
		}
		if (data['message'].trim() === '') {
			this.socket.send(uuid, { method: 'message', error: 'EMPTY_MESSAGE' });
			return;
		}
		if (!this.rateLimit(uuid, 'message')) return;
		this.socket.broadcast({
			method: 'message',
			error: '',
			data: {
				name: user.name,
				message: data['message'].trim().substring(0, 250),
			},
		});
	}

	getUsers(uuid: string): void {
		const users: { uuid: string; user: UserData }[] = [];
		for (const [id, user] of Object.entries(this.users)) {
			users.push({ uuid: id, user });
		}
		this.socket.send(uuid, { method: 'users', error: '', data: users });
	}
}
