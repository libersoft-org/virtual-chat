import { Common } from './common';
import type { ServerWebSocket } from 'bun';

interface UserData {
	name: string;
	color: number;
	sex: boolean;
	x: number;
	y: number;
	angle: number;
}

interface Connection {
	ws: ServerWebSocket<{ uuid: string }>;
	user?: UserData;
	moveTimestamps: number[];
	messageTimestamps: number[];
}

export class Socket {
	connections: Record<string, Connection> = {};

	onOpen(ws: ServerWebSocket<{ uuid: string }>): void {
		const uuid = crypto.randomUUID();
		Common.addLog('WS new connection: ' + uuid);
		ws.data = { uuid };
		this.connections[uuid] = { ws, moveTimestamps: [], messageTimestamps: [] };
		this.count();
	}

	onClose(ws: ServerWebSocket<{ uuid: string }>): void {
		const uuid = ws.data.uuid;
		Common.addLog('WS connection closed: ' + uuid);
		if (this.connections[uuid]?.user) this.leave(uuid);
		delete this.connections[uuid];
		this.count();
	}

	onMessage(ws: ServerWebSocket<{ uuid: string }>, json: string | Buffer): void {
		const uuid = ws.data.uuid;
		try {
			const msg = JSON.parse(String(json));
			Common.addLog(`WS message from ${uuid}: ${JSON.stringify(msg)}`);
			if ('method' in msg && 'data' in msg) {
				switch (msg.method) {
					case 'enter':
						this.getEnter(uuid, msg.data);
						break;
					case 'leave':
						this.getLeave(uuid);
						break;
					case 'move':
						this.getMove(uuid, msg.data);
						break;
					case 'message':
						this.getMessage(uuid, msg.data);
						break;
					case 'users':
						this.getUsers(uuid);
						break;
					default:
						this.send(uuid, {
							method: msg.method,
							error: 3,
							message: 'Unknown method in command',
						});
						break;
				}
			} else {
				this.send(uuid, { error: 2, message: 'Invalid command' });
			}
		} catch (e) {
			Common.addLog(`WS invalid JSON from ${uuid}: ${e}`, 2);
			this.send(uuid, { error: 1, message: 'Invalid JSON' });
		}
	}

	send(uuid: string, obj: object): void {
		this.connections[uuid]?.ws.send(JSON.stringify(obj));
	}

	broadcast(obj: object): void {
		const data = JSON.stringify(obj);
		for (const conn of Object.values(this.connections)) {
			conn.ws.send(data);
		}
	}

	broadcastExcept(excludeUuid: string, obj: object): void {
		const data = JSON.stringify(obj);
		for (const [id, conn] of Object.entries(this.connections)) {
			if (id !== excludeUuid) conn.ws.send(data);
		}
	}

	count(): void {
		Common.addLog('WS connections: ' + Object.keys(this.connections).length);
		let users = 0;
		for (const c of Object.values(this.connections)) {
			if (c.user) users++;
		}
		Common.addLog('WS users: ' + users);
	}

	leave(uuid: string): void {
		this.broadcast({
			method: 'leave',
			error: 0,
			data: { uuid },
		});
		const conn = this.connections[uuid];
		if (conn) delete conn.user;
		this.count();
	}

	getEnter(uuid: string, data: Record<string, unknown>): void {
		const conn = this.connections[uuid];
		if (!conn) return;
		if (conn.user) {
			this.send(uuid, {
				method: 'enter',
				error: 1,
				message: 'User is already in room',
			});
			return;
		}
		if (typeof data['name'] !== 'string') {
			this.send(uuid, { method: 'enter', error: 2, message: 'Missing name' });
			return;
		}
		if (!/^[A-Za-z0-9._-]{3,16}$/.test(data['name'].trim())) {
			this.send(uuid, {
				method: 'enter',
				error: 3,
				message: 'Wrong name format - can contain 3 - 16 characters, only letters, numbers, dot, dash or underscore',
			});
			return;
		}
		if (!('sex' in data)) {
			this.send(uuid, { method: 'enter', error: 6, message: 'Missing sex' });
			return;
		}
		if (data['sex'] !== true && data['sex'] !== false) {
			this.send(uuid, {
				method: 'enter',
				error: 7,
				message: 'Wrong sex value',
			});
			return;
		}
		if (!('color' in data)) {
			this.send(uuid, { method: 'enter', error: 4, message: 'Missing color' });
			return;
		}
		if (!Number.isInteger(data['color']) || (data['color'] as number) < 1 || (data['color'] as number) > 8) {
			this.send(uuid, { method: 'enter', error: 5, message: 'Wrong color ID' });
			return;
		}
		const userData: UserData = {
			name: data['name'].trim(),
			color: data['color'] as number,
			sex: data['sex'] as boolean,
			x: 0,
			y: 0,
			angle: 0,
		};
		conn.user = userData;
		this.count();
		const enterData = { uuid, ...userData };
		this.send(uuid, { method: 'enter', error: 0, data: enterData });
		this.broadcastExcept(uuid, {
			method: 'user_entered',
			error: 0,
			data: enterData,
		});
	}

