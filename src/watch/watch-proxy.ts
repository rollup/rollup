import { EventEmitter } from 'events';
import type { RollupWatcher } from '../rollup/types';
import { ensureArray } from '../utils/ensureArray';
import { errInvalidOption, error } from '../utils/error';
import type { GenericConfigObject } from '../utils/options/options';
import { loadFsEvents } from './fsevents-importer';

class WatchEmitter extends EventEmitter {
	constructor() {
		super();
		// Allows more than 10 bundles to be watched without
		// showing the `MaxListenersExceededWarning` to the user.
		this.setMaxListeners(Infinity);
	}

	close() {}
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
