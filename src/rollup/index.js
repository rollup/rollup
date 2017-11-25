import { timeStart, timeEnd, flushTime } from '../utils/flushTime.js';
import { basename } from '../utils/path.js';
import { writeFile } from '../utils/fs.js';
import { assign, keys } from '../utils/object.js';
import { mapSequence } from '../utils/promise.js';
import validateKeys from '../utils/validateKeys.js';
import error from '../utils/error.js';
import { SOURCEMAPPING_URL } from '../utils/sourceMappingURL.js';
import Bundle from '../Bundle.js';

export const VERSION = '<@VERSION@>';

const ALLOWED_KEYS = [
	'acorn',
	'amd',
	'banner',
	'cache',
	'context',
	'entry',
	'exports',
	'extend',
	'external',
	'file',
	'footer',
	'format',
	'freeze',
	'globals',
	'indent',
	'input',
	'interop',
	'intro',
	'legacy',
	'moduleContext',
	'name',
	'noConflict',
	'onwarn',
	'output',
	'outro',
	'paths',
	'plugins',
	'preferConst',
	'pureExternalModules',
	'sourcemap',
	'sourcemapFile',
	'strict',
	'targets',
	'treeshake',
	'watch'
];

function checkAmd ( options ) {
	if ( options.moduleId ) {
		if ( options.amd ) throw new Error( 'Cannot have both options.amd and options.moduleId' );

		options.amd = { id: options.moduleId };
		delete options.moduleId;

		const message = `options.moduleId is deprecated in favour of options.amd = { id: moduleId }`;
		if ( options.onwarn ) {
			options.onwarn( { message } );
		} else {
			console.warn( message ); // eslint-disable-line no-console
		}
	}
}

function checkInputOptions ( options, warn ) {
	if ( options.transform || options.load || options.resolveId || options.resolveExternal ) {
		throw new Error(
			'The `transform`, `load`, `resolveId` and `resolveExternal` options are deprecated in favour of a unified plugin API. See https://github.com/rollup/rollup/wiki/Plugins for details' );
	}

	if ( options.pureExternalModules ) {
		if ( options.treeshake === undefined ) {
			options.treeshake = {};
		}
		if ( options.treeshake ) {
			options.treeshake.pureExternalModules = options.pureExternalModules;
		}
		delete options.pureExternalModules;
		warn( {
			message: `options.pureExternalModules is deprecated, use options.treeshake.pureExternalModules`
		} );
	}

	if ( options.entry && !options.input ) {
		options.input = options.entry;
		warn( {
			message: `options.entry is deprecated, use options.input`
		} );
	}

	const err = validateKeys( keys( options ), ALLOWED_KEYS );
	if ( err ) throw err;
}

const deprecated = {
	dest: 'file',
	moduleName: 'name',
	sourceMap: 'sourcemap',
	sourceMapFile: 'sourcemapFile',
	useStrict: 'strict'
};

function checkOutputOptions ( options, warn ) {
	if ( options.format === 'es6' ) {
		error( {
			message: 'The `es6` output format is deprecated – use `es` instead',
			url: `https://github.com/rollup/rollup/wiki/JavaScript-API#format`
		} );
	}

	if ( !options.format ) {
		error( {
			message: `You must specify options.format, which can be one of 'amd', 'cjs', 'es', 'iife' or 'umd'`,
			url: `https://github.com/rollup/rollup/wiki/JavaScript-API#format`
		} );
	}

	if ( options.moduleId ) {
		if ( options.amd ) throw new Error( 'Cannot have both options.amd and options.moduleId' );

		options.amd = { id: options.moduleId };
		delete options.moduleId;

		warn( {
			message: `options.moduleId is deprecated in favour of options.amd = { id: moduleId }`
		} );
	}

	const deprecations = [];
	Object.keys( deprecated ).forEach( old => {
		if ( old in options ) {
			deprecations.push( { old, new: deprecated[ old ] } );
			options[ deprecated[ old ] ] = options[ old ];
			delete options[ old ];
		}
	} );

	if ( deprecations.length ) {
		const message = `The following options have been renamed — please update your config: ${deprecations.map(
			option => `${option.old} -> ${option.new}` ).join( ', ' )}`;
		warn( {
			code: 'DEPRECATED_OPTIONS',
			message,
			deprecations
		} );
	}
}

const throwAsyncGenerateError = {
	get () {
		throw new Error( `bundle.generate(...) now returns a Promise instead of a { code, map } object` );
	}
};

export default function rollup ( options ) {
	try {
		if ( !options ) {
			throw new Error( 'You must supply an options object to rollup' );
		}

		const warn = options.onwarn || (warning => console.warn( warning.message )); // eslint-disable-line no-console

		checkInputOptions( options, warn );
		const bundle = new Bundle( options );

		timeStart( '--BUILD--' );

		return bundle.build().then( () => {
			timeEnd( '--BUILD--' );

			function generate ( options ) {
				if ( !options ) {
					throw new Error( 'You must supply an options object' );
				}
				checkOutputOptions( options, warn );
				checkAmd( options );

				timeStart( '--GENERATE--' );

				const promise = Promise.resolve()
					.then( () => bundle.render( options ) )
					.then( rendered => {
						timeEnd( '--GENERATE--' );

						bundle.plugins.forEach( plugin => {
							if ( plugin.ongenerate ) {
								plugin.ongenerate( assign( {
									bundle: result
								}, options ), rendered );
							}
						} );

						flushTime();

						return rendered;
					} );

				Object.defineProperty( promise, 'code', throwAsyncGenerateError );
				Object.defineProperty( promise, 'map', throwAsyncGenerateError );

				return promise;
			}

			const result = {
				imports: bundle.externalModules.map( module => module.id ),
				exports: keys( bundle.entryModule.exports ),
				modules: bundle.orderedModules.map( module => module.toJSON() ),

				generate,
				write: options => {
					if ( !options || (!options.file && !options.dest) ) {
						error( {
							code: 'MISSING_OPTION',
							message: 'You must specify options.file'
						} );
					}

					return generate( options ).then( result => {
						const file = options.file;
						let { code, map } = result;

						const promises = [];

						if ( options.sourcemap ) {
							let url;

							if ( options.sourcemap === 'inline' ) {
								url = map.toUrl();
							} else {
								url = `${basename( file )}.map`;
								promises.push( writeFile( file + '.map', map.toString() ) );
							}

							code += `//# ${SOURCEMAPPING_URL}=${url}\n`;
						}

						promises.push( writeFile( file, code ) );
						return Promise.all( promises ).then( () => {
							return mapSequence( bundle.plugins.filter( plugin => plugin.onwrite ), plugin => {
								return Promise.resolve( plugin.onwrite( assign( {
									bundle: result
								}, options ), result ) );
							} );
						} );
					} );
				}
			};

			return result;
		} );
	} catch ( err ) {
		return Promise.reject( err );
	}
}
