import Promise from 'es6-promise/lib/es6-promise/promise.js';
import { basename } from './utils/path.js';
import { writeFile } from './utils/fs.js';
import { keys } from './utils/object.js';
import SOURCEMAPPING_URL from './utils/sourceMappingURL.js';
import Bundle from './Bundle.js';

export const VERSION = '<@VERSION@>';

export function rollup ( options ) {
	if ( !options || !options.entry ) {
		return Promise.reject( new Error( 'You must supply options.entry to rollup' ) );
	}

	if ( options.transform || options.load || options.resolveId || options.resolveExternal ) {
		return Promise.reject( new Error( 'The `transform`, `load`, `resolveId` and `resolveExternal` options are deprecated in favour of a unified plugin API. See https://github.com/rollup/rollup/wiki/Plugins for details' ) );
	}

	const bundle = new Bundle( options );

	return bundle.build().then( () => {
		return {
			imports: bundle.externalModules.map( module => module.id ),
			exports: keys( bundle.entryModule.exports ),
			modules: bundle.orderedModules.map( module => {
				return { id: module.id };
			}),

			generate: options => bundle.render( options ),
			write: options => {
				if ( !options || !options.dest ) {
					throw new Error( 'You must supply options.dest to bundle.write' );
				}

				const dest = options.dest;
				let { code, map } = bundle.render( options );

				let promises = [];

				if ( options.sourceMap ) {
					let url;

					if ( options.sourceMap === 'inline' ) {
						url = map.toUrl();
					} else {
						url = `${basename( dest )}.map`;
						promises.push( writeFile( dest + '.map', map.toString() ) );
					}

					code += `\n//# ${SOURCEMAPPING_URL}=${url}`;
				}

				promises.push( writeFile( dest, code ) );
				return Promise.all( promises );
			}
		};
	});
}
