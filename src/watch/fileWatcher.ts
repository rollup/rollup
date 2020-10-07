import chokidar, { FSWatcher } from 'chokidar';
import { platform } from 'os';
import { ChokidarOptions } from '../rollup/types';
import { Task } from './watch';

export class FileWatcher {
	private chokidarOptions: ChokidarOptions;
	private task: Task;
	private transformWatchers = new Map<string, FSWatcher>();
	private watcher: FSWatcher;

	constructor(task: Task, chokidarOptions: ChokidarOptions) {
		this.chokidarOptions = chokidarOptions;
		this.task = task;
		this.watcher = this.createWatcher(null);
	}

	close() {
		this.watcher.close();
		for (const watcher of this.transformWatchers.values()) {
			watcher.close();
		}
	}

	unwatch(id: string) {
		this.watcher.unwatch(id);
		const transformWatcher = this.transformWatchers.get(id);
		if (transformWatcher) {
			this.transformWatchers.delete(id);
			transformWatcher.close();
		}
	}

	watch(id: string, isTransformDependency: boolean) {
		if (isTransformDependency) {
			const watcher = this.transformWatchers.get(id) || this.createWatcher(id);
			watcher.add(id);
			this.transformWatchers.set(id, watcher);
		} else {
			this.watcher.add(id);
		}
	}

	private createWatcher(transformWatcherId: string | null): FSWatcher {
		const task = this.task;
		const isLinux = platform() === 'linux';
		const isTransformDependency = transformWatcherId !== null;
		const handleChange = (id: string) => {
			const changedId = transformWatcherId || id;
			if (isLinux) {
				// unwatching and watching fixes an issue with chokidar where on certain systems,
				// a file that was unlinked and immediately recreated would create a change event
				// but then no longer any further events
				watcher.unwatch(changedId);
				watcher.add(changedId);
			}
			task.invalidate(changedId, isTransformDependency);
		};
		const watcher = chokidar
			.watch([], this.chokidarOptions)
			.on('add', handleChange)
			.on('change', handleChange)
			.on('unlink', handleChange);
		return watcher;
	}
}
