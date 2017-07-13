import { timeStart, timeEnd, flushTime } from './utils/flushTime.js';
import { basename } from './utils/path.js';
import { writeFile } from './utils/fs.js';
import { assign, keys } from './utils/object.js';
import { mapSequence } from './utils/promise.js';
import validateKeys from './utils/validateKeys.js';
import error from './utils/error.js';
import { SOURCEMAPPING_URL } from './utils/sourceMappingURL.js';
import Bundle from './Bundle.js';

export const VERSION = '<@VERSION@>';

const ALLOWED_KEYS = [
	'acorn',
	'amd',
	'banner',
	'cache',
	'context',
	'dest',
	'entry',
	'exports',
	'extend',
	'external',
	'footer',
	'format',
	'globals',
	'indent',
	'interop',
	'intro',
	'legacy',
	'moduleContext',
	'moduleName',
	'noConflict',
	'onwarn',
	'outro',
	'paths',
	'plugins',
	'preferConst',
	'pureExternalModules',
	'sourceMap',
	'sourceMapFile',
	'targets',
	'treeshake',
	'useStrict',
	'watch'
];

function checkAmd ( options ) {
	if ( options.moduleId ) {
		if ( options.amd ) throw new Error( 'Cannot have both options.amd and options.moduleId' );

		options.amd = { id: options.moduleId };
		delete options.moduleId;

		const msg = `options.moduleId is deprecated in favour of options.amd = { id: moduleId }`;
		if ( options.onwarn ) {
			options.onwarn( msg );
		} else {
			console.warn( msg ); // eslint-disable-line no-console
		}
	}
}

function checkOptions ( options ) {
	if ( !options ) {
		throw new Error( 'You must supply an options object to rollup' );
	}

	if ( options.transform || options.load || options.resolveId || options.resolveExternal ) {
		throw new Error( 'The `transform`, `load`, `resolveId` and `resolveExternal` options are deprecated in favour of a unified plugin API. See https://github.com/rollup/rollup/wiki/Plugins for details' );
	}

	checkAmd (options);

	const err = validateKeys( keys(options), ALLOWED_KEYS );
	if ( err ) throw err;
}

const throwAsyncGenerateError = {
	get () {
		throw new Error( `bundle.generate(...) now returns a Promise instead of a { code, map } object` );
	}
};

export function rollup ( options ) {
	try {
		checkOptions( options );
		const bundle = new Bundle( options );

		timeStart( '--BUILD--' );

		return bundle.build().then( () => {
			timeEnd( '--BUILD--' );

			function generate ( options = {} ) {
				if ( !options.format ) {
					bundle.warn({ // TODO make this an error
						code: 'MISSING_FORMAT',
						message: `No format option was supplied – defaulting to 'es'`,
						url: `https://github.com/rollup/rollup/wiki/JavaScript-API#format`
					});

					options.format = 'es';
				}

				checkAmd( options );

				timeStart( '--GENERATE--' );

				const promise = Promise.resolve()
					.then( () => bundle.render( options ) )
					.then( rendered => {
						timeEnd( '--GENERATE--' );

						bundle.plugins.forEach( plugin => {
							if ( plugin.ongenerate ) {
								plugin.ongenerate( assign({
									bundle: result
								}, options ), rendered);
							}
						});

						flushTime();

						return rendered;
					});

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
					if ( !options || !options.dest ) {
						error({
							code: 'MISSING_OPTION',
							message: 'You must supply options.dest to bundle.write'
						});
					}

					const dest = options.dest;
					return generate( options ).then( output => {
						let { code, map } = output;

						const promises = [];

						if ( options.sourceMap ) {
							let url;

							if ( options.sourceMap === 'inline' ) {
								url = map.toUrl();
							} else {
								url = `${basename( dest )}.map`;
								promises.push( writeFile( dest + '.map', map.toString() ) );
							}

							code += `//# ${SOURCEMAPPING_URL}=${url}\n`;
						}

						promises.push( writeFile( dest, code ) );
						return Promise.all( promises ).then( () => {
							return mapSequence( bundle.plugins.filter( plugin => plugin.onwrite ), plugin => {
								return Promise.resolve( plugin.onwrite( assign({
									bundle: result
								}, options ), output));
							});
						});
					});
				}
			};

			return result;
		});
	} catch ( err ) {
		return Promise.reject( err );
	}
}
