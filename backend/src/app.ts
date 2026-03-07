import { existsSync, readFileSync, writeFileSync } from "fs";
import { Common } from "./common";
import { WebServer } from "./webserver";

class App {
	async run() {
		const args = process.argv.slice(2);
		let i = 0;
		let command: string | undefined;
		while (i < args.length) {
			switch (args[i]) {
				case "--privkey":
					this.privkey = args[++i]!;
					break;
				case "--pubkey":
					this.pubkey = args[++i]!;
					break;
				case "--port":
					this.port = parseInt(args[++i]!, 10);
					break;
				case "--host":
					this.host = args[++i]!;
					break;
				case "--secure":
					this.secure = true;
					break;
				case "--create-settings":
					command = "create-settings";
					break;
				case "--help":
					command = "help";
					break;
				default:
					break;
			}
			i++;
		}
		switch (command) {
			case "create-settings":
				this.createSettings();
				break;
			case "help":
				this.getHelp();
				break;
			default:
				this.startServer();
				break;
		}
	}

	privkey?: string;
	pubkey?: string;
	port?: number;
	host?: string;
	secure?: boolean;

	startServer() {
		this.loadSettings();
		if (this.privkey) Common.settings.web.privkey = this.privkey;
		if (this.pubkey) Common.settings.web.pubkey = this.pubkey;
		if (this.port) Common.settings.web.port = this.port;
		if (this.host) Common.settings.web.hostname = this.host;
		if (this.secure) Common.settings.web.secure = true;
		const header = `${Common.appName} ver. ${Common.appVersion}`;
		const dashes = "=".repeat(header.length);
		Common.addLog("");
		Common.addLog(dashes);
		Common.addLog(header);
		Common.addLog(dashes);
		Common.addLog("");
		const webServer = new WebServer();
		webServer.run();
	}

	getHelp() {
		Common.addLog("Command line arguments:");
		Common.addLog("");
		Common.addLog("--help - to see this help");
		Common.addLog(
			`--create-settings - to create a default settings file named "${Common.settingsFile}"`,
		);
		Common.addLog("");
	}

	loadSettings() {
		const settingsPath = Common.appPath + Common.settingsFile;
		if (!existsSync(settingsPath)) {
			Common.addLog(
				`Settings file "${Common.settingsFile}" not found, creating default...`,
			);
			this.createSettings();
		}
		Common.settings = JSON.parse(
			readFileSync(settingsPath, { encoding: "utf8" }),
		);
	}

	createSettings() {
		if (existsSync(Common.appPath + Common.settingsFile)) {
			Common.addLog(
				`The settings file "${Common.settingsFile}" already exists. If you need to replace it with a default one, delete the old one first.`,
				2,
			);
			process.exit(1);
		} else {
			const settings = {
				web: {
					port: 7010,
					secure: false,
					privkey: "",
					pubkey: "",
				},
				other: {
					log_to_file: true,
					log_file: "virtual-chat.log",
				},
			};
			writeFileSync(
				Common.appPath + Common.settingsFile,
				JSON.stringify(settings, null, " "),
			);
			Common.addLog(
				`The settings file "${Common.settingsFile}" has been successfully created.`,
			);
		}
	}
}

const app = new App();
app.run();
