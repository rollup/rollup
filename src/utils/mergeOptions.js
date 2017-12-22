import ensureArray from './ensureArray.js';
import deprecateOptions from './deprecateOptions.js';

function normalizeObjectOptionValue ( optionValue ) {
	if ( !optionValue ) {
		return optionValue;
	}
	if ( typeof optionValue !== 'object' ) {
		return {};
	}
	return optionValue;
}

const defaultOnWarnHandler = warning => console.warn(warning.message); // eslint-disable-line no-console

export default function mergeOptions ({
	config, command = {},
	deprecateConfig,
	defaultOnWarn = defaultOnWarnHandler
}) {
	const deprecations = deprecate( config, command, deprecateConfig );

	const getOption = config => name => {
		return command[ name ] !== undefined ? command[ name ] : config[ name ];
	};

	const getInputOption = getOption(config);
	const getOutputOption = getOption(config.output || {});

	function getObjectOption ( name ) {
		const commandOption = normalizeObjectOptionValue( command[ name ] );
		const configOption = normalizeObjectOptionValue( config[ name ] );
		if ( commandOption !== undefined ) {
			return commandOption && configOption
				? Object.assign( {}, configOption, commandOption )
				: commandOption;
		}
		return configOption;
	}

	const onwarn = config.onwarn;
	let warn;

	if (onwarn) {
		warn = warning => {
			onwarn(warning, defaultOnWarn);
		};
	} else {
		warn = defaultOnWarn;
	}

	const inputOptions = {
		input: getInputOption( 'input' ),
		legacy: getInputOption( 'legacy' ),
		treeshake: getObjectOption( 'treeshake' ),
		acorn: config.acorn,
		context: config.context,
		moduleContext: config.moduleContext,
		plugins: config.plugins,
		onwarn: warn,
		watch: config.watch,
		cache: getInputOption( 'cache' ),
		preferConst: getInputOption( 'preferConst' ),
		experimentalDynamicImport: getInputOption( 'experimentalDynamicImport' ),
	};

	// legacy, to ensure e.g. commonjs plugin still works
	inputOptions.entry = inputOptions.input;

	const commandExternal = ( command.external || '' ).split( ',' );
	const configExternal = config.external;

	if ( command.globals ) {
		const globals = Object.create( null );

		command.globals.split( ',' ).forEach( str => {
			const names = str.split( ':' );
			globals[ names[ 0 ] ] = names[ 1 ];

			// Add missing Module IDs to external.
			if ( commandExternal.indexOf( names[ 0 ] ) === -1 ) {
				commandExternal.push( names[ 0 ] );
			}
		} );

		command.globals = globals;
	}

	if ( typeof configExternal === 'function' ) {
		inputOptions.external = (id, ...rest) => {
			return configExternal( id, ...rest ) || ~commandExternal.indexOf( id );
		};
	} else {
		inputOptions.external = ( configExternal || [] ).concat( commandExternal );
	}

	if ( command.silent ) {
		inputOptions.onwarn = () => {};
	}

	const baseOutputOptions = {
		extend: getOutputOption( 'extend' ),
		amd: Object.assign( {}, config.amd, command.amd ),
		banner: getOutputOption( 'banner' ),
		footer: getOutputOption( 'footer' ),
		intro: getOutputOption( 'intro' ),
		format: getOutputOption( 'format' ),
		outro: getOutputOption( 'outro' ),
		sourcemap: getOutputOption( 'sourcemap' ),
		sourcemapFile: getOutputOption( 'sourcemapFile' ),
		name: getOutputOption( 'name' ),
		globals: getOutputOption( 'globals' ),
		interop: getOutputOption( 'interop' ),
		legacy: getOutputOption( 'legacy' ),
		freeze: getOutputOption( 'freeze' ),
		indent: getOutputOption( 'indent' ),
		strict: getOutputOption( 'strict' ),
		noConflict: getOutputOption( 'noConflict' ),
		paths: getOutputOption( 'paths' ),
		exports: getOutputOption( 'exports' ),
		file: getOutputOption( 'file' ),
	};

	let mergedOutputOptions;
	if ( Array.isArray( config.output ) ) {
		mergedOutputOptions = config.output.map( ( output ) => Object.assign( {}, output, command.output ) );
	} else if ( config.output && command.output ) {
		mergedOutputOptions = [ Object.assign( {}, config.output, command.output ) ];
	} else {
		mergedOutputOptions = (command.output || config.output) ?
			ensureArray( command.output || config.output ) :
			[ {
				file: command.output ? command.output.file : null,
				format: command.output ? command.output.format : null
			} ];
	}

	const outputOptions = mergedOutputOptions.map( output => {
		return Object.assign( {}, baseOutputOptions, output );
	} );

	// check for errors
	const validKeys = [
		...Object.keys(inputOptions),
		...Object.keys(baseOutputOptions),
		'pureExternalModules' // (backward compatibility) till everyone moves to treeshake.pureExternalModules
	];
	const errors = [...Object.keys(config || {}), ...Object.keys(config.output || {})]
		.filter(k => k !== 'output' && validKeys.indexOf(k) === -1);

	return {
		inputOptions,
		outputOptions,
		deprecations,
		optionError: errors.length
			? `Unknown option found: ${errors.join(', ')}. Allowed keys: ${validKeys.join(', ')}`
			: null
	};
}

function deprecate ( config, command = {}, deprecateConfig = { input: true, output: true } ) {
	const deprecations = [];

	// CLI
	if ( command.id ) {
		deprecations.push( {
			old: '-u/--id',
			new: '--amd.id'
		} );
		(command.amd || (command.amd = {})).id = command.id;
	}

	if ( typeof command.output === 'string' ) {
		deprecations.push( {
			old: '--output',
			new: '--output.file'
		} );
		command.output = { file: command.output };
	}

	if ( command.format ) {
		deprecations.push( {
			old: '--format',
			new: '--output.format'
		} );
		(command.output || (command.output = {})).format = command.format;
	}

	// config file
	deprecations.push( ...deprecateOptions( config, deprecateConfig ) );
	return deprecations;
}
