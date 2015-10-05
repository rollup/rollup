require( 'source-map-support' ).install();

var handleError = require( './handleError' );
var rollup = require( '../' );

module.exports = function ( options ) {
	if ( options._.length > 1 ) {
		handleError({ code: 'ONE_AT_A_TIME' });
	}

	if ( options._.length === 1 ) {
		if ( options.input ) {
			handleError({ code: 'DUPLICATE_IMPORT_OPTIONS' });
		}

		options.input = options._[0];
	}

	var external = options.external ? options.external.split( ',' ) : [];

	if ( options.globals ) {
		var globals = Object.create( null );

		options.globals.split( ',' ).forEach(function ( str ) {
			var names = str.split( ':' );
			globals[ names[0] ] = names[1];

			// Add missing Module IDs to external.
			if ( external.indexOf( names[0] ) === -1 ) {
				external.push( names[0] );
			}
		});

		options.globals = globals;
	}

	options.external = external;

	try {
		bundle( options ).catch( handleError );
	} catch ( err ) {
		handleError( err );
	}
};

function bundle ( options, method ) {
	if ( !options.input ) {
		handleError({ code: 'MISSING_INPUT_OPTION' });
	}

	return rollup.rollup({
		entry: options.input,
		external: options.external
	}).then( function ( bundle ) {
		var generateOptions = {
			dest: options.output,
			format: options.format,
			globals: options.globals,
			moduleId: options.id,
			moduleName: options.name,
			sourceMap: options.sourcemap,
			indent: options.indent !== false
		};

		if ( options.output ) {
			return bundle.write( generateOptions );
		}

		if ( options.sourcemap && options.sourcemap !== 'inline' ) {
			handleError({ code: 'MISSING_OUTPUT_OPTION' });
		}

		var result = bundle.generate( generateOptions );

		var code = result.code,
			map = result.map;

		if ( options.sourcemap === 'inline' ) {
			code += '\n//# sourceMappingURL=' + map.toUrl();
		}

		process.stdout.write( code );
	});
}
