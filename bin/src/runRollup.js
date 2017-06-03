import { realpathSync } from 'fs';
import * as rollup from 'rollup';
import relative from 'require-relative';
import chalk from 'chalk';
import { handleWarning, handleError, stderr } from './logging.js';
import SOURCEMAPPING_URL from './sourceMappingUrl.js';

import { install as installSourcemapSupport } from 'source-map-support';
installSourcemapSupport();

export default function runRollup ( command ) {
	if ( command._.length > 1 ) {
		handleError({
			code: 'ONE_AT_A_TIME',
			message: 'rollup can only bundle one file at a time'
		});
	}

	if ( command._.length === 1 ) {
		if ( command.input ) {
			handleError({
				code: 'DUPLICATE_IMPORT_OPTIONS',
				message: 'use --input, or pass input path as argument'
			});
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
		if ( config.slice( 0, 5 ) === 'node:' ) {
			const pkgName = config.slice( 5 );
			try {
				config = relative.resolve( `rollup-config-${pkgName}`, process.cwd() );
			} catch ( err ) {
				try {
					config = relative.resolve( pkgName, process.cwd() );
				} catch ( err ) {
					if ( err.code === 'MODULE_NOT_FOUND' ) {
						handleError({
							code: 'MISSING_EXTERNAL_CONFIG',
							message: `Could not resolve config file ${config}`
						});
					}

					throw err;
				}
			}
		} else {
			// find real path of config so it matches what Node provides to callbacks in require.extensions
			config = realpathSync( config );
		}

		rollup.rollup({
			entry: config,
			onwarn: warning => {
				if ( warning.code === 'UNRESOLVED_IMPORT' ) return;
				handleWarning( warning );
			}
		})
			.then( bundle => {
				const { code } = bundle.generate({
					format: 'cjs'
				});

				// temporarily override require
				const defaultLoader = require.extensions[ '.js' ];
				require.extensions[ '.js' ] = ( m, filename ) => {
					if ( filename === config ) {
						m._compile( code, filename );
					} else {
						defaultLoader( m, filename );
					}
				};

				const configs = require( config );
				const normalized = Array.isArray( configs ) ? configs : [configs];

				normalized.forEach(options => {
					if ( Object.keys( options ).length === 0 ) {
						handleError({
							code: 'MISSING_CONFIG',
							message: 'Config file must export an options object',
							url: 'https://github.com/rollup/rollup/wiki/Command-Line-Interface#using-a-config-file'
						});
					}

					execute( options, command );
				});

				require.extensions[ '.js' ] = defaultLoader;
			})
			.catch( handleError );
	} else {
		execute( {}, command );
	}
}

const equivalents = {
	useStrict: 'useStrict',
	banner: 'banner',
	footer: 'footer',
	format: 'format',
	globals: 'globals',
	id: 'moduleId',
	indent: 'indent',
	input: 'entry',
	intro: 'intro',
	legacy: 'legacy',
	name: 'moduleName',
	output: 'dest',
	outro: 'outro',
	sourcemap: 'sourceMap',
	treeshake: 'treeshake'
};

function execute ( options, command ) {
	let external;

	const commandExternal = ( command.external || '' ).split( ',' );
	const optionsExternal = options.external;

	if ( command.globals ) {
		const globals = Object.create( null );

		command.globals.split( ',' ).forEach( str => {
			const names = str.split( ':' );
			globals[ names[0] ] = names[1];

			// Add missing Module IDs to external.
			if ( commandExternal.indexOf( names[0] ) === -1 ) {
				commandExternal.push( names[0] );
			}
		});

		command.globals = globals;
	}

	if ( typeof optionsExternal === 'function' ) {
		external = id => {
			return optionsExternal( id ) || ~commandExternal.indexOf( id );
		};
	} else {
		external = ( optionsExternal || [] ).concat( commandExternal );
	}

	if ( command.silent ) {
		options.onwarn = () => {};
	}

	if ( !options.onwarn ) {
		const seen = new Set();

		options.onwarn = warning => {
			const str = warning.toString();

			if ( seen.has( str ) ) return;
			seen.add( str );

			handleWarning( warning );
		};
	}

	options.external = external;

	// Use any options passed through the CLI as overrides.
	Object.keys( equivalents ).forEach( cliOption => {
		if ( command.hasOwnProperty( cliOption ) ) {
			options[ equivalents[ cliOption ] ] = command[ cliOption ];
		}
	});

	if ( command.watch ) {
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
	} else {
		bundle( options ).catch( handleError );
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
		handleError({
			code: 'MISSING_INPUT_OPTION',
			message: 'You must specify an --input (-i) option'
		});
	}

	return rollup.rollup( options )
		.then( bundle => {
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
				handleError({
					code: 'MISSING_OUTPUT_OPTION',
					message: 'You must specify an --output (-o) option when creating a file with a sourcemap'
				});
			}

			let { code, map } = bundle.generate( options );

			if ( options.sourceMap === 'inline' ) {
				code += `\n//# ${SOURCEMAPPING_URL}=${map.toUrl()}\n`;
			}

			process.stdout.write( code );
		})
		.catch( handleError );
}
