import * as rollup from 'rollup';
import chalk from 'chalk';
import createWatcher from './createWatcher.js';
import mergeOptions from './mergeOptions.js';
import { handleError, stderr } from '../logging.js';

export default function watch ( configs, command ) {
	configs.forEach( config => {
		const { options, warnings } = mergeOptions( config, command );

		if ( !options.entry || ( !options.dest && !options.targets ) ) {
			handleError({
				code: 'WATCHER_MISSING_INPUT_OR_OUTPUT',
				message: 'must specify --input and --output when using rollup --watch'
			});
		}

		const watcher = createWatcher( rollup, options );

		watcher.on( 'event', event => {
			switch ( event.code ) {
				case 'STARTING': // TODO this isn't emitted by newer versions of rollup-watch
					stderr( 'checking rollup-watch version...' );
					break;

				case 'BUILD_START':
					stderr( `${chalk.blue.bold( options.entry )} -> ${chalk.blue.bold( options.dest )}...` );
					break;

				case 'BUILD_END':
					warnings.flush();
					stderr( `created ${chalk.blue.bold( options.dest )} in ${event.duration}ms. Watching for changes...` );
					break;

				case 'ERROR':
					handleError( event.error, true );
					break;

				default:
					stderr( 'unknown event', event );
			}
		});
	});
}