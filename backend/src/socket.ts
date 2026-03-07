import { Common } from './common';
import { API } from './api';
import type { ServerWebSocket } from 'bun';

export class Socket {
	connections: Record<string, ServerWebSocket<{ uuid: string }>> = {};
	api: API = new API(this);

	onOpen(ws: ServerWebSocket<{ uuid: string }>): void {
		const uuid = ws.data.uuid;
		Common.addLog('WS new connection: ' + uuid);
		this.connections[uuid] = ws;
		this.api.onConnect(uuid);
	}

	onClose(ws: ServerWebSocket<{ uuid: string }>): void {
		const uuid = ws.data.uuid;
		Common.addLog('WS connection closed: ' + uuid);
		this.api.onDisconnect(uuid);
		delete this.connections[uuid];
	}

	onMessage(ws: ServerWebSocket<{ uuid: string }>, json: string | Buffer): void {
		this.api.handle(ws.data.uuid, String(json));
	}

	send(uuid: string, obj: object): void {
		this.connections[uuid]?.send(JSON.stringify(obj));
	}

	broadcast(obj: object): void {
		const data = JSON.stringify(obj);
		for (const ws of Object.values(this.connections)) ws.send(data);
	}

	broadcastExcept(excludeUuid: string, obj: object): void {
		const data = JSON.stringify(obj);
		for (const [id, ws] of Object.entries(this.connections)) {
			if (id !== excludeUuid) ws.send(data);
		}
	}

	broadcastToUsers(obj: object): void {
		const data = JSON.stringify(obj);
		for (const [id, ws] of Object.entries(this.connections)) {
			if (this.api.users[id]) ws.send(data);
		}
	}

	broadcastToUsersExcept(excludeUuid: string, obj: object): void {
		const data = JSON.stringify(obj);
		for (const [id, ws] of Object.entries(this.connections)) {
			if (id !== excludeUuid && this.api.users[id]) ws.send(data);
		}
	}
}
