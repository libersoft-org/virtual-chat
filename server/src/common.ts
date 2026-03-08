import { appendFileSync } from 'fs';
import { EOL } from 'os';
import { dirname } from 'path';
export const LogLevel = {
	Info: 0,
	Warning: 1,
	Error: 2,
} as const;
type LogLevel = (typeof LogLevel)[keyof typeof LogLevel];

interface Settings {
	web: {
		port: number;
		hostname?: string;
		secure?: boolean;
		privkey?: string;
		pubkey?: string;
	};
	limits?: {
		moves_per_second?: number;
		messages_per_second?: number;
		idle_timeout?: number;
	};
	other: {
		log_to_file: boolean;
		log_file: string;
	};
}

export class Common {
	static appName = 'Virtual chat';
	static appVersion = '1.00';
	static settingsFile = 'settings.json';
	static appPath: string = dirname(Bun.main) + '/';
	static settings: Settings;

	static addLog(message: unknown = '', level: LogLevel = LogLevel.Info): void {
		const d = new Date();
		const pad = (num: number) => num.toString().padStart(2, '0');
		const date = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
		const msg = message === undefined ? '' : String(message);
		let typeText = 'INFO';
		let color = '\x1b[32m';
		switch (level) {
			case LogLevel.Warning:
				typeText = 'WARNING';
				color = '\x1b[33m';
				break;
			case LogLevel.Error:
				typeText = 'ERROR';
				color = '\x1b[31m';
		}
		console.log(`\x1b[96m${date}\x1b[0m [${color}${typeText}\x1b[0m] ${msg}`);
		if (this.settings?.other?.log_to_file) appendFileSync(this.appPath + this.settings.other.log_file, `${date} [${typeText}] ${msg}${EOL}`);
	}
}
