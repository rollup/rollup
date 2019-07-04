import { WatchOptions } from 'chokidar';
import { EventEmitter } from 'events';
import path from 'path';
import createFilter from 'rollup-pluginutils/src/createFilter';
import rollup, { setWatcher } from '../rollup/index';
import {
	InputOptions,
	ModuleJSON,
	OutputOptions,
	RollupBuild,
	RollupCache,
	RollupWatcher,
	WatcherOptions
} from '../rollup/types';
import mergeOptions, { GenericConfigObject } from '../utils/mergeOptions';
import chokidar from './chokidar';
import { addTask, deleteTask } from './fileWatchers';

const DELAY = 200;

export class Watcher {
	emitter: RollupWatcher;

	private buildTimeout: NodeJS.Timer | null = null;
	private invalidatedIds: Set<string> = new Set();
	private rerun = false;
	private running: boolean;
	private succeeded = false;
	private tasks: Task[];

	constructor(configs: GenericConfigObject[]) {
		this.emitter = new (class extends EventEmitter implements RollupWatcher {
			close: () => void;
			constructor(close: () => void) {
				super();
				this.close = close;
				// Allows more than 10 bundles to be watched without
				// showing the `MaxListenersExceededWarning` to the user.
				this.setMaxListeners(Infinity);
			}
		})(this.close.bind(this));
		this.tasks = (Array.isArray(configs) ? configs : configs ? [configs] : []).map(
			config => new Task(this, config)
		);
		this.running = true;
		process.nextTick(() => this.run());
	}

	close() {
		if (this.buildTimeout) clearTimeout(this.buildTimeout);
		this.tasks.forEach(task => {
			task.close();
		});

		this.emitter.removeAllListeners();
	}

	emit(event: string, value?: any) {
		this.emitter.emit(event, value);
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
			this.invalidatedIds.forEach(id => this.emit('change', id));
			this.invalidatedIds.clear();
			this.emit('restart');
			this.run();
		}, DELAY);
	}

	private run() {
		this.running = true;

		this.emit('event', {
			code: 'START'
		});

		let taskPromise = Promise.resolve();
		for (const task of this.tasks) taskPromise = taskPromise.then(() => task.run());
		return taskPromise
			.then(() => {
				this.succeeded = true;
				this.running = false;

				this.emit('event', {
					code: 'END'
				});
			})
			.catch(error => {
				this.running = false;
				this.emit('event', {
					code: this.succeeded ? 'ERROR' : 'FATAL',
					error
				});
			})
			.then(() => {
				if (this.rerun) {
					this.rerun = false;
					this.invalidate();
				}
			});
	}
}

export class Task {
	cache: RollupCache;
	watchFiles: string[] = [];

	private chokidarOptions: WatchOptions;
	private chokidarOptionsHash: string;
	private closed: boolean;
	private filter: (id: string) => boolean;
	private inputOptions: InputOptions;
	private invalidated = true;
	private outputFiles: string[];
	private outputs: OutputOptions[];
	private watched: Set<string>;
	private watcher: Watcher;

	constructor(watcher: Watcher, config: GenericConfigObject) {
		this.cache = null as any;
		this.watcher = watcher;

		this.closed = false;
		this.watched = new Set();

		const { inputOptions, outputOptions } = mergeOptions({
			config
		});
		this.inputOptions = inputOptions;

		this.outputs = outputOptions;
		this.outputFiles = this.outputs.map(output => {
			if (output.file || output.dir) return path.resolve(output.file || (output.dir as string));
			return undefined as any;
		});

		const watchOptions: WatcherOptions = inputOptions.watch || {};
		if ('useChokidar' in watchOptions)
			(watchOptions as any).chokidar = (watchOptions as any).useChokidar;
		let chokidarOptions = 'chokidar' in watchOptions ? watchOptions.chokidar : !!chokidar;
		if (chokidarOptions) {
			chokidarOptions = {
				...(chokidarOptions === true ? {} : chokidarOptions),
				disableGlobbing: true,
				ignoreInitial: true
			};
		}

		if (chokidarOptions && !chokidar) {
			throw new Error(
				`watch.chokidar was provided, but chokidar could not be found. Have you installed it?`
			);
		}

		this.chokidarOptions = chokidarOptions as WatchOptions;
		this.chokidarOptionsHash = JSON.stringify(chokidarOptions);

		this.filter = createFilter(watchOptions.include, watchOptions.exclude);
	}

	close() {
		this.closed = true;
		this.watched.forEach(id => {
			deleteTask(id, this, this.chokidarOptionsHash);
		});
	}

	invalidate(id: string, isTransformDependency: boolean) {
		this.invalidated = true;
		if (isTransformDependency) {
			(this.cache.modules as ModuleJSON[]).forEach(module => {
				if (!module.transformDependencies || module.transformDependencies.indexOf(id) === -1)
					return;
				// effective invalidation
				module.originalCode = null as any;
			});
		}
		this.watcher.invalidate(id);
	}

	run() {
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

		setWatcher(this.watcher.emitter);
		return rollup(options)
			.then(result => {
				if (this.closed) return undefined as any;
				const previouslyWatched = this.watched;
				const watched = (this.watched = new Set());

				this.cache = result.cache;
				this.watchFiles = result.watchFiles;
				for (const module of this.cache.modules as ModuleJSON[]) {
					if (module.transformDependencies) {
						module.transformDependencies.forEach(depId => {
							watched.add(depId);
							this.watchFile(depId, true);
						});
					}
				}
				for (const id of this.watchFiles) {
					watched.add(id);
					this.watchFile(id);
				}
				for (const id of previouslyWatched) {
					if (!watched.has(id)) deleteTask(id, this, this.chokidarOptionsHash);
				}

				return Promise.all(this.outputs.map(output => result.write(output))).then(() => result);
			})
			.then((result: RollupBuild) => {
				this.watcher.emit('event', {
					code: 'BUNDLE_END',
					duration: Date.now() - start,
					input: this.inputOptions.input,
					output: this.outputFiles,
					result
				});
			})
			.catch((error: Error) => {
				if (this.closed) return;

				if (this.cache) {
					// this is necessary to ensure that any 'renamed' files
					// continue to be watched following an error
					if (this.cache.modules) {
						this.cache.modules.forEach(module => {
							if (module.transformDependencies) {
								module.transformDependencies.forEach(depId => {
									this.watchFile(depId, true);
								});
							}
						});
					}
					this.watchFiles.forEach(id => {
						this.watchFile(id);
					});
				}
				throw error;
			});
	}

	watchFile(id: string, isTransformDependency = false) {
		if (!this.filter(id)) return;

		if (this.outputFiles.some(file => file === id)) {
			throw new Error('Cannot import the generated bundle');
		}

		// this is necessary to ensure that any 'renamed' files
		// continue to be watched following an error
		addTask(id, this, this.chokidarOptions, this.chokidarOptionsHash, isTransformDependency);
	}
}

export default function watch(configs: GenericConfigObject[]): EventEmitter {
	return new Watcher(configs).emitter;
}
