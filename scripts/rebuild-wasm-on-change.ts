import chokidar from 'chokidar';
import { spawn } from 'node:child_process';
import type { Stats } from 'node:fs';

const DEBOUNCE_MILLISECONDS = 1000;
let isRebuilding = false;
let isRebuildQueued = false;
let debounceTimer: NodeJS.Timeout | undefined;

const rebuild = (): void => {
	debounceTimer = undefined;
	if (isRebuilding) {
		isRebuildQueued = true;
		return;
	}
	isRebuilding = true;
	const buildProcess = spawn('npm', ['run', 'build:wasm'], {
		shell: process.platform === 'win32',
		stdio: 'inherit'
	});
	buildProcess.on('exit', () => {
		isRebuilding = false;
		if (isRebuildQueued) {
			isRebuildQueued = false;
			rebuild();
		}
	});
};

const scheduleRebuild = (): void => {
	if (debounceTimer === undefined) {
		console.log('Rust source change detected, rebuilding WASM bindings...');
	}
	clearTimeout(debounceTimer);
	debounceTimer = setTimeout(rebuild, DEBOUNCE_MILLISECONDS);
};

const watcher = chokidar.watch('rust', {
	ignored: (path: string, stats?: Stats) => {
		if (stats?.isFile()) return !path.endsWith('.rs');
		return /(^|[\\/])target([\\/]|$)/.test(path);
	}
});

watcher.on('ready', () => {
	console.log('Watching Rust sources for changes, building WASM bindings...');
	rebuild();
	watcher.on('add', scheduleRebuild);
	watcher.on('change', scheduleRebuild);
	watcher.on('unlink', scheduleRebuild);
});
