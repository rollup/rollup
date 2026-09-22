import { createFilter } from '@rollup/pluginutils';
import path from 'node:path';
import process from 'node:process';
import { rollupInternal } from '../rollup/rollup';
import type {
	ChangeEvent,
	MergedRollupOptions,
	OutputOptions,
	RollupBuild,
	RollupCache,
	RollupWatcher,
	WatcherOptions
} from '../rollup/types';
import { FileWatcher } from './fileWatcher';

const eventsRewrites: Record<ChangeEvent, Record<ChangeEvent, ChangeEvent | 'buggy' | null>> = {
	create: {
		create: 'buggy',
		delete: null, //delete file from map
		update: 'create'
	},
	delete: {
		create: 'update',
		delete: 'buggy',
		update: 'buggy'
	},
	update: {
		create: 'buggy',
		delete: 'delete',
		update: 'update'
	}
};

export class Watcher {
	readonly emitter: RollupWatcher;

	private buildDelay = 0;
	private buildTimeout: ReturnType<typeof setTimeout> | null = null;
	private closed = false;
	private readonly invalidatedIds = new Map<string, ChangeEvent>();
	private rerun = false;
	// Held from construction until the initial run releases it so that
	// invalidations before that run request a rerun instead of a concurrent
	// cycle. Each later cycle acquires it before announcing the change
	// events, see invalidate().
	private running = true;
	private readonly tasks: Task[];

	constructor(optionsList: readonly MergedRollupOptions[], emitter: RollupWatcher) {
		this.emitter = emitter;
		emitter.close = this.close.bind(this);
		this.tasks = optionsList.map(options => new Task(this, options));
		for (const { watch } of optionsList) {
			if (watch && typeof watch.buildDelay === 'number') {
				this.buildDelay = Math.max(this.buildDelay, watch.buildDelay!);
			}
		}
		process.nextTick(() => this.run());
	}

	async close(): Promise<void> {
		if (this.closed) return;
		this.closed = true;
		if (this.buildTimeout) clearTimeout(this.buildTimeout);
		for (const task of this.tasks) {
			task.close();
		}
		await this.emitter.emit('close');
		this.emitter.removeAllListeners();
	}

	invalidate(file?: { event: ChangeEvent; id: string }): void {
		if (file) {
			const previousEvent = this.invalidatedIds.get(file.id);
			const event = previousEvent ? eventsRewrites[previousEvent][file.event] : file.event;

			if (event === 'buggy') {
				//TODO: throws or warn? Currently just ignore, uses new event
				this.invalidatedIds.set(file.id, file.event);
			} else if (event === null) {
				this.invalidatedIds.delete(file.id);
			} else {
				this.invalidatedIds.set(file.id, event);
			}
		}
		if (this.running) {
			this.rerun = true;
			return;
		}

		if (this.buildTimeout) clearTimeout(this.buildTimeout);

		this.buildTimeout = setTimeout(async () => {
			this.buildTimeout = null;
			// The running flag also covers emitting the change and restart
			// events. Async watchChange hooks keep this pending for a while, and
			// invalidations arriving in that window must not start a second run
			// cycle that overlaps with the run started below.
			this.running = true;
			try {
				await this.emitPendingChangeEventsAndClearRerun();
				if (this.tasks.every(task => !task.isInvalidated())) {
					// Every change observed so far has been announced and no task
					// needs a rebuild, so the cycle is complete without a run:
					// keep the plugin event listeners of the last completed run
					// instead of removing them without a replacement.
					this.running = false;
					return;
				}
				await this.emitter.emit('restart');
				// Changes arriving while the restart event is emitted still need
				// to be announced before the run started below consumes them.
				await this.emitPendingChangeEventsAndClearRerun();
				this.emitter.removeListenersForCurrentRun();
			} catch (error: any) {
				this.running = false;
				await this.reportError(error);
				return;
			}
			await this.run();
		}, this.buildDelay);
	}

	// All invalidations that happened in the meantime have been announced, so
	// the rerun requests they left are dropped here: whether another build is
	// needed is decided from the task invalidation flags, and invalidations
	// arriving later set the flag again. Clearing must stay synchronous with
	// the final emptiness check so that no invalidation can slip in between
	// unannounced.
	private async emitPendingChangeEventsAndClearRerun(): Promise<void> {
		while (this.invalidatedIds.size > 0) {
			await this.emitChangeBatch();
		}
		this.rerun = false;
	}

	// Emitting one batch can take a while for async watchChange hooks, and
	// changes arriving in the meantime are announced by a subsequent batch so
	// that they become part of the same run. Clearing the invalidated ids
	// before emitting keeps follow-up changes of the same file, e.g. a delete
	// following an update, from being discarded with the batch they follow.
	private async emitChangeBatch(): Promise<void> {
		const invalidatedIds = [...this.invalidatedIds];
		this.invalidatedIds.clear();
		await Promise.all(
			invalidatedIds.map(([id, event]) => this.emitter.emit('change', id, { event }))
		);
	}