	getLeave(uuid: string): void {
		const conn = this.connections[uuid];
		if (!conn?.user) {
			this.send(uuid, {
				method: 'leave',
				error: 1,
				message: 'User is not in room',
			});
		} else {
			this.leave(uuid);
		}
	}

	getMove(uuid: string, data: Record<string, unknown>): void {
		const conn = this.connections[uuid];
		if (!conn?.user) {
			this.send(uuid, {
				method: 'move',
				error: 1,
				message: 'User not in room',
			});
			return;
		}
		if (typeof data['x'] !== 'number' || typeof data['y'] !== 'number' || typeof data['angle'] !== 'number' || !Number.isFinite(data['x']) || !Number.isFinite(data['y']) || !Number.isFinite(data['angle'])) {
			this.send(uuid, {
				method: 'move',
				error: 2,
				message: 'Invalid coordinates',
			});
			return;
		}
		if (data['x'] < -10 || data['x'] > 10 || data['y'] < -5 || data['y'] > 5) {
			this.send(uuid, {
				method: 'move',
				error: 3,
				message: 'Wrong coordinates',
			});
			return;
		}
		if (data['angle'] < 0 || data['angle'] > 360) {
			this.send(uuid, {
				method: 'move',
				error: 4,
				message: 'Wrong angle',
			});
			return;
		}
		if (!this.rateLimit(uuid, 'move')) return;
		conn.user.x = data['x'];
		conn.user.y = data['y'];
		conn.user.angle = data['angle'];
		this.broadcast({
			method: 'move',
			error: 0,
			data: { user: uuid, x: data['x'], y: data['y'], angle: data['angle'] },
		});
	}

	getMessage(uuid: string, data: Record<string, unknown>): void {
		const conn = this.connections[uuid];
		if (!conn?.user) {
			this.send(uuid, {
				method: 'message',
				error: 1,
				message: 'User not in room',
			});
			return;
		}
		if (typeof data['message'] !== 'string') {
			this.send(uuid, {
				method: 'message',
				error: 2,
				message: 'Missing message',
			});
			return;
		}
		if (data['message'].trim() === '') {
			this.send(uuid, {
				method: 'message',
				error: 2,
				message: 'Message is empty',
			});
			return;
		}
		if (!this.rateLimit(uuid, 'message')) return;
		this.broadcast({
			method: 'message',
			error: 0,
			data: {
				name: conn.user.name,
				message: data['message'].trim().substring(0, 250),
			},
		});
	}

	rateLimit(uuid: string, type: 'move' | 'message'): boolean {
		const conn = this.connections[uuid];
		if (!conn) return false;
		const now = Date.now();
		const timestamps = type === 'move' ? conn.moveTimestamps : conn.messageTimestamps;
		const limit = type === 'move' ? (Common.settings.limits?.moves_per_second ?? 10) : (Common.settings.limits?.messages_per_second ?? 3);
		// Remove timestamps older than 1 second
		while (timestamps.length > 0 && timestamps[0]! <= now - 1000) {
			timestamps.shift();
		}
		if (timestamps.length >= limit) {
			this.send(uuid, {
				method: type,
				error: 10,
				message: 'Too many requests, slow down',
			});
			return false;
		}
		timestamps.push(now);
		return true;
	}

	getUsers(uuid: string): void {
		const users: { uuid: string; user: UserData }[] = [];
		for (const [id, c] of Object.entries(this.connections)) {
			if (c.user) users.push({ uuid: id, user: c.user });
		}
		this.send(uuid, { method: 'users', error: 0, data: users });
	}
}
