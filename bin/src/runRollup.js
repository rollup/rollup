import { resolve } from 'path';
import relative from 'require-relative';
import handleError from './handleError';
import SOURCEMAPPING_URL from './sourceMappingUrl.js';

const rollup = require( '../dist/rollup.js' ); // TODO make this an import, somehow

import { install as installSourcemapSupport } from 'source-map-support';
installSourcemapSupport();

// stderr to stderr to keep `rollup main.js > bundle.js` from breaking
const stderr = console.error.bind( console ); // eslint-disable-line no-console

export default function runRollup ( command ) {
	if ( command._.length > 1 ) {
		handleError({ code: 'ONE_AT_A_TIME' });
	}

	if ( command._.length === 1 ) {
		if ( command.input ) {
			handleError({ code: 'DUPLICATE_IMPORT_OPTIONS' });
		}

		command.input = command._[0];
	}

	if ( command.environment ) {
		command.environment.split( ',' ).forEach( pair => {
			const index = pair.indexOf( ':' );
			if ( ~index ) {
				process.env[ pair.slice( 0, index ) ] = pair.slice( index + 1 );
			} else {
				process.env[ pair ] = true;
			}
		});
	}

	let config = command.config === true ? 'rollup.config.js' : command.config;

	if ( config ) {
		config = resolve( config );

		rollup.rollup({
			entry: config,
			onwarn: message => {
				if ( /Treating .+ as external dependency/.test( message ) ) return;
				stderr( message );
			}
		}).then( bundle => {
			const { code } = bundle.generate({
				format: 'cjs'
			});

			// temporarily override require
			var defaultLoader = require.extensions[ '.js' ];
			require.extensions[ '.js' ] = ( m, filename ) => {
				if ( filename === config ) {
					m._compile( code, filename );
				} else {
					defaultLoader( m, filename );
				}
			};

			try {
				const options = require( resolve( config ) );
				if ( Object.keys( options ).length === 0 ) {
					handleError({ code: 'MISSING_CONFIG' });
				}
				execute( options, command );
				require.extensions[ '.js' ] = defaultLoader;
			} catch ( err ) {
				handleError( err );
			}
		})
		.catch( stderr );
	} else {
		execute( {}, command );
	}
}

const equivalents = {
	banner: 'banner',
	footer: 'footer',
	format: 'format',
	globals: 'globals',
	id: 'moduleId',
	indent: 'indent',
	input: 'entry',
	intro: 'intro',
	name: 'moduleName',
	output: 'dest',
	outro: 'outro',
	sourcemap: 'sourceMap',
	treeshake: 'treeshake'
};

function execute ( options, command ) {
	let external = ( options.external || [] )
		.concat( command.external ? command.external.split( ',' ) : []  );

	if ( command.globals ) {
		let globals = Object.create( null );

		command.globals.split( ',' ).forEach( str => {
			const names = str.split( ':' );
			globals[ names[0] ] = names[1];

			// Add missing Module IDs to external.
			if ( external.indexOf( names[0] ) === -1 ) {
				external.push( names[0] );
			}
		});

		command.globals = globals;
	}

	options.onwarn = options.onwarn || stderr;

	options.external = external;

	options.noConflict = command.conflict === false;
	delete command.conflict;

	// Use any options passed through the CLI as overrides.
	Object.keys( equivalents ).forEach( cliOption => {
		if ( command.hasOwnProperty( cliOption ) ) {
			options[ equivalents[ cliOption ] ] = command[ cliOption ];
		}
	});

	try {
		if ( command.watch ) {
			if ( !options.entry || ( !options.dest && !options.targets ) ) {
				handleError({ code: 'WATCHER_MISSING_INPUT_OR_OUTPUT' });
			}

			try {
				const watch = relative( 'rollup-watch', process.cwd() );
				const watcher = watch( rollup, options );

				watcher.on( 'event', event => {
					switch ( event.code ) {
						case 'STARTING':
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
					err.code = 'ROLLUP_WATCH_NOT_INSTALLED';
				}

				handleError( err );
			}
		} else {
			bundle( options ).catch( handleError );
		}
	} catch ( err ) {
		handleError( err );
	}
}

function clone ( object ) {
	return assign( {}, object );
}

function assign ( target, source ) {
	Object.keys( source ).forEach( key => {
		target[ key ] = source[ key ];
	});
	return target;
}

function bundle ( options ) {
	if ( !options.entry ) {
		handleError({ code: 'MISSING_INPUT_OPTION' });
	}

	return rollup.rollup( options ).then( bundle => {
		if ( options.dest ) {
			return bundle.write( options );
		}

		if ( options.targets ) {
			let result = null;

			options.targets.forEach( target => {
				result = bundle.write( assign( clone( options ), target ) );
			});

			return result;
		}

		if ( options.sourceMap && options.sourceMap !== 'inline' ) {
			handleError({ code: 'MISSING_OUTPUT_OPTION' });
		}

		let { code, map } = bundle.generate( options );

		if ( options.sourceMap === 'inline' ) {
			code += `\n//# ${SOURCEMAPPING_URL}=${map.toUrl()}`;
		}

		process.stdout.write( code );
	});
}
