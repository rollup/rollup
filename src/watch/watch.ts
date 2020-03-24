import * as path from 'path';
import createFilter from 'rollup-pluginutils/src/createFilter';
import { rollupInternal } from '../rollup/rollup';
import {
	InputOptions,
	OutputOptions,
	RollupBuild,
	RollupCache,
	RollupWatcher,
	WatcherOptions
} from '../rollup/types';
import { mergeOptions } from '../utils/mergeOptions';
import { GenericConfigObject } from '../utils/parseOptions';
import { FileWatcher } from './fileWatcher';

const DELAY = 200;

export class Watcher {
	emitter: RollupWatcher;

	private buildTimeout: NodeJS.Timer | null = null;
	private invalidatedIds: Set<string> = new Set();
	private rerun = false;
	private running: boolean;
	private tasks: Task[];

	constructor(configs: GenericConfigObject[] | GenericConfigObject, emitter: RollupWatcher) {
		this.emitter = emitter;
		emitter.close = this.close.bind(this);
		this.tasks = (Array.isArray(configs) ? configs : configs ? [configs] : []).map(
			config => new Task(this, config)
		);
		this.running = true;
		process.nextTick(() => this.run());
	}

	close() {
		if (this.buildTimeout) clearTimeout(this.buildTimeout);
		for (const task of this.tasks) {
			task.close();
		}
		this.emitter.removeAllListeners();
	}

	emit(event: string, value?: any) {
		this.emitter.emit(event as any, value);
	}

	invalidate(id?: string) {
		if (id) {
			this.invalidatedIds.add(id);
		}
		if (this.running) {
			this.rerun = true;
			return;
		}

		if (this.buildTimeout) clearTimeout(this.buildTimeout);

		this.buildTimeout = setTimeout(() => {
			this.buildTimeout = null;
			for (const id of this.invalidatedIds) {
				this.emit('change', id);
			}
			this.invalidatedIds.clear();
			this.emit('restart');
			this.run();
		}, DELAY);
	}

	private async run() {
		this.running = true;

		this.emit('event', {
			code: 'START'
		});

		try {
			for (const task of this.tasks) {
				await task.run();
			}
			this.running = false;
			this.emit('event', {
				code: 'END'
			});
		} catch (error) {
			this.running = false;
			this.emit('event', {
				code: 'ERROR',
				error
			});
		}

		if (this.rerun) {
			this.rerun = false;
			this.invalidate();
		}
	}
}

export class Task {
	cache: RollupCache = { modules: [] };
	watchFiles: string[] = [];

	private closed: boolean;
	private fileWatcher: FileWatcher;
	private filter: (id: string) => boolean;
	private inputOptions: InputOptions;
	private invalidated = true;
	private outputFiles: string[];
	private outputs: OutputOptions[];
	private skipWrite: boolean;
	private watched: Set<string>;
	private watcher: Watcher;

	constructor(watcher: Watcher, config: GenericConfigObject) {
		this.watcher = watcher;
		this.closed = false;
		this.watched = new Set();

		this.skipWrite = config.watch && !!(config.watch as GenericConfigObject).skipWrite;
		const { inputOptions, outputOptions } = mergeOptions(config);
		this.inputOptions = inputOptions;
		this.outputs = outputOptions;
		this.outputFiles = this.outputs.map(output => {
			if (output.file || output.dir) return path.resolve(output.file || output.dir!);
			return undefined as any;
		});

		const watchOptions: WatcherOptions = inputOptions.watch || {};
		this.filter = createFilter(watchOptions.include, watchOptions.exclude);
		this.fileWatcher = new FileWatcher(this, {
			...watchOptions.chokidar,
			disableGlobbing: true,
			ignoreInitial: true
		});
	}

	close() {
		this.closed = true;
		this.fileWatcher.close();
	}

	invalidate(id: string, isTransformDependency: boolean | undefined) {
		this.invalidated = true;
		if (isTransformDependency) {
			for (const module of this.cache.modules) {
				if (module.transformDependencies.indexOf(id) === -1) continue;
				// effective invalidation
				module.originalCode = null as any;
			}
		}
		this.watcher.invalidate(id);
	}

	async run() {
		if (!this.invalidated) return;
		this.invalidated = false;

		const options = {
			...this.inputOptions,
			cache: this.cache
		};

		const start = Date.now();

		this.watcher.emit('event', {
			code: 'BUNDLE_START',
			input: this.inputOptions.input,
			output: this.outputFiles
		});

		try {
			const result = await rollupInternal(options, this.watcher.emitter);
			if (this.closed) {
				return;
			}
			this.updateWatchedFiles(result);
			this.skipWrite || (await Promise.all(this.outputs.map(output => result.write(output))));
			this.watcher.emit('event', {
				code: 'BUNDLE_END',
				duration: Date.now() - start,
				input: this.inputOptions.input,
				output: this.outputFiles,
				result
			});
		} catch (error) {
			if (this.closed) {
				return;
			}

			if (Array.isArray(error.watchFiles)) {
				for (const id of error.watchFiles) {
					this.watchFile(id);
				}
			}
			if (error.id) {
				this.cache.modules = this.cache.modules.filter(module => module.id !== error.id);
			}
			throw error;
		}
	}

	private updateWatchedFiles(result: RollupBuild) {
		const previouslyWatched = this.watched;
		this.watched = new Set();
		this.watchFiles = result.watchFiles;
		this.cache = result.cache;
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
