import type { FSWatcher } from 'chokidar';
import chokidar from 'chokidar';
import dateTime from 'date-time';
import { readFile } from 'node:fs/promises';
import process from 'node:process';
import ms from 'pretty-ms';
import { onExit } from 'signal-exit';
import * as rollup from '../../src/node-entry';
import type { MergedRollupOptions, RollupWatcher } from '../../src/rollup/types';
import { bold, cyan, green, underline } from '../../src/utils/colors';
import relativeId from '../../src/utils/relativeId';
import { handleError, stderr } from '../logging';
import { getConfigPath } from './getConfigPath';
import { loadConfigFile } from './loadConfigFile';
import type { BatchWarnings } from './loadConfigFileType';
import loadConfigFromCommand from './loadConfigFromCommand';
import { getResetScreen } from './resetScreen';
import { printTimings } from './timings';
import { createWatchHooks } from './watchHooks';

export async function watch(command: Record<string, any>): Promise<void> {
	process.env.ROLLUP_WATCH = 'true';
	const isTTY = process.stderr.isTTY;
	const silent = command.silent;
	let watcher: RollupWatcher;
	let configWatcher: FSWatcher;
	let resetScreen: (heading: string) => void;
	const configFile = command.config ? await getConfigPath(command.config) : null;
	const runWatchHook = createWatchHooks(command);

	onExit(close as any);
	process.on('uncaughtException', closeWithError);
	if (!process.stdin.isTTY) {
		process.stdin.on('end', close);
		process.stdin.resume();
	}

	async function loadConfigFromFileAndTrack(configFile: string): Promise<void> {
		let configFileData: string | null = null;
		let configFileRevision = 0;

		configWatcher = chokidar.watch(configFile).on('change', reloadConfigFile);
		await reloadConfigFile();

		async function reloadConfigFile() {
			try {
				const newConfigFileData = await readFile(configFile, 'utf8');
				if (newConfigFileData === configFileData) {
					return;
				}
				configFileRevision++;
				const currentConfigFileRevision = configFileRevision;
				if (configFileData) {
					stderr(`\nReloading updated config...`);
				}
				configFileData = newConfigFileData;
				const { options, warnings } = await loadConfigFile(configFile, command, true);
				if (currentConfigFileRevision !== configFileRevision) {
					return;
				}
				if (watcher) {
					await watcher.close();
				}
				start(options, warnings);
			} catch (error: any) {
				handleError(error, true);
			}
		}
	}

	if (configFile) {
		await loadConfigFromFileAndTrack(configFile);
	} else {
		const { options, warnings } = await loadConfigFromCommand(command, true);
		await start(options, warnings);
	}

	async function start(configs: MergedRollupOptions[], warnings: BatchWarnings): Promise<void> {
		watcher = rollup.watch(configs as any);

		watcher.on('event', event => {
			switch (event.code) {
				case 'ERROR': {
					warnings.flush();
					handleError(event.error, true);
					runWatchHook('onError');
					break;
				}

				case 'START': {
					if (!silent) {
						if (!resetScreen) {
							resetScreen = getResetScreen(configs, isTTY);
						}
						resetScreen(underline(`rollup v${rollup.VERSION}`));
					}
					runWatchHook('onStart');

					break;
				}

				case 'BUNDLE_START': {
					if (!silent) {
						let input = event.input;
						if (typeof input !== 'string') {
							input = Array.isArray(input)
								? input.join(', ')
								: Object.values(input as Record<string, string>).join(', ');
						}
						stderr(
							cyan(`bundles ${bold(input)} → ${bold(event.output.map(relativeId).join(', '))}...`)
						);
					}
					runWatchHook('onBundleStart');
					break;
				}

				case 'BUNDLE_END': {
					warnings.flush();
					if (!silent)
						stderr(
							green(
								`created ${bold(event.output.map(relativeId).join(', '))} in ${bold(
									ms(event.duration)
								)}`
							)
						);
					runWatchHook('onBundleEnd');
					if (event.result && event.result.getTimings) {
						printTimings(event.result.getTimings());
					}
					break;
				}

				case 'END': {
					runWatchHook('onEnd');
					if (!silent && isTTY) {
						stderr(`\n[${dateTime()}] waiting for changes...`);
					}
				}
			}

			if ('result' in event && event.result) {
				event.result.close().catch(error => handleError(error, true));
			}
		});
	}

	async function close(code: number | null | undefined): Promise<void> {
		process.removeListener('uncaughtException', closeWithError);
		// removing a non-existent listener is a no-op
		process.stdin.removeListener('end', close);

		if (watcher) await watcher.close();
		if (configWatcher) configWatcher.close();
		if (code) process.exit(code);
	}

	// return a promise that never resolves to keep the process running
	return new Promise(() => {});
}

function closeWithError(error: Error): void {
	error.name = `Uncaught ${error.name}`;
	handleError(error);
}
