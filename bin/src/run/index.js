import { realpathSync } from 'fs';
import relative from 'require-relative';
import { handleError } from '../logging.js';
import mergeOptions from '../../../src/utils/mergeOptions';
import batchWarnings from '../../../src/utils/batchWarnings';
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
		const environment = Array.isArray(command.environment) ? command.environment : [ command.environment ];

		environment.forEach( arg => {
			arg.split( ',' ).forEach( pair => {
				const [ key, value ] = pair.split( ':' );
				if ( value ) {
					process.env[ key ] = value;
				} else {
					process.env[ key ] = true;
				}
			});
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

		if (command.watch) process.env.ROLLUP_WATCH = 'true';

		loadConfigFile(configFile, command.silent)
			.then(normalized => execute( configFile, normalized, command ))
			.catch(handleError);
	} else {
		return execute( configFile, [{}], command );
	}
}

function execute ( configFile, configs, command ) {
	if ( command.watch ) {
		watch( configFile, configs, command, command.silent );
	} else {
		return sequence( configs, config => {
			const { inputOptions, outputOptions, deprecations } = mergeOptions( config, command );

			const warnings = batchWarnings();

			const onwarn = inputOptions.onwarn;
			if ( onwarn ) {
				inputOptions.onwarn = warning => {
					onwarn( warning, warnings.add );
				};
			} else {
				inputOptions.onwarn = warnings.add;
			}

			if (deprecations.length) {
				inputOptions.onwarn({
					code: 'DEPRECATED_OPTIONS',
					message: `The following options have been renamed — please update your config: ${deprecations.map(option => `${option.old} -> ${option.new}`).join(', ')}`,
					deprecations
				});
			}

			return build( inputOptions, outputOptions, warnings, command.silent );
		});
	}
}
