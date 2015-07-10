require( 'source-map-support' ).install();

var path = require( 'path' );
var sander = require( 'sander' );
var Promise = sander.Promise;
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

	try {
		bundle( options ).catch( handleError );
	} catch ( err ) {
		handleError( err );
	}
};

function bundle ( options, method ) {
	var bundleOptions, file;

	if ( !options.input ) {
		handleError({ code: 'MISSING_INPUT_OPTION' });
	}

	return rollup.rollup({
		entry: options.input,
		external: options.external && options.external.split( ',' )
	}).then( function ( bundle ) {
		var generateOptions = {
			dest: options.output,
			format: options.format,
			moduleId: options.id,
			moduleName: options.name,
			sourceMap: options.sourcemap
		};

		if ( options.output ) {
			return bundle.write( generateOptions );
		}

		if ( options.sourcemap && options.sourcemap !== 'inline' ) {
			handleError({ code: 'MISSING_OUTPUT_OPTION' });
		}

		var result = bundle.generate( generateOptions );

		var code = result.code;

		if ( options.sourcemap === 'inline' ) {
			code += '\n//# sourceMappingURL=' + map.toUrl();
		}

		process.stdout.write( code );
	});
}
