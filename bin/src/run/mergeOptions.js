import batchWarnings from './batchWarnings.js';

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

	const warnings = batchWarnings();

	if ( command.silent ) {
		options.onwarn = () => {};
	} else {
		options.onwarn = warnings.add;

		const onwarn = options.onwarn;
		if ( onwarn ) {
			options.onwarn = warning => {
				onwarn( warning, warnings.add );
			};
		} else {
			options.onwarn = warnings.add;
		}
	}

	options.external = external;

	// Use any options passed through the CLI as overrides.
	Object.keys( equivalents ).forEach( cliOption => {
		if ( command.hasOwnProperty( cliOption ) ) {
			options[ equivalents[ cliOption ] ] = command[ cliOption ];
		}
	});

	return { options, warnings };
}