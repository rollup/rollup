import type { RollupWatcher } from '../rollup/types';
import { ensureArray } from '../utils/ensureArray';
import { errInvalidOption, error } from '../utils/error';
import type { GenericConfigObject } from '../utils/options/options';
import { WatchEmitter } from './WatchEmitter';
import { loadFsEvents } from './fsevents-importer';

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
