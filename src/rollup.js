import { basename } from './utils/path';
import { writeFile } from './utils/fs';
import { keys } from './utils/object';
import SOURCEMAPPING_URL from './utils/sourceMappingURL';
import Bundle from './Bundle';

export const VERSION = '<@VERSION@>';

export function rollup ( options ) {
	if ( !options || !options.entry ) {
		throw new Error( 'You must supply options.entry to rollup' );
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
