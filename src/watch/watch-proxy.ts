import { EventEmitter } from 'events';
import { RollupWatcher } from '../rollup/types';
import { GenericConfigObject } from '../utils/mergeOptions';
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
	loadFsEvents()
		.then(() => import('./watch'))
		.then(({ Watcher }) => new Watcher(configs, emitter));
	return emitter;
}
