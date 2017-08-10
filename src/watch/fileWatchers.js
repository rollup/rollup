
import * as fs from 'fs';
import chokidar from './chokidar.js';

const opts = { encoding: 'utf-8', persistent: true };

const watchers = new Map();

export function addTask(id, task, chokidarOptions, chokidarOptionsHash) {
	if (!watchers.has(chokidarOptionsHash)) watchers.set(chokidarOptionsHash, new Map());
	const group = watchers.get(chokidarOptionsHash);

	if (!group.has(id)) {
		const watcher = new FileWatcher(id, chokidarOptions, () => {
			group.delete(id);
		});

		if (watcher.fileExists) {
			group.set(id, watcher);
		} else {
			return;
		}
	}

	group.get(id).tasks.add(task);
}

export function deleteTask(id, target, chokidarOptionsHash) {
	const group = watchers.get(chokidarOptionsHash);

	const watcher = group.get(id);
	watcher.tasks.delete(target);

	if (watcher.tasks.size === 0) {
		watcher.close();
		group.delete(id);
	}
}

export default class FileWatcher {
	constructor(id, chokidarOptions, dispose) {
		this.tasks = new Set();

		let data;

		try {
			fs.statSync(id);
			this.fileExists = true;
		} catch (err) {
			if (err.code === 'ENOENT') {
				// can't watch files that don't exist (e.g. injected
				// by plugins somehow)
				this.fileExists = false;
				return;
			} else {
				throw err;
			}
		}

		const handleWatchEvent = event => {
			if (event === 'rename' || event === 'unlink') {
				this.fsWatcher.close();
				dispose();
				this.trigger();
			} else {
				// this is necessary because we get duplicate events...
				const contents = fs.readFileSync(id, 'utf-8');
				if (contents !== data) {
					data = contents;
					this.trigger();
				}
			}
		};

		if (chokidarOptions) {
			this.fsWatcher = chokidar
				.watch(id, chokidarOptions)
				.on('all', handleWatchEvent);
		} else {
			this.fsWatcher = fs.watch(id, opts, handleWatchEvent);
		}
	}

	close() {
		this.fsWatcher.close();
	}

	trigger() {
		this.tasks.forEach(task => {
			task.makeDirty();
		});
	}
}
