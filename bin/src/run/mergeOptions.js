import ensureArray from '../../../src/utils/ensureArray.js';
import deprecateOptions from '../../../src/utils/deprecateOptions.js';

export default function mergeOptions ( config, command ) {
	// deprecations... TODO
	const deprecations = deprecate( config, command );

	function getOption(name) {
		return command[name] !== undefined ? command[name] : config[name];
	}

	const inputOptions = {
		input: getOption('input'),
		legacy: getOption('legacy'),
		treeshake: getOption('treeshake'),
		acorn: config.acorn,
		context: config.context,
		moduleContext: config.moduleContext,
		plugins: config.plugins,
		onwarn: config.onwarn
	};

	// legacy, to ensure e.g. commonjs plugin still works
	inputOptions.entry = inputOptions.input;

	const commandExternal = ( command.external || '' ).split( ',' );
	const configExternal = config.external;

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

	if ( typeof configExternal === 'function' ) {
		inputOptions.external = id => {
			return configExternal( id ) || ~commandExternal.indexOf( id );
		};
	} else {
		inputOptions.external = ( configExternal || [] ).concat( commandExternal );
	}

	if (command.silent) {
		inputOptions.onwarn = () => {};
	}

	const baseOutputOptions = {
		extend: command.extend !== undefined ? command.extend : config.extend,
		amd: Object.assign({}, config.amd, command.amd),

		banner: getOption('banner'),
		footer: getOption('footer'),
		intro: getOption('intro'),
		outro: getOption('outro'),
		sourcemap: getOption('sourcemap'),
		name: getOption('name'),
		globals: getOption('globals'),
		interop: getOption('interop'),
		legacy: getOption('legacy'),
		indent: getOption('indent'),
		strict: getOption('strict'),
		noConflict: getOption('noConflict'),
		paths: getOption('paths')
	};

	let mergedOutputOptions;
	if (Array.isArray(config.output)) {
		mergedOutputOptions = config.output.map((output) => Object.assign({}, output, command.output));
	} else if (config.output && command.output) {
		mergedOutputOptions = [Object.assign({}, config.output, command.output)];
	} else {
		mergedOutputOptions = (command.output || config.output) ?
			ensureArray(command.output || config.output) :
			[{
				file: command.output ? command.output.file : null,
				format: command.output ? command.output.format : null
			}];
	}

	const outputOptions = mergedOutputOptions.map(output => {
		return Object.assign({}, baseOutputOptions, output);
	});

	return { inputOptions, outputOptions, deprecations };
}

function deprecate( config, command ) {
	const deprecations = [];

	// CLI
	if ( command.id ) {
		deprecations.push({
			old: '-u/--id',
			new: '--amd.id'
		});
		(command.amd || (command.amd = {})).id = command.id;
	}

	if ( typeof command.output === 'string' ) {
		deprecations.push({
			old: '--output',
			new: '--output.file'
		});
		command.output = { file: command.output };
	}

	if ( command.format ) {
		deprecations.push({
			old: '--format',
			new: '--output.format'
		});
		(command.output || (command.output = {})).format = command.format;
	}

	// config file
	deprecations.push(...deprecateOptions(config));
	return deprecations;
}