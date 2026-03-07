import { Common } from "./common";
import type { ServerWebSocket } from "bun";

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
	name?: string;
}

export class Socket {
	connections: Record<string, Connection> = {};

	onOpen(ws: ServerWebSocket<{ uuid: string }>): void {
		const uuid = crypto.randomUUID();
		Common.addLog("WS new connection: " + uuid);
		ws.data = { uuid };
		this.connections[uuid] = { ws };
		this.count();
	}

	onClose(ws: ServerWebSocket<{ uuid: string }>): void {
		const uuid = ws.data.uuid;
		Common.addLog("WS connection closed: " + uuid);
		if (this.connections[uuid]?.user) this.leave(uuid);
		delete this.connections[uuid];
		this.count();
	}

	onMessage(ws: ServerWebSocket<{ uuid: string }>, json: string | Buffer): void {
		const uuid = ws.data.uuid;
		try {
			const msg = JSON.parse(String(json));
			console.log(uuid, msg);
			if ("method" in msg && "data" in msg) {
				switch (msg.method) {
					case "enter":
						this.getEnter(uuid, msg.data);
						break;
					case "leave":
						this.getLeave(uuid);
						break;
					case "move":
						this.getMove(uuid, msg.data);
						break;
					case "message":
						this.getMessage(uuid, msg.data);
						break;
					case "users":
						this.getUsers(uuid);
						break;
					default:
						this.send(uuid, {
							method: msg.method,
							error: 3,
							message: "Unknown method in command",
						});
						break;
				}
			} else {
				this.send(uuid, { error: 2, message: "Invalid command" });
			}
		} catch (e) {
			console.log(e);
			this.send(uuid, { error: 1, message: "Invalid JSON" });
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
		Common.addLog("WS connections: " + Object.keys(this.connections).length);
		let users = 0;
		for (const c of Object.values(this.connections)) {
			if (c.user) users++;
		}
		Common.addLog("WS users: " + users);
	}

	leave(uuid: string): void {
		this.broadcast({
			method: "leave",
			error: 0,
			data: { uuid },
		});
		const conn = this.connections[uuid];
		if (conn) delete conn.user;
		this.count();
	}

	getEnter(uuid: string, data: any): void {
		const res: any = { method: "enter" };
		const conn = this.connections[uuid];
		if (!conn) return;
		if (conn.user) {
			res.error = 1;
			res.message = "User is already in room";
		} else if (!("name" in data)) {
			res.error = 2;
			res.message = "Missing name";
		} else if (!/^[A-Za-z0-9._-]{3,16}$/.test(data.name.trim())) {
			res.error = 3;
			res.message =
				"Wrong name format - can contain 3 - 16 characters, only letters, numbers, dot, dash or underscore";
		} else if (!("sex" in data)) {
			res.error = 6;
			res.message = "Missing sex";
		} else if (data.sex !== true && data.sex !== false) {
			res.error = 7;
			res.message = "Wrong sex value";
		} else if (!("color" in data)) {
			res.error = 4;
			res.message = "Missing color";
		} else if (
			!Number.isInteger(data.color) ||
			data.color < 1 ||
			data.color > 8
		) {
			res.error = 5;
			res.message = "Wrong color ID";
		} else {
			res.error = 0;
			res.data = {
				uuid,
				name: data.name.trim(),
				color: data.color,
				sex: data.sex,
				x: 0,
				y: 0,
				angle: 0,
			};
			conn.user = res.data;
			this.count();
			this.send(uuid, res);
			this.broadcastExcept(uuid, { method: "user_entered", error: 0, data: res.data });
		}
		if (res.error !== 0) this.send(uuid, res);
	}

	getLeave(uuid: string): void {
		const conn = this.connections[uuid];
		if (!conn?.user) {
			this.send(uuid, {
				method: "leave",
				error: 1,
				message: "User is not in room",
			});
		} else {
			this.leave(uuid);
		}
	}

	getMove(uuid: string, data: any): void {
		const res: any = { method: "move" };
		const conn = this.connections[uuid];
		if (!conn?.user) {
			res.error = 1;
			res.message = "User not in room";
		} else if (!("x" in data) || !("y" in data)) {
			res.error = 2;
			res.message = "Missing coordinates";
		} else if (typeof data.x !== "number" || typeof data.y !== "number") {
			res.error = 2;
			res.message = "Invalid coordinates";
		} else if (data.x < -10 || data.x > 10 || data.y < -5 || data.y > 5) {
			res.error = 3;
			res.message = "Wrong coordinates";
		} else {
			conn.user.x = data.x;
			conn.user.y = data.y;
			res.error = 0;
			res.data = { user: uuid, x: data.x, y: data.y };
			this.broadcast(res);
		}
		if (res.error !== 0) this.send(uuid, res);
	}

	getMessage(uuid: string, data: any): void {
		const res: any = { method: "message" };
		const conn = this.connections[uuid];
		if (!conn?.user) {
			res.error = 1;
			res.message = "User not in room";
		} else if (!("message" in data)) {
			res.error = 2;
			res.message = "Missing message";
		} else if (data.message.trim() === "") {
			res.error = 2;
			res.message = "Message is empty";
		} else {
			res.error = 0;
			res.data = {
				name: conn.user!.name,
				message: data.message.trim().substring(0, 250),
			};
			this.broadcast(res);
		}
		if (res.error !== 0) this.send(uuid, res);
	}

	getUsers(uuid: string): void {
		const users: { uuid: string; user: UserData }[] = [];
		for (const [id, c] of Object.entries(this.connections)) {
			if (c.user) users.push({ uuid: id, user: c.user });
		}
		this.send(uuid, { method: "users", error: 0, data: users });
	}
}
