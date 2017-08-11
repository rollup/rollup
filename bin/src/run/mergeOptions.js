import batchWarnings from './batchWarnings.js';

const equivalents = {
	useStrict: 'useStrict',
	banner: 'banner',
	footer: 'footer',
	format: 'format',
	globals: 'globals',
	id: 'moduleId',
	indent: 'indent',
	interop: 'interop',
	input: 'entry',
	intro: 'intro',
	legacy: 'legacy',
	name: 'moduleName',
	output: 'dest',
	outro: 'outro',
	sourcemap: 'sourceMap',
	treeshake: 'treeshake'
};

export default function mergeOptions ( config, command ) {
	const options = Object.assign( {}, config );

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

	if (command.silent) {
		options.onwarn = () => {};
	}

	options.external = external;

	// Use any options passed through the CLI as overrides.
	Object.keys( equivalents ).forEach( cliOption => {
		if ( command.hasOwnProperty( cliOption ) ) {
			options[ equivalents[ cliOption ] ] = command[ cliOption ];
		}
	});

	const targets = options.dest ? [{ dest: options.dest, format: options.format }] : options.targets;
	options.targets = targets;
	delete options.dest;

	return options;
}
