import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

function getCommitHash(): string {
	try {
		return execSync('git rev-parse --short HEAD').toString().trim();
	} catch {
		return 'unknown';
	}
}

function getBuildDate(): string {
	const now = new Date();
	return now
		.toISOString()
		.replace('T', ' ')
		.replace(/\.\d{3}Z$/, ' UTC');
}

export default defineConfig({
	plugins: [sveltekit()],
	define: {
		__BUILD_DATE__: JSON.stringify(getBuildDate()),
		__COMMIT_HASH__: JSON.stringify(getCommitHash()),
	},
	server: {
		...(() => {
			const keyPath = process.env['VITE_SSL_KEY'];
			const certPath = process.env['VITE_SSL_CERT'];
			if (keyPath && certPath && fs.existsSync(keyPath) && fs.existsSync(certPath)) {
				return {
					https: {
						key: fs.readFileSync(keyPath),
						cert: fs.readFileSync(certPath),
					},
				};
			}
			if (fs.existsSync(path.resolve(__dirname, 'server.key'))) {
				return {
					https: {
						key: fs.readFileSync(path.resolve(__dirname, 'server.key')),
						cert: fs.readFileSync(path.resolve(__dirname, 'server.crt')),
					},
				};
			}
			if (fs.existsSync(path.resolve(__dirname, 'certs/server.key'))) {
				return {
					https: {
						key: fs.readFileSync(path.resolve(__dirname, 'certs/server.key')),
						cert: fs.readFileSync(path.resolve(__dirname, 'certs/server.crt')),
					},
				};
			}
			return {};
		})(),
		allowedHosts: true,
		host: true,
		port: 7011,
		watch: {
			usePolling: true,
		},
	},
});
