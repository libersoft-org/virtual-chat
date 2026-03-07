import { existsSync } from 'fs';
import { Socket } from './socket';
import { Common, LogLevel } from './common';
import type { Server } from 'bun';

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
		const srv: any = {
			port: Common.settings.web.port,
			fetch: (req: Request, server: any) => {
				if (server.upgrade(req)) return;
				return new Response('Not found', { status: 404 });
			},
			websocket: {
				open: (ws: any) => this.socket.onOpen(ws),
				message: (ws: any, json: any) => this.socket.onMessage(ws, json),
				close: (ws: any, _code: number, _message: string) => this.socket.onClose(ws),
			},
		};
		if (Common.settings.web.hostname) srv.hostname = Common.settings.web.hostname;
		if (Common.settings.web.secure) {
			const keyPath = Common.settings.web.privkey;
			const certPath = Common.settings.web.pubkey;
			if (keyPath && certPath && existsSync(keyPath) && existsSync(certPath)) {
				srv.tls = { key: Bun.file(keyPath), cert: Bun.file(certPath) };
			}
		}
		this.server = Bun.serve(srv);
		Common.addLog(`WebSocket server is running on ${Common.settings.web.secure ? 'wss' : 'ws'}://${Common.settings.web.hostname || '0.0.0.0'}:${Common.settings.web.port}`);
	}

	shutdown(): void {
		Common.addLog('Shutting down...');
		for (const ws of Object.values(this.socket.connections)) {
			ws.close(1001, 'Server shutting down');
		}
		this.server?.stop();
		Common.addLog('Server stopped.');
	}
}
