import fs from 'fs';
import * as rollup from 'rollup';
import chalk from 'chalk';
import ms from 'pretty-ms';
import onExit from 'signal-exit';
import dateTime from 'date-time';
import mergeOptions from '../../../src/utils/mergeOptions';
import batchWarnings from './batchWarnings';
import alternateScreen from './alternateScreen';
import loadConfigFile from './loadConfigFile';
import relativeId from '../../../src/utils/relativeId';
import { handleError, stderr } from '../logging';
import { RollupError } from '../../../src/utils/error';
import { RollupWatchOptions } from '../../../src/watch/index';
import { printTimings } from './timings';
import { Bundle, BundleSet } from '../../../src/rollup';

interface WatchEvent {
	code?: string;
	error?: RollupError | Error;
	input?: string | string[];
	output?: string[];
	duration?: number;
	result?: Bundle | BundleSet;
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

	let processConfigsErr;

	function processConfigs(configs: RollupWatchOptions[]): RollupWatchOptions[] {
		return configs.map(options => {
			const merged = mergeOptions({
				config: options,
				command,
				defaultOnWarnHandler: warnings.add
			});

			const result: RollupWatchOptions = Object.assign({}, merged.inputOptions, {
				output: merged.outputOptions
			});

			if (!result.watch) result.watch = {};

			if (merged.deprecations.length) {
				(<{ _deprecations: any }>result.watch)._deprecations = merged.deprecations;
			}

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
		screen.reset(chalk.underline(`rollup v${rollup.VERSION}`));

		let screenWriter = processConfigsErr || screen.reset;

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
					screenWriter(chalk.underline(`rollup v${rollup.VERSION}`));
					break;

				case 'BUNDLE_START':
					if (!silent)
						stderr(
							chalk.cyan(
								`bundles ${chalk.bold(
									typeof event.input === 'string' ? event.input : event.input.join(', ')
								)} → ${chalk.bold(event.output.map(relativeId).join(', '))}...`
							)
						);
					break;

				case 'BUNDLE_END':
					warnings.flush();
					if (!silent)
						stderr(
							chalk.green(
								`created ${chalk.bold(event.output.map(relativeId).join(', '))} in ${chalk.bold(
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
		process.stdin.resume();
	}

	function close(err: Error) {
		if (err) {
			console.error(err);
		}

		removeOnExit();
		process.removeListener('uncaughtException', close);
		// removing a non-existent listener is a no-op
		process.stdin.removeListener('end', close);

		screen.close();
		if (watcher) watcher.close();

		if (configWatcher) configWatcher.close();

		if (err) {
			process.exit(1);
		}
	}

	start(initialConfigs);

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
				.then((configs: RollupWatchOptions[]) => {
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
