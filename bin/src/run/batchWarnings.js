import chalk from 'chalk';
import { handleWarning, stderr } from '../logging.js';
import relativeId from '../../../src/utils/relativeId.js';

export default function batchWarnings () {
	let allWarnings = new Map();
	let count = 0;

	return {
		add: warning => {
			if ( typeof warning === 'string' ) {
				warning = { code: 'UNKNOWN', message: warning };
			}

			if ( !allWarnings.has( warning.code ) ) allWarnings.set( warning.code, [] );
			allWarnings.get( warning.code ).push( warning );

			count += 1;
		},

		flush: () => {
			if ( count === 0 ) return;

			const codes = Array.from( allWarnings.keys() )
				.sort( ( a, b ) => {
					if ( handlers[a] && handlers[b] ) {
						return handlers[a].priority - handlers[b].priority;
					}

					if ( handlers[a] ) return -1;
					if ( handlers[b] ) return 1;
					return allWarnings.get( b ).length - allWarnings.get( a ).length;
				});

			codes.forEach( code => {
				const handler = handlers[ code ];
				const warnings = allWarnings.get( code );

				if ( handler ) {
					handler.fn( warnings );
				} else {
					warnings.forEach( warning => {
						handleWarning( warning );
					});
				}
			});

			allWarnings = new Map();
		}
	};
}

// TODO select sensible priorities
const handlers = {
	UNUSED_EXTERNAL_IMPORT: {
		priority: 1,
		fn: warnings => {
			group( 'Unused external imports' );
			warnings.forEach( warning => {
				stderr( `${warning.message}` );
			});
		}
	},

	UNRESOLVED_IMPORT: {
		priority: 1,
		fn: warnings => {
			group( 'Unresolved dependencies' );
			info( 'https://github.com/rollup/rollup/wiki/Troubleshooting#treating-module-as-external-dependency' );

			const dependencies = new Map();
			warnings.forEach( warning => {
				if ( !dependencies.has( warning.source ) ) dependencies.set( warning.source, [] );
				dependencies.get( warning.source ).push( warning.importer );
			});

			Array.from( dependencies.keys() ).forEach( dependency => {
				const importers = dependencies.get( dependency );
				stderr( `${chalk.bold( dependency )} (imported by ${importers.join( ', ' )})` );
			});
		}
	},

	MISSING_EXPORT: {
		priority: 1,
		fn: warnings => {
			group( 'Missing exports' );
			info( 'https://github.com/rollup/rollup/wiki/Troubleshooting#name-is-not-exported-by-module' );

			warnings.forEach( warning => {
				stderr( chalk.bold( warning.importer ) );
				stderr( `${warning.missing} is not exported by ${warning.exporter}` );
				stderr( chalk.grey( warning.frame ) );
			});
		}
	},

	THIS_IS_UNDEFINED: {
		priority: 1,
		fn: warnings => {
			group( '`this` has been rewritten to `undefined`' );
			info( 'https://github.com/rollup/rollup/wiki/Troubleshooting#this-is-undefined' );

			const modules = new Map();
			warnings.forEach( warning => {
				if ( !modules.has( warning.loc.file ) ) modules.set( warning.loc.file, [] );
				modules.get( warning.loc.file ).push( warning );
			});

			const allIds = Array.from( modules.keys() );
			const ids = allIds.length > 5 ? allIds.slice( 0, 3 ) : allIds;

			ids.forEach( id => {
				const occurrences = modules.get( id );

				stderr( chalk.bold( relativeId( id ) ) );
				stderr( chalk.grey( occurrences[0].frame ) );

				if ( occurrences.length > 1 ) {
					stderr( `...and ${occurrences.length - 1} other ${occurrences.length > 2 ? 'occurrences' : 'occurrence'}` );
				}
			});

			if ( allIds.length > ids.length ) {
				stderr( `\n...and ${allIds.length - ids.length} other files` );
			}
		}
	},

	EVAL: {
		priority: 1,
		fn: warnings => {

		}
	},

	NON_EXISTENT_EXPORT: {
		priority: 1,
		fn: warnings => {

		}
	},

	NAMESPACE_CONFLICT: {
		priority: 1,
		fn: warnings => {
			
		}
	},

	DEPRECATED_ES6: {
		priority: 1,
		fn: warnings => {
			
		}
	},

	EMPTY_BUNDLE: {
		priority: 1,
		fn: warnings => {
			
		}
	},

	MISSING_GLOBAL_NAME: {
		priority: 1,
		fn: warnings => {
			
		}
	},

	MISSING_NODE_BUILTINS: {
		priority: 1,
		fn: warnings => {
			
		}
	},

	MISSING_FORMAT: {
		priority: 1,
		fn: warnings => {
			
		}
	}, // TODO make this an error

	SOURCEMAP_BROKEN: {
		priority: 1,
		fn: warnings => {
			
		}
	},

	MIXED_EXPORTS: {
		priority: 1,
		fn: warnings => {
			
		}
	}
};

function group ( title ) {
	stderr( `${chalk.bold.yellow('(!)')} ${chalk.bold.yellow( title )}` );
}

function info ( url ) {
	stderr( chalk.grey( url ) );
}