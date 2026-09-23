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
import { waitForAllAndRethrowFirstFailure } from './WatchEmitter';

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
	closed = false;

	private buildDelay = 0;
	private buildTimeout: ReturnType<typeof setTimeout> | null = null;
	private readonly invalidatedIds = new Map<string, ChangeEvent>();
	private rerun = false;
	// Starts held so that invalidations before the initial run only request a rerun.
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
		process.nextTick(() => this.runExclusively(() => this.run()));
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
		if (this.closed) return;
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

		this.buildTimeout = setTimeout(() => {
			this.buildTimeout = null;
			this.runExclusively(() => this.announceChangesAndRebuild());
		}, this.buildDelay);
	}

	// The running flag spans the whole cycle, including async listeners, so
	// that invalidations meanwhile only request a rerun.
	private async runExclusively(cycle: () => Promise<void>): Promise<void> {
		this.running = true;
		try {
			await cycle();
		} catch (error: any) {
			await this.reportError(error);
		} finally {
			this.running = false;
		}
		if (this.rerun) {
			this.rerun = false;
			this.invalidate();
		}
	}

	private async announceChangesAndRebuild(): Promise<void> {
		await this.announcePendingChanges();
		if (this.closed || !this.hasInvalidatedTask()) {
			// Skipping the restart keeps the plugin listeners of the last run registered.
			return;
		}
		await this.emitter.emit('restart');
		await this.announcePendingChanges();
		if (this.closed) return;
		this.emitter.removeListenersForCurrentRun();
		await this.run();
	}

	// The upcoming run consumes announced changes via the task flags, making
	// their rerun requests obsolete. The reset must directly follow the last
	// emptiness check so that no change slips through unannounced.
	private async announcePendingChanges(): Promise<void> {
		while (this.invalidatedIds.size > 0) {
			await this.announceChangeBatch();
		}
		this.rerun = false;
	}

	// Cleared before emitting so that changes arriving during slow hooks,
	// including follow-ups of the same file, form the next batch instead of
	// being dropped with this one.
	private async announceChangeBatch(): Promise<void> {
		const changes = [...this.invalidatedIds];
		this.invalidatedIds.clear();
		await waitForAllAndRethrowFirstFailure(
			changes.map(([id, event]) => this.emitter.emit('change', id, { event }))
		);
	}

	private hasInvalidatedTask(): boolean {
		return this.tasks.some(task => task.isInvalidated());
	}

	private async reportError(error: any): Promise<void> {
		await this.emitter.emit('event', {
			code: 'ERROR',
			error,
			result: null
		});
		await this.emitter.emit('event', {
			code: 'END'
		});
	}

	private async run(): Promise<void> {
		await this.emitter.emit('event', {
			code: 'START'
		});
		for (const task of this.tasks) {
			await task.run();
		}
		if (this.closed) return;
		await this.emitter.emit('event', {
			code: 'END'
		});
	}
}

export class Task {
	cache: RollupCache = { modules: [] };
	watchFiles: string[] = [];

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
		if (!this.invalidated || this.watcher.closed) return;
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
		if (this.watcher.closed) {
			return;
		}
		let result: RollupBuild | null = null;

		try {
			result = await rollupInternal(options, this.watcher.emitter);
			if (this.watcher.closed) {
				return;
			}
			this.updateWatchedFiles(result);
			if (!this.skipWrite) {
				await Promise.all(this.outputs.map(output => result!.write(output)));
				if (this.watcher.closed) {
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
			if (!this.watcher.closed) {
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
