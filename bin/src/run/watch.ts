/// <reference path="./watch.d.ts" />
import fs from 'fs';
import * as rollup from 'rollup';
import chalk from 'chalk';
import ms from 'pretty-ms';
import onExit from 'signal-exit';
import dateTime from 'date-time';
import mergeOptions from '../../../src/utils/mergeOptions.js';
import batchWarnings from './batchWarnings.js';
import alternateScreen from './alternateScreen.js';
import loadConfigFile from './loadConfigFile.js';
import relativeId from '../../../src/utils/relativeId.js';
import { handleError, stderr } from '../logging.js';
import { RollupError } from '../../../src/utils/error';
import { RollupWatchOptions } from '../../../src/watch/index';

interface WatchEvent {
	code: string;
	error: RollupError | Error;
	input: string;
	output: string[];
	duration: number;
}

interface Watcher {
	on: (event: string, fn: (event: WatchEvent) => void) => void;
	close: () => void;
};

export default function watch (configFile: string, configs: RollupWatchOptions[], command: any, silent = false) {
	const isTTY = Boolean(process.stderr.isTTY);

	const screen = alternateScreen(isTTY);
	screen.open();

	const warnings = batchWarnings();

	let watcher: Watcher;
	let configWatcher: Watcher;

	function start (configs: RollupWatchOptions[]) {
		screen.reset(chalk.underline(`rollup v${rollup.VERSION}`));

		let screenWriter = screen.reset;
		configs = configs.map(options => {
			const merged = mergeOptions({ config: options, command, defaultOnWarnHandler: warnings.add });

			const result: RollupWatchOptions = Object.assign({}, merged.inputOptions, {
				output: merged.outputOptions
			});

			if (merged.deprecations.length) {
				if (!result.watch) result.watch = {};
				(<{ _deprecations: any }>result.watch)._deprecations = merged.deprecations;
			}

			if (
				(<RollupWatchOptions>merged.inputOptions).watch &&
				(<RollupWatchOptions>merged.inputOptions).watch.clearScreen === false
			) {
				screenWriter = stderr;
			}

			return result;
		});

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
								`bundles ${chalk.bold(event.input)} → ${chalk.bold(
									event.output.map(relativeId).join(', ')
								)}...`
							)
						);
					break;

				case 'BUNDLE_END':
					warnings.flush();
					if (!silent)
						stderr(
							chalk.green(
								`created ${chalk.bold(
									event.output.map(relativeId).join(', ')
								)} in ${chalk.bold(ms(event.duration))}`
							)
						);
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

	function close () {
		removeOnExit();
		process.removeListener('uncaughtException', close);
		// removing a non-existent listener is a no-op
		process.stdin.removeListener('end', close);

		screen.close();
		watcher.close();

		if (configWatcher) configWatcher.close();
	}

	start(configs);

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

			loadConfigFile(configFile, silent)
				.then((configs: RollupWatchOptions[]) => {
					restarting = false;

					if (aborted) {
						aborted = false;
						restart();
					} else {
						watcher.close();
						start(configs);
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
