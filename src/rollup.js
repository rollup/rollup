import { basename } from './utils/path.js';
import { writeFile } from './utils/fs.js';
import { assign, keys } from './utils/object.js';
import { mapSequence } from './utils/promise.js';
import validateKeys from './utils/validateKeys.js';
import SOURCEMAPPING_URL from './utils/sourceMappingURL.js';
import Bundle from './Bundle.js';

export const VERSION = '<@VERSION@>';

const ALLOWED_KEYS = [
	'acorn',
	'banner',
	'cache',
	'context',
	'dest',
	'entry',
	'exports',
	'external',
	'footer',
	'format',
	'globals',
	'indent',
	'intro',
	'moduleId',
	'moduleName',
	'noConflict',
	'onwarn',
	'outro',
	'paths',
	'plugins',
	'preferConst',
	'sourceMap',
	'sourceMapFile',
	'targets',
	'treeshake',
	'useStrict'
];

export function rollup ( options ) {
	if ( !options || !options.entry ) {
		return Promise.reject( new Error( 'You must supply options.entry to rollup' ) );
	}

	if ( options.transform || options.load || options.resolveId || options.resolveExternal ) {
		return Promise.reject( new Error( 'The `transform`, `load`, `resolveId` and `resolveExternal` options are deprecated in favour of a unified plugin API. See https://github.com/rollup/rollup/wiki/Plugins for details' ) );
	}

	const error = validateKeys( options, ALLOWED_KEYS );

	if ( error ) {
		return Promise.reject( error );
	}

	const bundle = new Bundle( options );

	return bundle.build().then( () => {
		function generate ( options ) {
			const rendered = bundle.render( options );

			bundle.plugins.forEach( plugin => {
				if ( plugin.ongenerate ) {
					plugin.ongenerate( assign({
						bundle: result
					}, options ), rendered);
				}
			});

			return rendered;
		}

		const result = {
			imports: bundle.externalModules.map( module => module.id ),
			exports: keys( bundle.entryModule.exports ),
			modules: bundle.orderedModules.map( module => module.toJSON() ),

			generate,
			write: options => {
				if ( !options || !options.dest ) {
					throw new Error( 'You must supply options.dest to bundle.write' );
				}

				const dest = options.dest;
				const output = generate( options );
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

					code += `\n//# ${SOURCEMAPPING_URL}=${url}\n`;
				}

				promises.push( writeFile( dest, code ) );
				return Promise.all( promises ).then( () => {
					return mapSequence( bundle.plugins.filter( plugin => plugin.onwrite ), plugin => {
						return Promise.resolve( plugin.onwrite( assign({
							bundle: result
						}, options ), output));
					});
				});
			}
		};

		return result;
	});
}
