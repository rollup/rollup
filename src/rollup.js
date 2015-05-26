import { basename } from 'path';
import { writeFile } from 'sander';
import Bundle from './Bundle';

let SOURCEMAPPING_URL = 'sourceMa';
SOURCEMAPPING_URL += 'ppingURL';

export function rollup ( options ) {
	if ( !options || !options.entry ) {
		throw new Error( 'You must supply options.entry to rollup' );
	}

	const bundle = new Bundle( options );

	return bundle.build().then( () => {
		return {
			generate: options => bundle.generate( options ),
			write: options => {
				if ( !options || !options.dest ) {
					throw new Error( 'You must supply options.dest to bundle.write' );
				}

				let { code, map } = bundle.generate({
					dest,
					format: options.format,
					globalName: options.globalName,

					// sourcemap options
					sourceMap: !!options.sourceMap,
					sourceMapFile: options.sourceMapFile,
					// sourceMapRoot: options.sourceMapRoot
				});

				let promises = [ writeFile( dest, code ) ];

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

				return Promise.all( promises );
			}
		};
	});
}
