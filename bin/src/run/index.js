import path from 'path';
import { realpathSync } from 'fs';
import * as rollup from 'rollup';
import relative from 'require-relative';
import { handleWarning, handleError } from '../logging.js';
import batchWarnings from './batchWarnings.js';
import build from './build.js';
import watch from './watch.js';

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

		const batch = batchWarnings();

		rollup.rollup({
			entry: config,
			external: id => {
				return (id[0] !== '.' && !path.isAbsolute(id)) || id.slice(-5,id.length) === '.json';
			},
			onwarn: batch.add
		})
			.then( bundle => {
				batch.flush();

				return bundle.generate({
					format: 'cjs'
				});
			})
			.then( ({ code }) => {
				if ( command.watch ) process.env.ROLLUP_WATCH = 'true';

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

	if (typeof command.extend !== 'undefined') {
		options.extend = command.extend;
	}

	if ( command.silent ) {
		options.onwarn = () => {};
	}

	options.external = external;

	// Use any options passed through the CLI as overrides.
	Object.keys( equivalents ).forEach( cliOption => {
		if ( command.hasOwnProperty( cliOption ) ) {
			options[ equivalents[ cliOption ] ] = command[ cliOption ];
		}
	});

	if ( command.watch ) {
		watch( options );
	} else {
		build( options ).catch( handleError );
	}
}
