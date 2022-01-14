import { type FSWatcher, readFileSync } from 'fs';
import chokidar from 'chokidar';
import dateTime from 'date-time';
import ms from 'pretty-ms';
import onExit from 'signal-exit';
import * as rollup from '../../src/node-entry';
import { MergedRollupOptions, RollupWatcher } from '../../src/rollup/types';
import { bold, cyan, green, underline } from '../../src/utils/colors';
import relativeId from '../../src/utils/relativeId';
import { handleError, stderr } from '../logging';
import { BatchWarnings } from './batchWarnings';
import { getConfigPath } from './getConfigPath';
import loadAndParseConfigFile from './loadConfigFile';
import loadConfigFromCommand from './loadConfigFromCommand';
import { getResetScreen } from './resetScreen';
import { printTimings } from './timings';

export async function watch(command: Record<string, any>): Promise<void> {
	process.env.ROLLUP_WATCH = 'true';
	const isTTY = process.stderr.isTTY;
	const silent = command.silent;
	let watcher: RollupWatcher;
	let configWatcher: FSWatcher;
	let resetScreen: (heading: string) => void;
	const configFile = command.config ? getConfigPath(command.config) : null;

	onExit(close);
	process.on('uncaughtException', close);
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
				const newConfigFileData = readFileSync(configFile, 'utf-8');
				if (newConfigFileData === configFileData) {
					return;
				}
				configFileRevision++;
				const currentConfigFileRevision = configFileRevision;
				if (configFileData) {
					stderr(`\nReloading updated config...`);
				}
				configFileData = newConfigFileData;
				const { options, warnings } = await loadAndParseConfigFile(configFile, command);
				if (currentConfigFileRevision !== configFileRevision) {
					return;
				}
				if (watcher) {
					watcher.close();
				}
				start(options, warnings);
			} catch (err: any) {
				handleError(err, true);
			}
		}
	}

	if (configFile) {
		await loadConfigFromFileAndTrack(configFile);
	} else {
		const { options, warnings } = await loadConfigFromCommand(command);
		start(options, warnings);
	}

	function start(configs: MergedRollupOptions[], warnings: BatchWarnings): void {
		try {
			watcher = rollup.watch(configs as any);
		} catch (err: any) {
			return handleError(err);
		}

		watcher.on('event', event => {
			switch (event.code) {
				case 'ERROR':
					warnings.flush();
					handleError(event.error, true);
					break;

				case 'START':
					if (!silent) {
						if (!resetScreen) {
							resetScreen = getResetScreen(configs, isTTY);
						}
						resetScreen(underline(`rollup v${rollup.VERSION}`));
					}
					break;

				case 'BUNDLE_START':
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
					break;

				case 'BUNDLE_END':
					warnings.flush();
					if (!silent)
						stderr(
							green(
								`created ${bold(event.output.map(relativeId).join(', '))} in ${bold(
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

			if ('result' in event && event.result) {
				event.result.close().catch(error => handleError(error, true));
			}
		});
	}

	function close(code: number | null): void {
		process.removeListener('uncaughtException', close);
		// removing a non-existent listener is a no-op
		process.stdin.removeListener('end', close);

		if (watcher) watcher.close();
		if (configWatcher) configWatcher.close();

		if (code) {
			process.exit(code);
		}
	}
}
