import { existsSync } from 'fs';
import { Socket } from './socket';
import { Common, LogLevel } from './common';
import type { Server, ServerWebSocket } from 'bun';

export class WebServer {
	socket: Socket = new Socket();
	server?: Server<{ uuid: string }>;

	async run(): Promise<void> {
		try {
			await this.startServer();
		} catch (ex) {
			Common.addLog('Cannot start web server.', LogLevel.Error);
			Common.addLog(ex, LogLevel.Error);
		}
	}

	async startServer(): Promise<void> {
		const tls = this.getTls();
		this.server = Bun.serve({
			port: Common.settings.web.port,
			hostname: Common.settings.web.hostname || '0.0.0.0',
			...(tls ? { tls } : {}),
			fetch: (req: Request, server: Server<{ uuid: string }>) => {
				const upgraded = server.upgrade(req, { data: { uuid: crypto.randomUUID() } });
				if (upgraded) return;
				return new Response('Not found', { status: 404 });
			},
			websocket: {
				open: (ws: ServerWebSocket<{ uuid: string }>) => this.socket.onOpen(ws),
				message: (ws: ServerWebSocket<{ uuid: string }>, json: string | Buffer) => this.socket.onMessage(ws, json),
				close: (ws: ServerWebSocket<{ uuid: string }>) => this.socket.onClose(ws),
			},
		});
		Common.addLog(`WebSocket server is running on ${Common.settings.web.secure ? 'wss' : 'ws'}://${Common.settings.web.hostname || '0.0.0.0'}:${Common.settings.web.port}`);
	}

	getTls(): { key: ReturnType<typeof Bun.file>; cert: ReturnType<typeof Bun.file> } | null {
		if (!Common.settings.web.secure) return null;
		const keyPath = Common.settings.web.privkey;
		const certPath = Common.settings.web.pubkey;
		if (keyPath && certPath && existsSync(keyPath) && existsSync(certPath)) return { key: Bun.file(keyPath), cert: Bun.file(certPath) };
		return null;
	}

	shutdown(): void {
		Common.addLog('Shutting down...');
		for (const ws of Object.values(this.socket.connections)) ws.close(1001, 'Server shutting down');
		this.server?.stop();
		Common.addLog('Server stopped.');
	}
}
