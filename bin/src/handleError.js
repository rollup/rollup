import chalk from 'chalk';

function stderr ( msg ) {
	console.error( msg ); // eslint-disable-line no-console
}

const handlers = {
	MISSING_CONFIG: () => {
		stderr( chalk.red( 'Config file must export an options object. See https://github.com/rollup/rollup/wiki/Command-Line-Interface#using-a-config-file' ) );
	},

	MISSING_EXTERNAL_CONFIG: err => {
		stderr( chalk.red( `Could not resolve config file ${err.config}` ) );
	},

	MISSING_INPUT_OPTION: () => {
		stderr( chalk.red( 'You must specify an --input (-i) option' ) );
	},

	MISSING_OUTPUT_OPTION: () => {
		stderr( chalk.red( 'You must specify an --output (-o) option when creating a file with a sourcemap' ) );
	},

	MISSING_NAME: () => {
		stderr( chalk.red( 'You must supply a name for UMD exports (e.g. `--name myModule`)' ) );
	},

	PARSE_ERROR: err => {
		stderr( chalk.red( `Error parsing ${err.file}: ${err.message}` ) );
	},

	ONE_AT_A_TIME: () => {
		stderr( chalk.red( 'rollup can only bundle one file at a time' ) );
	},

	DUPLICATE_IMPORT_OPTIONS: () => {
		stderr( chalk.red( 'use --input, or pass input path as argument' ) );
	},

	ROLLUP_WATCH_NOT_INSTALLED: () => {
		stderr( chalk.red( 'rollup --watch depends on the rollup-watch package, which could not be found. Install it with ' ) + chalk.cyan( 'npm install -D rollup-watch' ) );
	},

	WATCHER_MISSING_INPUT_OR_OUTPUT: () => {
		stderr( chalk.red( 'must specify --input and --output when using rollup --watch' ) );
	}
};

export default function handleError ( err, recover ) {
	const handler = handlers[ err && err.code ];

	if ( handler ) {
		handler( err );
	} else {
		stderr( chalk.red( err.message || err ) );

		if ( err.stack ) {
			stderr( chalk.grey( err.stack ) );
		}
	}

	stderr( `Type ${chalk.cyan( 'rollup --help' )} for help, or visit https://github.com/rollup/rollup/wiki` );

	if ( !recover ) process.exit( 1 );
}
