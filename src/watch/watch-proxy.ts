import type { RollupOptions, RollupWatcher } from '../rollup/types';
import { ensureArray } from '../utils/ensureArray';
import { error, errorInvalidOption } from '../utils/error';
import { mergeOptions } from '../utils/options/mergeOptions';
import { WatchEmitter } from './WatchEmitter';
import { loadFsEvents } from './fsevents-importer';

export default function watch(configs: RollupOptions[] | RollupOptions): RollupWatcher {
	const emitter = new WatchEmitter() as RollupWatcher;

	(async () => {
		const optionsList = await Promise.all(ensureArray(configs).map(config => mergeOptions(config)));
		const watchOptionsList = optionsList.filter(config => config.watch !== false);
		if (watchOptionsList.length === 0) {
			return error(
				errorInvalidOption(
					'watch',
					'watch',
					'there must be at least one config where "watch" is not set to "false"'
				)
			);
		}
		loadFsEvents()
			.then(() => import('./watch'))
			.then(({ Watcher }) => new Watcher(watchOptionsList, emitter));
	})();

	return emitter;
}
