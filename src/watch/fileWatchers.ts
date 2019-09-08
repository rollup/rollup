import { FSWatcher, WatchOptions } from 'chokidar';
import * as fs from 'fs';
import chokidar from './chokidar';
import { Task } from './index';

const opts = { encoding: 'utf-8', persistent: true };

const watchers = new Map<string, Map<string, FileWatcher>>();

export function addTask(
	id: string,
	task: Task,
	chokidarOptions: WatchOptions,
	chokidarOptionsHash: string,
	isTransformDependency: boolean
) {
	if (!watchers.has(chokidarOptionsHash)) watchers.set(chokidarOptionsHash, new Map());
	const group = watchers.get(chokidarOptionsHash) as Map<string, FileWatcher>;

	const watcher = group.get(id) || new FileWatcher(id, chokidarOptions, group);
	if (!watcher.fsWatcher) {
		if (isTransformDependency) throw new Error(`Transform dependency ${id} does not exist.`);
	} else {
		watcher.addTask(task, isTransformDependency);
	}
}

export function deleteTask(id: string, target: Task, chokidarOptionsHash: string) {
	const group = watchers.get(chokidarOptionsHash) as Map<string, FileWatcher>;
	const watcher = group.get(id);
	if (watcher) watcher.deleteTask(target, group);
}

export default class FileWatcher {
	fsWatcher?: FSWatcher | fs.FSWatcher;

	private id: string;
	private tasks: Set<Task>;
	private transformDependencyTasks: Set<Task>;

	constructor(id: string, chokidarOptions: WatchOptions, group: Map<string, FileWatcher>) {
		this.id = id;
		this.tasks = new Set();
		this.transformDependencyTasks = new Set();

		let modifiedTime: number;

		try {
			const stats = fs.statSync(id);
			modifiedTime = +stats.mtime;
		} catch (err) {
			if (err.code === 'ENOENT') {
				// can't watch files that don't exist (e.g. injected
				// by plugins somehow)
				return;
			}
			throw err;
		}

		const handleWatchEvent = (event: string) => {
			if (event === 'rename' || event === 'unlink') {
				this.close();
				group.delete(id);
				this.trigger(id);
				return;
			} else {
				let stats: fs.Stats;
				try {
					stats = fs.statSync(id);
				} catch (err) {
					if (err.code === 'ENOENT') {
						modifiedTime = -1;
						this.trigger(id);
						return;
					}
					throw err;
				}
				// debounce
				if (+stats.mtime - modifiedTime > 15) this.trigger(id);
			}
		};

		this.fsWatcher = chokidarOptions
			? chokidar.watch(id, chokidarOptions).on('all', handleWatchEvent)
			: fs.watch(id, opts, handleWatchEvent);

		group.set(id, this);
	}

	addTask(task: Task, isTransformDependency: boolean) {
		if (isTransformDependency) this.transformDependencyTasks.add(task);
		else this.tasks.add(task);
	}

	close() {
		if (this.fsWatcher) this.fsWatcher.close();
	}

	deleteTask(task: Task, group: Map<string, FileWatcher>) {
		let deleted = this.tasks.delete(task);
		deleted = this.transformDependencyTasks.delete(task) || deleted;

		if (deleted && this.tasks.size === 0 && this.transformDependencyTasks.size === 0) {
			group.delete(this.id);
			this.close();
		}
	}

	trigger(id: string) {
		this.tasks.forEach(task => {
			task.invalidate(id, false);
		});
		this.transformDependencyTasks.forEach(task => {
			task.invalidate(id, true);
		});
	}
}
