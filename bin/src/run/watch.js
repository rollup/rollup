import * as rollup from 'rollup';
import chalk from 'chalk';
import ms from 'pretty-ms';
import mergeOptions from './mergeOptions.js';
import batchWarnings from './batchWarnings.js';
import relativeId from '../../../src/utils/relativeId.js';
import { handleError, stderr } from '../logging.js';

export default function watch(configs, command, silent) {
	process.stderr.write('\x1b[?1049h'); // alternate screen buffer

	const warnings = batchWarnings();

	configs = configs.map(options => {
		const merged = mergeOptions(options, command);

		const onwarn = merged.onwarn;
		if ( onwarn ) {
			merged.onwarn = warning => {
				onwarn( warning, warnings.add );
			};
		} else {
			merged.onwarn = warnings.add;
		}

		return merged;
	});

	const watcher = rollup.watch(configs);

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
				stderr(`\x1B[2J\x1B[0f${chalk.underline( 'rollup.watch' )}`); // clear, move to top-left
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

	let closed = false;
	const close = () => {
		if (!closed) {
			process.stderr.write('\x1b[?1049l'); // reset screen buffer
			closed = true;
			watcher.close();
		}
	};
	process.on('SIGINT', close); // ctrl-c
	process.on('SIGTERM', close); // killall node
	process.on('uncaughtException', close); // on error
	process.stdin.on('end', close); // in case we ever support stdin!
}