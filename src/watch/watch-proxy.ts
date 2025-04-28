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

function withTrailingSlash(path: string): string {
	if (path[path.length - 1] !== '/') {
		return `${path}/`;
	}
	return path;
}

function checkWatchConfig(config: MergedRollupOptions[]): void {
	for (const item of config) {
		if (item.input && item.output) {
			const input = typeof item.input === 'string' ? ensureArray(item.input) : item.input;
			const output = ensureArray(item.output);
			for (const index in input) {
				const inputPath = input[index as keyof typeof input] as string;
				const subPath = output.find(o => {
					if (!o.dir || typeof inputPath !== 'string') {
						return false;
					}
					const _outPath = withTrailingSlash(o.dir);
					const _inputPath = withTrailingSlash(inputPath);
					return _inputPath.startsWith(_outPath);
				});
				if (subPath) {
					error(
						logInvalidOption(
							'watch',
							URL_WATCH,
							`the input "${inputPath}" is a subpath of the output "${subPath.dir}"`
						)
					);
				}
			}
		}
	}
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
	checkWatchConfig(watchOptionsList);
	await loadFsEvents();
	const { Watcher } = await import('./watch');
	new Watcher(watchOptionsList, emitter);
}
