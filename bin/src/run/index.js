import path from 'path';
import chalk from 'chalk';
import { realpathSync } from 'fs';
import * as rollup from 'rollup';
import relative from 'require-relative';
import { handleError, stderr } from '../logging.js';
import mergeOptions from './mergeOptions.js';
import batchWarnings from './batchWarnings.js';
import relativeId from '../../../src/utils/relativeId.js';
import sequence from '../utils/sequence.js';
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

		const warnings = batchWarnings();

		rollup.rollup({
			entry: config,
			external: id => {
				return (id[0] !== '.' && !path.isAbsolute(id)) || id.slice(-5,id.length) === '.json';
			},
			onwarn: warnings.add
		})
			.then( bundle => {
				if ( !command.silent && warnings.count > 0 ) {
					stderr( chalk.bold( `loaded ${relativeId( config )} with warnings` ) );
					warnings.flush();
				}

				return bundle.generate({
					format: 'cjs'
				});
			})
			.then( ({ code }) => {
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
				if ( Object.keys( configs ).length === 0 ) {
					handleError({
						code: 'MISSING_CONFIG',
						message: 'Config file must export an options object, or an array of options objects',
						url: 'https://github.com/rollup/rollup/wiki/Command-Line-Interface#using-a-config-file'
					});
				}

				require.extensions[ '.js' ] = defaultLoader;

				const normalized = Array.isArray( configs ) ? configs : [configs];
				return execute( normalized, command );
			})
			.catch( handleError );
	} else {
		return execute( [{}], command );
	}
}

function execute ( configs, command ) {
	if ( command.watch ) {
		process.env.ROLLUP_WATCH = 'true';
		watch( configs, command, command.silent );
	} else {
		return sequence( configs, config => {
			const options = mergeOptions( config, command );

			const warnings = batchWarnings();

			const onwarn = options.onwarn;
			if ( onwarn ) {
				options.onwarn = warning => {
					onwarn( warning, warnings.add );
				};
			} else {
				options.onwarn = warnings.add;
			}

			return build( options, warnings, command.silent );
		});
	}
}