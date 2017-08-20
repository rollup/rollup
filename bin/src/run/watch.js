import fs from 'fs';
import * as rollup from 'rollup';
import chalk from 'chalk';
import ms from 'pretty-ms';
import mergeOptions from './mergeOptions.js';
import batchWarnings from './batchWarnings.js';
import loadConfigFile from './loadConfigFile.js';
import relativeId from '../../../src/utils/relativeId.js';
import { handleError, stderr } from '../logging.js';

export default function watch(configFile, configs, command, silent) {
	process.stderr.write('\x1b[?1049h'); // alternate screen buffer

	const warnings = batchWarnings();

	configs = configs.map(options => {
		const merged = mergeOptions(options, command);
		const onwarn = merged.inputOptions.onwarn;
		if ( onwarn ) {
			merged.inputOptions.onwarn = warning => {
				onwarn( warning, warnings.add );
			};
		} else {
			merged.inputOptions.onwarn = warnings.add;
		}

		return Object.assign({}, merged.inputOptions, {
			output: merged.outputOptions
		});
	});

	let watcher;
	let configWatcher;
	let closed = false;

	function start(configs) {
		stderr(`\x1B[2J\x1B[0f${chalk.underline( `rollup v${rollup.VERSION}` )}`); // clear, move to top-left

		watcher = rollup.watch(configs);

		watcher.on('event', event => {
			switch (event.code) {
				case 'FATAL':
					process.stderr.write('\x1b[?1049l'); // reset screen buffer
					handleError(event.error, true);
					process.exit(1);
					break;

				case 'ERROR':
					warnings.flush();
					handleError(event.error, true);
					break;

				case 'START':
					stderr(`\x1B[2J\x1B[0f${chalk.underline( `rollup v${rollup.VERSION}` )}`); // clear, move to top-left
					break;

				case 'BUNDLE_START':
					if ( !silent ) stderr( chalk.cyan( `\n${chalk.bold( event.input )} → ${chalk.bold( event.output.map( relativeId ).join( ', ' ) )}...` ) );
					break;

				case 'BUNDLE_END':
					warnings.flush();
					if ( !silent ) stderr( chalk.green( `created ${chalk.bold( event.output.map( relativeId ).join( ', ' ) )} in ${chalk.bold(ms(event.duration))}` ) );
					break;

				case 'END':
					if ( !silent ) stderr( `\nwaiting for changes...` );
			}
		});
	}

	const close = () => {
		if (!closed) {
			process.stderr.write('\x1b[?1049l'); // reset screen buffer
			closed = true;
			watcher.close();

			if (configWatcher) configWatcher.close();
		}
	};
	process.on('SIGINT', close); // ctrl-c
	process.on('SIGTERM', close); // killall node
	process.on('uncaughtException', close); // on error
	process.stdin.on('end', close); // in case we ever support stdin!

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
				.then(configs => {
					restarting = false;

					if (aborted) {
						aborted = false;
						restart();
					} else {
						watcher.close();
						start(configs);
					}
				})
				.catch(err => {
					handleError(err, true);
				});
		};

		configWatcher = fs.watch(configFile, event => {
			if (event === 'change') restart();
		});
	}
}