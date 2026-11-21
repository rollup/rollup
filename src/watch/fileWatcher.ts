import chokidar, { type FSWatcher } from 'chokidar';
import { existsSync } from 'node:fs';
import type { ChangeEvent, ChokidarOptions } from '../rollup/types';
import type { Task } from './watch';

export class FileWatcher {
	private readonly chokidarOptions: ChokidarOptions;
	private readonly task: Task;
	private readonly transformWatchers = new Map<string, FSWatcher>();
	private readonly watcher: FSWatcher;

	constructor(task: Task, chokidarOptions: ChokidarOptions) {
		this.chokidarOptions = chokidarOptions;
		this.task = task;
		this.watcher = this.createWatcher(null);
	}

	close(): void {
		this.watcher.close();
		for (const watcher of this.transformWatchers.values()) {
			watcher.close();
		}
	}

	unwatch(id: string): void {
		this.watcher.unwatch(id);
		const transformWatcher = this.transformWatchers.get(id);
		if (transformWatcher) {
			this.transformWatchers.delete(id);
			transformWatcher.close();
		}
	}

	watch(id: string, isTransformDependency: boolean): void {
		if (isTransformDependency) {
			const watcher = this.transformWatchers.get(id) ?? this.createWatcher(id);
			watcher.add(id);
			this.transformWatchers.set(id, watcher);
		} else {
			this.watcher.add(id);
		}
	}

	private createWatcher(transformWatcherId: string | null): FSWatcher {
		const task = this.task;
		const isTransformDependency = transformWatcherId !== null;
		const handleChange = (id: string, event: ChangeEvent) => {
			const changedId = transformWatcherId || id;
			if (event === 'update' && !existsSync(changedId)) {
				// There is no content left to load as the deletion that follows reports the removal.
				return;
			}
			task.invalidate(changedId, { event, isTransformDependency });
		};
		const watcher = chokidar
			.watch([], this.chokidarOptions)
			.on('add', id => handleChange(id, 'create'))
			.on('change', id => handleChange(id, 'update'))
			.on('unlink', id => handleChange(id, 'delete'));
		return watcher;
	}
}
