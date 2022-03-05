import { EventEmitter } from 'events';
import type { RollupWatcher } from '../rollup/types';
import { ensureArray } from '../utils/ensureArray';
import { errInvalidOption, error } from '../utils/error';
import type { GenericConfigObject } from '../utils/options/options';
import { loadFsEvents } from './fsevents-importer';

class WatchEmitter<T extends { [event: string]: (...args: any) => any }> extends EventEmitter {
	private awaitedHandlers: {
		[K in keyof T]?: ((...args: Parameters<T[K]>) => Promise<ReturnType<T[K]>>)[];
	} = {};

	constructor() {
		super();
		// Allows more than 10 bundles to be watched without
		// showing the `MaxListenersExceededWarning` to the user.
		this.setMaxListeners(Infinity);
	}

	// Will be overwritten by Rollup
	async close(): Promise<void> {}

	emitAndAwait<K extends keyof T>(
		event: K,
		...args: Parameters<T[K]>
	): Promise<ReturnType<T[K]>[]> {
		this.emit(event as string, ...(args as any[]));
		const handlers = this.awaitedHandlers[event];
		if (!handlers) return Promise.resolve([]);
		return Promise.all(handlers.map(handler => handler(...args)));
	}

	onCurrentAwaited<K extends keyof T>(
		event: K,
		listener: (...args: Parameters<T[K]>) => Promise<ReturnType<T[K]>>
	): this {
		let handlers = this.awaitedHandlers[event];
		if (!handlers) {
			handlers = this.awaitedHandlers[event] = [];
		}
		handlers.push(listener);
		return this;
	}

	removeAwaited(): this {
		this.awaitedHandlers = {};
		return this;
	}
}

export default function watch(configs: GenericConfigObject[] | GenericConfigObject): RollupWatcher {
	const emitter = new WatchEmitter() as RollupWatcher;
	const configArray = ensureArray(configs);
	const watchConfigs = configArray.filter(config => config.watch !== false);
	if (watchConfigs.length === 0) {
		return error(
			errInvalidOption(
				'watch',
				'watch',
				'there must be at least one config where "watch" is not set to "false"'
			)
		);
	}
	loadFsEvents()
		.then(() => import('./watch'))
		.then(({ Watcher }) => new Watcher(watchConfigs, emitter));
	return emitter;
}
