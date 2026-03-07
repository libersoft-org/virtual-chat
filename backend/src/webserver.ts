import { chmodSync, existsSync } from "fs";
import { Socket } from "./socket";
import { Common } from "./common";

export class WebServer {
	socket: Socket = new Socket();

	async run(): Promise<void> {
		try {
			await this.startServer();
		} catch (ex) {
			Common.addLog("Cannot start web server.", 2);
			Common.addLog(ex, 2);
		}
	}

	async startServer(): Promise<void> {
		const srv: any = {
			fetch: (req: Request, server: any) => {
				if (server.upgrade(req)) return;
				return new Response("Not found", { status: 404 });
			},
			websocket: {
				open: (ws: any) => this.socket.onOpen(ws),
				message: (ws: any, json: any) => this.socket.onMessage(ws, json),
			close: (ws: any, _code: number, _message: string) =>
					this.socket.onClose(ws),
			},
		};
		if (Common.settings.web.standalone) {
			srv.port = Common.settings.web.port;
			if (Common.settings.web.hostname) srv.hostname = Common.settings.web.hostname;
			const keyPath = Common.settings.web.privkey;
			const certPath = Common.settings.web.pubkey;
			if (keyPath && certPath && existsSync(keyPath) && existsSync(certPath)) {
				srv.tls = { key: Bun.file(keyPath), cert: Bun.file(certPath) };
			}
		} else {
			srv.unix = Common.settings.web.socket_path;
		}
		Bun.serve(srv);
		if (!Common.settings.web.standalone) {
			chmodSync(Common.settings.web.socket_path, "777");
		}
		Common.addLog(
			Common.settings.web.standalone
				? `WebSocket server is running on ${srv.tls ? "wss" : "ws"}://${Common.settings.web.hostname || "0.0.0.0"}:${Common.settings.web.port}`
				: `WebSocket server is running on unix:${Common.settings.web.socket_path}`,
		);
	}
}
