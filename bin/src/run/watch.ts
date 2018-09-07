import dateTime from 'date-time';
import fs from 'fs';
import ms from 'pretty-ms';
import * as rollup from 'rollup';
import onExit from 'signal-exit';
import tc from 'turbocolor';
import {
	InputOption,
	RollupBuild,
	RollupError,
	RollupWatchOptions
} from '../../../src/rollup/types';
import mergeOptions from '../../../src/utils/mergeOptions';
import relativeId from '../../../src/utils/relativeId';
import { handleError, stderr } from '../logging';
import alternateScreen from './alternateScreen';
import batchWarnings from './batchWarnings';
import loadConfigFile from './loadConfigFile';
import { printTimings } from './timings';

interface WatchEvent {
	code?: string;
	error?: RollupError | Error;
	input?: InputOption;
	output?: string[];
	duration?: number;
	result?: RollupBuild;
}

interface Watcher {
	on: (event: string, fn: (event: WatchEvent) => void) => void;
	close: () => void;
}

export default function watch(
	configFile: string,
	configs: RollupWatchOptions[],
	command: any,
	silent = false
) {
	const isTTY = Boolean(process.stderr.isTTY);

	const warnings = batchWarnings();

	const initialConfigs = processConfigs(configs);

	const clearScreen = initialConfigs.every(config => config.watch.clearScreen !== false);

	const screen = alternateScreen(isTTY && clearScreen);
	screen.open();

	let watcher: Watcher;
	let configWatcher: Watcher;

	let processConfigsErr: any;

	function processConfigs(configs: RollupWatchOptions[]): RollupWatchOptions[] {
		return configs.map(options => {
			const merged = mergeOptions({
				config: options,
				command,
				defaultOnWarnHandler: warnings.add
			});

			const result: RollupWatchOptions = {
				...merged.inputOptions,
				output: merged.outputOptions
			};

			if (!result.watch) result.watch = {};

			if (merged.optionError)
				merged.inputOptions.onwarn({
					message: merged.optionError,
					code: 'UNKNOWN_OPTION'
				});

			if (
				(<RollupWatchOptions>merged.inputOptions).watch &&
				(<RollupWatchOptions>merged.inputOptions).watch.clearScreen === false
			) {
				processConfigsErr = stderr;
			}

			return result;
		});
	}

	function start(configs: RollupWatchOptions[]) {
		const screenWriter = processConfigsErr || screen.reset;

		watcher = rollup.watch(configs);

		watcher.on('event', (event: WatchEvent) => {
			switch (event.code) {
				case 'FATAL':
					screen.close();
					handleError(event.error, true);
					process.exit(1);
					break;

				case 'ERROR':
					warnings.flush();
					handleError(event.error, true);
					break;

				case 'START':
					if (!silent) {
						screenWriter(tc.underline(`rollup v${rollup.VERSION}`));
					}
					break;

				case 'BUNDLE_START':
					if (!silent) {
						let input = event.input;
						if (typeof input !== 'string') {
							input = Array.isArray(input)
								? input.join(', ')
								: Object.keys(input)
										.map(key => (<Record<string, string>>input)[key])
										.join(', ');
						}
						stderr(
							tc.cyan(
								`bundles ${tc.bold(input)} → ${tc.bold(event.output.map(relativeId).join(', '))}...`
							)
						);
					}
					break;

				case 'BUNDLE_END':
					warnings.flush();
					if (!silent)
						stderr(
							tc.green(
								`created ${tc.bold(event.output.map(relativeId).join(', '))} in ${tc.bold(
									ms(event.duration)
								)}`
							)
						);
					if (event.result && event.result.getTimings) {
						printTimings(event.result.getTimings());
					}
					break;

				case 'END':
					if (!silent && isTTY) {
						stderr(`\n[${dateTime()}] waiting for changes...`);
					}
			}
		});
	}

	// catch ctrl+c, kill, and uncaught errors
	const removeOnExit = onExit(close);
	process.on('uncaughtException', close);

	// only listen to stdin if it is a pipe
	if (!process.stdin.isTTY) {
		process.stdin.on('end', close); // in case we ever support stdin!
	}

	function close(err: Error) {
		removeOnExit();
		process.removeListener('uncaughtException', close);
		// removing a non-existent listener is a no-op
		process.stdin.removeListener('end', close);

		screen.close();
		if (watcher) watcher.close();

		if (configWatcher) configWatcher.close();

		if (err) {
			console.error(err);
			process.exit(1);
		}
	}

	try {
		start(initialConfigs);
	} catch (err) {
		close(err);
		return;
	}

	if (configFile && !configFile.startsWith('node:')) {
		let restarting = false;
		let aborted = false;
		let configFileData = fs.readFileSync(configFile, 'utf-8');

		const restart = () => {
			const newConfigFileData = fs.readFileSync(configFile, 'utf-8');
			if (newConfigFileData === configFileData) return;
			configFileData = newConfigFileData;

			if (restarting) {
				aborted = true;
				return;
			}

			restarting = true;

			loadConfigFile(configFile, command)
				.then((_configs: RollupWatchOptions[]) => {
					restarting = false;

					if (aborted) {
						aborted = false;
						restart();
					} else {
						watcher.close();
						start(initialConfigs);
					}
				})
				.catch((err: Error) => {
					handleError(err, true);
				});
		};

		configWatcher = fs.watch(configFile, (event: string) => {
			if (event === 'change') restart();
		});
	}
}
