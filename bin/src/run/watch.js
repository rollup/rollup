import * as rollup from 'rollup';
import relative from 'require-relative';
import { handleError, stderr } from '../logging.js';

export default function watch ( options ) {
	if ( !options.entry || ( !options.dest && !options.targets ) ) {
		handleError({
			code: 'WATCHER_MISSING_INPUT_OR_OUTPUT',
			message: 'must specify --input and --output when using rollup --watch'
		});
	}

	try {
		const watch = relative( 'rollup-watch', process.cwd() );
		const watcher = watch( rollup, options );

		watcher.on( 'event', event => {
			switch ( event.code ) {
				case 'STARTING': // TODO this isn't emitted by newer versions of rollup-watch
					stderr( 'checking rollup-watch version...' );
					break;

				case 'BUILD_START':
					stderr( 'bundling...' );
					break;

				case 'BUILD_END':
					stderr( 'bundled in ' + event.duration + 'ms. Watching for changes...' );
					break;

				case 'ERROR':
					handleError( event.error, true );
					break;

				default:
					stderr( 'unknown event', event );
			}
		});
	} catch ( err ) {
		if ( err.code === 'MODULE_NOT_FOUND' ) {
			handleError({
				code: 'ROLLUP_WATCH_NOT_INSTALLED',
				message: 'rollup --watch depends on the rollup-watch package, which could not be found. Install it with npm install -D rollup-watch'
			});
		}

		handleError( err );
	}
}