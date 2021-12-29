import { resolve } from 'path';
import { createFilter } from '@rollup/pluginutils';
import { rollupInternal } from '../rollup/rollup';
import {
	ChangeEvent,
	MergedRollupOptions,
	OutputOptions,
	RollupBuild,
	RollupCache,
	RollupWatcher,
	WatcherOptions
} from '../rollup/types';
import { mergeOptions } from '../utils/options/mergeOptions';
import { GenericConfigObject } from '../utils/options/options';
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
	private buildTimeout: NodeJS.Timer | null = null;
	private readonly invalidatedIds = new Map<string, ChangeEvent>();
	private rerun = false;
	private running = true;
	private readonly tasks: Task[];

	constructor(configs: readonly GenericConfigObject[], emitter: RollupWatcher) {
		this.emitter = emitter;
		emitter.close = this.close.bind(this);
		this.tasks = configs.map(config => new Task(this, config));
		this.buildDelay = configs.reduce(
			(buildDelay, { watch }) =>
				watch && typeof (watch as WatcherOptions).buildDelay === 'number'
					? Math.max(buildDelay, (watch as WatcherOptions).buildDelay!)
					: buildDelay,
			this.buildDelay
		);
		process.nextTick(() => this.run());
	}

	close(): void {
		if (this.buildTimeout) clearTimeout(this.buildTimeout);
		for (const task of this.tasks) {
			task.close();
		}
		this.emitter.emit('close');
		this.emitter.removeAllListeners();
	}

	invalidate(file?: { event: ChangeEvent; id: string }): void {
		if (file) {
			const prevEvent = this.invalidatedIds.get(file.id);
			const event = prevEvent ? eventsRewrites[prevEvent][file.event] : file.event;

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
			for (const [id, event] of this.invalidatedIds.entries()) {
				this.emitter.emit('change', id, { event });
			}
			this.invalidatedIds.clear();
			this.emitter.emit('restart');
			this.run();
		}, this.buildDelay);
	}

	private async run(): Promise<void> {
		this.running = true;
		this.emitter.emit('event', {
			code: 'START'
		});

		for (const task of this.tasks) {
			await task.run();
		}

		this.running = false;
		this.emitter.emit('event', {
			code: 'END'
		});
		if (this.rerun) {
			this.rerun = false;
			this.invalidate();
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

	constructor(watcher: Watcher, config: GenericConfigObject) {
		this.watcher = watcher;

		this.skipWrite = Boolean(config.watch && (config.watch as GenericConfigObject).skipWrite);
		this.options = mergeOptions(config);
		this.outputs = this.options.output;
		this.outputFiles = this.outputs.map(output => {
			if (output.file || output.dir) return resolve(output.file || output.dir!);
			return undefined as never;
		});

		const watchOptions: WatcherOptions = this.options.watch || {};
		this.filter = createFilter(watchOptions.include, watchOptions.exclude);
		this.fileWatcher = new FileWatcher(this, {
			...watchOptions.chokidar,
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
				if (module.transformDependencies.indexOf(id) === -1) continue;
				// effective invalidation
				module.originalCode = null as never;
			}
		}
		this.watcher.invalidate({ event: details.event, id });
	}

	async run(): Promise<void> {
		if (!this.invalidated) return;
		this.invalidated = false;

		const options = {
			...this.options,
			cache: this.cache
		};

		const start = Date.now();

		this.watcher.emitter.emit('event', {
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
			this.skipWrite || (await Promise.all(this.outputs.map(output => result!.write(output))));
			this.watcher.emitter.emit('event', {
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
			this.watcher.emitter.emit('event', {
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
			for (const depId of module.transformDependencies) {
				this.watchFile(depId, true);
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

		if (this.outputFiles.some(file => file === id)) {
			throw new Error('Cannot import the generated bundle');
		}

		// this is necessary to ensure that any 'renamed' files
		// continue to be watched following an error
		this.fileWatcher.watch(id, isTransformDependency);
	}
}
