import chalk from 'chalk';
import { handleWarning } from '../logging.js';
import relativeId from '../../../src/utils/relativeId.js';

export default function batchWarnings () {
	const allWarnings = new Map();
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
				log( `${warning.message}` );
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
				log( `${chalk.bold( dependency )} (imported by ${importers.join( ', ' )})` );
			});
		}
	},

	MISSING_EXPORT: {
		priority: 1,
		fn: warnings => {
			group( 'Missing exports' );
			info( 'https://github.com/rollup/rollup/wiki/Troubleshooting#name-is-not-exported-by-module' );

			warnings.forEach( warning => {
				log( chalk.bold( warning.importer ) );
				log( `${warning.missing} is not exported by ${warning.exporter}` );
				log( chalk.grey( warning.frame ) );
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
				const allOccurrences = modules.get( id );
				const occurrences = allOccurrences.length > 5 ? allOccurrences.slice( 0, 3 ) : allOccurrences;

				log( chalk.bold( relativeId( id ) ) );
				log( chalk.grey( occurrences.map( warning => warning.frame ).join( '\n\n' ) ) );

				if ( allOccurrences.length > occurrences.length ) {
					log( `\n...and ${allOccurrences.length - occurrences.length} occurrences` );
				}
			});

			if ( allIds.length > ids.length ) {
				log( `\n...and ${allIds.length - ids.length} files` );
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
	log( `\n${chalk.bold.yellow('(!)')} ${chalk.bold.yellow( title )}` );
}

function info ( url ) {
	log( chalk.grey( url ) );
}

function log ( message ) {
	console.warn( message ); // eslint-disable-line no-console
}