var chalk = require( 'chalk' );

var handlers = {
	MISSING_CONFIG: function () {
		console.error( chalk.red( 'Config file must export an options object. See https://github.com/rollup/rollup/wiki/Command-Line-Interface#using-a-config-file' ) );
	},

	MISSING_INPUT_OPTION: function () {
		console.error( chalk.red( 'You must specify an --input (-i) option' ) );
	},

	MISSING_OUTPUT_OPTION: function () {
		console.error( chalk.red( 'You must specify an --output (-o) option when creating a file with a sourcemap' ) );
	},

	MISSING_NAME: function ( err ) {
		console.error( chalk.red( 'You must supply a name for UMD exports (e.g. `--name myModule`)' ) );
	},

	PARSE_ERROR: function ( err ) {
		console.error( chalk.red( 'Error parsing ' + err.file + ': ' + err.message ) );
	},

	ONE_AT_A_TIME: function ( err ) {
		console.error( chalk.red( 'rollup can only bundle one file at a time' ) );
	},

	DUPLICATE_IMPORT_OPTIONS: function ( err ) {
		console.error( chalk.red( 'use --input, or pass input path as argument' ) );
	}
};

module.exports = function handleError ( err ) {
	var handler;

	if ( handler = handlers[ err && err.code ] ) {
		handler( err );
	} else {
		console.error( chalk.red( err.message || err ) );

		if ( err.stack ) {
			console.error( chalk.grey( err.stack ) );
		}
	}

	console.error( 'Type ' + chalk.cyan( 'rollup --help' ) + ' for help, or visit https://github.com/rollup/rollup/wiki' );

	process.exit( 1 );
};
