import color from 'colorette';
import dateTime from 'date-time';
import fs from 'fs';
import ms from 'pretty-ms';
import onExit from 'signal-exit';
import * as rollup from '../../src/node-entry';
import { MergedRollupOptions, RollupWatcher } from '../../src/rollup/types';
import relativeId from '../../src/utils/relativeId';
import { handleError, stderr } from '../logging';
import { BatchWarnings } from './batchWarnings';
import loadAndParseConfigFile from './loadConfigFile';
import { getResetScreen } from './resetScreen';
import { printTimings } from './timings';

export default function watch(
	configFile: string | null,
	configs: MergedRollupOptions[],
	command: any,
	warnings: BatchWarnings,
	silent = false
) {
	const isTTY = Boolean(process.stderr.isTTY);
	let clearScreen = true;
	for (const config of configs) {
		if (config.watch && config.watch.clearScreen === false) {
			clearScreen = false;
		}
	}
	const resetScreen = getResetScreen(isTTY && clearScreen);
	let watcher: RollupWatcher;
	let configWatcher: RollupWatcher;

	function start(configs: MergedRollupOptions[]) {
		watcher = rollup.watch(configs as any);

		watcher.on('event', event => {
			switch (event.code) {
				case 'ERROR':
					warnings.flush();
					handleError(event.error, true);
					break;

				case 'START':
					if (!silent) {
						resetScreen(color.underline(`rollup v${rollup.VERSION}`));
					}
					break;

				case 'BUNDLE_START':
					if (!silent) {
						let input = event.input;
						if (typeof input !== 'string') {
							input = Array.isArray(input)
								? input.join(', ')
								: Object.keys(input as Record<string, string>)
										.map(key => (input as Record<string, string>)[key])
										.join(', ');
						}
						stderr(
							color.cyan(
								`bundles ${color.bold(input)} → ${color.bold(event.output.map(relativeId).join(', '))}...`
							)
						);
					}
					break;

				case 'BUNDLE_END':
					warnings.flush();
					if (!silent)
						stderr(
							color.green(
								`created ${color.bold(event.output.map(relativeId).join(', '))} in ${color.bold(
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

		if (watcher) watcher.close();

		if (configWatcher) configWatcher.close();

		if (err) {
			console.error(err);
			process.exit(1);
		}
	}

	try {
		start(configs);
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

			loadAndParseConfigFile(configFile, command)
				.then(({ options, warnings: newWarnings } ) => {
					restarting = false;
					configs = options;
					warnings = newWarnings;

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
		}) as RollupWatcher;
	}
}
