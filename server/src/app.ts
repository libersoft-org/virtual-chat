import { existsSync, readFileSync, writeFileSync } from 'fs';
import { Common, LogLevel } from './common';
import { WebServer } from './webserver';

class App {
	async run() {
		const args = process.argv.slice(2);
		let i = 0;
		let help = false;
		while (i < args.length) {
			switch (args[i]) {
				case '--privkey':
					this.privkey = args[++i]!;
					break;
				case '--pubkey':
					this.pubkey = args[++i]!;
					break;
				case '--port': {
					const port = parseInt(args[++i]!, 10);
					if (isNaN(port) || port < 1 || port > 65535) {
						Common.addLog('Invalid port number', LogLevel.Error);
						process.exit(1);
					}
					this.port = port;
					break;
				}
				case '--host':
					this.host = args[++i]!;
					break;
				case '--secure':
					this.secure = true;
					break;
				case '--help':
					help = true;
					break;
				default:
					break;
			}
			i++;
		}
		if (help) {
			this.getHelp();
		} else {
			this.startServer();
		}
	}

	privkey?: string;
	pubkey?: string;
	port?: number;
	host?: string;
	secure?: boolean;

	async startServer() {
		this.loadSettings();
		if (this.privkey) Common.settings.web.privkey = this.privkey;
		if (this.pubkey) Common.settings.web.pubkey = this.pubkey;
		if (this.port) Common.settings.web.port = this.port;
		if (this.host) Common.settings.web.hostname = this.host;
		if (this.secure) Common.settings.web.secure = true;
		const header = `${Common.appName} ver. ${Common.appVersion}`;
		const dashes = '='.repeat(header.length);
		Common.addLog('');
		Common.addLog(dashes);
		Common.addLog(header);
		Common.addLog(dashes);
		Common.addLog('');
		const webServer = new WebServer();
		await webServer.run();
		const shutdown = () => {
			webServer.shutdown();
			process.exit(0);
		};
		process.on('SIGINT', shutdown);
		process.on('SIGTERM', shutdown);
	}

	getHelp() {
		Common.addLog('Command line arguments:');
		Common.addLog('');
		Common.addLog('--help             - to see this help');
		Common.addLog('--port <number>    - set the server port');
		Common.addLog('--host <hostname>  - set the server hostname');
		Common.addLog('--secure           - enable TLS/SSL');
		Common.addLog('--privkey <path>   - path to the private key file');
		Common.addLog('--pubkey <path>    - path to the public key (certificate) file');
		Common.addLog('');
	}

	loadSettings() {
		const settingsPath = Common.appPath + Common.settingsFile;
		if (!existsSync(settingsPath)) {
			Common.addLog(`Settings file "${Common.settingsFile}" not found, creating default...`);
			this.createSettings();
		}
		Common.settings = JSON.parse(readFileSync(settingsPath, { encoding: 'utf8' }));
	}

	createSettings() {
		const settings = {
			web: {
				port: 7010,
				hostname: '0.0.0.0',
				secure: false,
				privkey: '',
				pubkey: '',
			},
			limits: {
				moves_per_second: 10,
				messages_per_second: 3,
				idle_timeout: 900,
			},
			other: {
				log_to_file: true,
				log_file: 'virtual-chat.log',
			},
		};
		writeFileSync(Common.appPath + Common.settingsFile, JSON.stringify(settings, null, ' '));
		Common.addLog(`The settings file "${Common.settingsFile}" has been successfully created.`);
	}
}

const app = new App();
app.run();
