require( 'source-map-support' ).install();

var path = require( 'path' );
var handleError = require( './handleError' );
var rollup = require( '../' );

// log to stderr to keep `rollup main.js > bundle.js` from breaking
var log = console.error.bind(console);

module.exports = function ( command ) {
	if ( command._.length > 1 ) {
		handleError({ code: 'ONE_AT_A_TIME' });
	}

	if ( command._.length === 1 ) {
		if ( command.input ) {
			handleError({ code: 'DUPLICATE_IMPORT_OPTIONS' });
		}

		command.input = command._[0];
	}

	var config = command.config === true ? 'rollup.config.js' : command.config;

	if ( config ) {
		config = path.resolve( config );

		rollup.rollup({
			entry: config,
			onwarn: log
		}).then( function ( bundle ) {
			var code = bundle.generate({
				format: 'cjs'
			}).code;

			// temporarily override require
			var defaultLoader = require.extensions[ '.js' ];
			require.extensions[ '.js' ] = function ( m, filename ) {
				if ( filename === config ) {
					m._compile( code, filename );
				} else {
					defaultLoader( m, filename );
				}
			};

			try {
				var options = require( path.resolve( config ) );
			} catch ( err ) {
				handleError( err );
			}

			execute( options, command );

			require.extensions[ '.js' ] = defaultLoader;
		})
		.catch(log);
	} else {
		execute( {}, command );
	}
};

var equivalents = {
	input: 'entry',
	output: 'dest',
	name: 'moduleName',
	format: 'format',
	globals: 'globals',
	id: 'moduleId',
	sourcemap: 'sourceMap'
};

function execute ( options, command ) {
	var external = command.external ? command.external.split( ',' ) : [];

	if ( command.globals ) {
		var globals = Object.create( null );

		command.globals.split( ',' ).forEach(function ( str ) {
			var names = str.split( ':' );
			globals[ names[0] ] = names[1];

			// Add missing Module IDs to external.
			if ( external.indexOf( names[0] ) === -1 ) {
				external.push( names[0] );
			}
		});

		command.globals = globals;
	}

	options.onwarn = options.onwarn || log;

	options.external = external;
	options.indent = command.indent !== false;

	Object.keys( equivalents ).forEach( function ( cliOption ) {
		if ( command[ cliOption ] ) {
			options[ equivalents[ cliOption ] ] = command[ cliOption ];
		}
	});

	try {
		bundle( options ).catch( handleError );
	} catch ( err ) {
		handleError( err );
	}
}

function bundle ( options ) {
	if ( !options.entry ) {
		handleError({ code: 'MISSING_INPUT_OPTION' });
	}

	return rollup.rollup( options ).then( function ( bundle ) {
		if ( options.dest ) {
			return bundle.write( options );
		}

		if ( options.sourceMap && options.sourceMap !== 'inline' ) {
			handleError({ code: 'MISSING_OUTPUT_OPTION' });
		}

		var result = bundle.generate( options );

		var code = result.code,
			map = result.map;

		if ( options.sourceMap === 'inline' ) {
			code += '\n//# sourceMappingURL=' + map.toUrl();
		}

		process.stdout.write( code );
	});
}
