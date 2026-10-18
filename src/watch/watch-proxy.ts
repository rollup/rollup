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

export default function watch(configs: RollupOptions[] | RollupOptions): RollupWatcher {
	const emitter = new WatchEmitter() as RollupWatcher;
	let isClosed = false;
	// Until the watcher takes over closing, a close prevents its construction
	// and emits close itself, as no watcher will.
	emitter.close = async () => {
		if (isClosed) return;
		isClosed = true;
		try {
			await emitter.emit('close');
		} finally {
			emitter.removeAllListeners();
		}
	};

	watchInternal(configs, emitter, () => isClosed).catch(error => {
		handleError(error);
	});

	return emitter;
}

function ensureTrailingSlash(path: string): string {
	if (path[path.length - 1] !== '/') {
		return `${path}/`;
	}
	return path;
}

function checkWatchConfig(config: MergedRollupOptions[]): void {
	for (const item of config) {
		if (typeof item.watch !== 'boolean' && item.watch?.allowInputInsideOutputPath) {
			break;
		}
		if (item.input && item.output) {
			const input = typeof item.input === 'string' ? ensureArray(item.input) : item.input;
			const outputs = ensureArray(item.output);
			for (const index in input) {
				const inputPath = input[index as keyof typeof input];
				if (typeof inputPath !== 'string') {
					continue;
				}
				const outputWithInputAsSubPath = outputs.find(
					({ dir }) => dir && ensureTrailingSlash(inputPath).startsWith(ensureTrailingSlash(dir))
				);
				if (outputWithInputAsSubPath) {
					error(
						logInvalidOption(
							'watch',
							URL_WATCH,
							`the input "${inputPath}" is a subpath of the output "${outputWithInputAsSubPath.dir}"`
						)
					);
				}
			}
		}
	}
}

async function watchInternal(
	configs: MaybeArray<RollupOptions>,
	emitter: RollupWatcher,
	wasClosed: () => boolean
) {
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
	const { Watcher } = await import('./watch');
	if (wasClosed()) {
		return;
	}
	new Watcher(watchOptionsList, emitter);
}
