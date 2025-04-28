import { handleError } from '../../cli/logging';
import type {
	MaybeArray,
	MergedRollupOptions,
	RollupOptions,
	RollupWatcher
} from '../rollup/types';
import { ensureArray } from '../utils/ensureArray';
import { error, logInvalidOption } from '../utils/logs';
import { mergeOptions } from '../utils/options/mergeOptions';
import { URL_WATCH } from '../utils/urls';
import { WatchEmitter } from './WatchEmitter';
import { loadFsEvents } from './fsevents-importer';

export default function watch(configs: RollupOptions[] | RollupOptions): RollupWatcher {
	const emitter = new WatchEmitter() as RollupWatcher;

	watchInternal(configs, emitter).catch(error => {
		handleError(error);
	});

	return emitter;
}

function checkWatchConfig(config: MergedRollupOptions[]): boolean {
	for (const item of config) {
		if (item.input && item.output) {
			const input = typeof item.input === 'string' ? ensureArray(item.input) : item.input;
			const output = ensureArray(item.output);
			for (const index in input) {
				const inputPath = input[index as keyof typeof input] as string;
				const subPath = output.some(o => o.dir && inputPath.startsWith?.(o.dir));
				if (subPath) {
					return false;
				}
			}
		}
	}
	return true;
}

async function watchInternal(configs: MaybeArray<RollupOptions>, emitter: RollupWatcher) {
	const optionsList = await Promise.all(
		ensureArray(configs).map(config => mergeOptions(config, true))
	);
	const watchOptionsList = optionsList.filter(config => config.watch !== false);
	if (watchOptionsList.length === 0) {
		return error(
			logInvalidOption(
				'watch',
				URL_WATCH,
				'there must be at least one config where "watch" is not set to "false"'
			)
		);
	}
	if (!checkWatchConfig(watchOptionsList)) {
		return error(
			logInvalidOption('watch', URL_WATCH, 'the input should not be inside the output dir')
		);
	}
	await loadFsEvents();
	const { Watcher } = await import('./watch');
	new Watcher(watchOptionsList, emitter);
}