	private async reportError(error: any): Promise<void> {
		this.invalidatedIds.clear();
		await this.emitter.emit('event', {
			code: 'ERROR',
			error,
			result: null
		});
		await this.emitter.emit('event', {
			code: 'END'
		});
	}

	// Requires the running flag to be held by the caller, which is released
	// here before the END event is emitted. A failing run reports itself as
	// ERROR and END events, so the promise only rejects if the reporting
	// itself fails.
	private async run(): Promise<void> {
		try {
			try {
				await this.emitter.emit('event', {
					code: 'START'
				});

				for (const task of this.tasks) {
					await task.run();
				}
			} finally {
				this.running = false;
			}

			await this.emitter.emit('event', {
				code: 'END'
			});
			if (this.rerun) {
				this.rerun = false;
				this.invalidate();
			}
		} catch (error: any) {
			await this.reportError(error);
		}
	}
}

export class Task {
	cache: RollupCache = { modules: [] };
	watchFiles: string[] = [];

	private closed = false;
	private readonly fileWatcher: FileWatcher;
	private filter: (id: string) => boolean;
	private invalidated = true;
	private readonly options: MergedRollupOptions;
	private readonly outputFiles: string[];
	private readonly outputs: OutputOptions[];
	private skipWrite: boolean;
	private watched = new Set<string>();
	private readonly watcher: Watcher;
	private readonly watchOptions: WatcherOptions;

	constructor(watcher: Watcher, options: MergedRollupOptions) {
		this.watcher = watcher;
		this.options = options;

		this.skipWrite = Boolean(options.watch && options.watch.skipWrite);
		this.outputs = this.options.output;
		this.outputFiles = this.outputs.map(output => {
			if (output.file || output.dir) return path.resolve(output.file || output.dir!);
			return undefined as never;
		});

		this.watchOptions = this.options.watch || {};
		this.filter = createFilter(this.watchOptions.include, this.watchOptions.exclude);
		this.fileWatcher = new FileWatcher(this, {
			...this.watchOptions.chokidar,
			disableGlobbing: true,
			ignoreInitial: true
		});
	}

	close(): void {
		this.closed = true;
		this.fileWatcher.close();
	}

	invalidate(id: string, details: { event: ChangeEvent; isTransformDependency?: boolean }): void {
		this.invalidated = true;
		if (details.isTransformDependency) {
			for (const module of this.cache.modules) {
				if (!module.transformDependencies.includes(id)) continue;
				// effective invalidation
				module.originalCode = null as never;
			}
		}
		this.watcher.invalidate({ event: details.event, id });
		this.watchOptions.onInvalidate?.(id);
	}

	isInvalidated(): boolean {
		return this.invalidated;
	}

	async run(): Promise<void> {
		if (!this.invalidated) return;
		this.invalidated = false;

		const options = {
			...this.options,
			cache: this.cache
		};

		const start = Date.now();

		await this.watcher.emitter.emit('event', {
			code: 'BUNDLE_START',
			input: this.options.input,
			output: this.outputFiles
		});
		let result: RollupBuild | null = null;

		try {
			result = await rollupInternal(options, this.watcher.emitter);
			if (this.closed) {
				return;
			}
			this.updateWatchedFiles(result);
			if (!this.skipWrite) {
				await Promise.all(this.outputs.map(output => result!.write(output)));
				if (this.closed) {
					return;
				}
				this.updateWatchedFiles(result!);
			}
			await this.watcher.emitter.emit('event', {
				code: 'BUNDLE_END',
				duration: Date.now() - start,
				input: this.options.input,
				output: this.outputFiles,
				result
			});
		} catch (error: any) {
			if (!this.closed) {
				if (Array.isArray(error.watchFiles)) {
					for (const id of error.watchFiles) {
						this.watchFile(id);
					}
				}
				if (error.id) {
					this.cache.modules = this.cache.modules.filter(module => module.id !== error.id);
				}
			}
			await this.watcher.emitter.emit('event', {
				code: 'ERROR',
				error,
				result
			});
		}
	}

	private updateWatchedFiles(result: RollupBuild) {
		const previouslyWatched = this.watched;
		this.watched = new Set();
		this.watchFiles = result.watchFiles;
		this.cache = result.cache!;
		for (const id of this.watchFiles) {
			this.watchFile(id);
		}
		for (const module of this.cache.modules) {
			for (const dependencyId of module.transformDependencies) {
				this.watchFile(dependencyId, true);
			}
		}
		for (const id of previouslyWatched) {
			if (!this.watched.has(id)) {
				this.fileWatcher.unwatch(id);
			}
		}
	}

	private watchFile(id: string, isTransformDependency = false) {
		if (!this.filter(id)) return;
		this.watched.add(id);

		if (this.outputFiles.includes(id)) {
			throw new Error('Cannot import the generated bundle');
		}

		// this is necessary to ensure that any 'renamed' files
		// continue to be watched following an error
		this.fileWatcher.watch(id, isTransformDependency);
	}
}
