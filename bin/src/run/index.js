import { realpathSync } from 'fs';
import relative from 'require-relative';
import { handleError } from '../logging.js';
import mergeOptions from './mergeOptions.js';
import batchWarnings from './batchWarnings.js';
import loadConfigFile from './loadConfigFile.js';
import sequence from '../utils/sequence.js';
import build from './build.js';
import watch from './watch.js';

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

	let configFile = command.config === true ? 'rollup.config.js' : command.config;

	if ( configFile ) {
		if ( configFile.slice( 0, 5 ) === 'node:' ) {
			const pkgName = configFile.slice( 5 );
			try {
				configFile = relative.resolve( `rollup-config-${pkgName}`, process.cwd() );
			} catch ( err ) {
				try {
					configFile = relative.resolve( pkgName, process.cwd() );
				} catch ( err ) {
					if ( err.code === 'MODULE_NOT_FOUND' ) {
						handleError({
							code: 'MISSING_EXTERNAL_CONFIG',
							message: `Could not resolve config file ${configFile}`
						});
					}

					throw err;
				}
			}
		} else {
			// find real path of config so it matches what Node provides to callbacks in require.extensions
			configFile = realpathSync( configFile );
		}

		loadConfigFile(configFile, command.silent)
			.then(normalized => execute( configFile, normalized, command ))
			.catch(handleError);
	} else {
		return execute( configFile, [{}], command );
	}
}

function execute ( configFile, configs, command ) {
	if ( command.watch ) {
		process.env.ROLLUP_WATCH = 'true';
		watch( configFile, configs, command, command.silent );
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