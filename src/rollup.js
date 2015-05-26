import { basename } from 'path';
import { writeFile } from 'sander';
import Bundle from './Bundle';

let SOURCEMAPPING_URL = 'sourceMa';
SOURCEMAPPING_URL += 'ppingURL';

export function rollup ( entry, options = {} ) {
	const bundle = new Bundle({
		entry,
		resolvePath: options.resolvePath
	});

	return bundle.build().then( () => {
		return {
			generate: options => bundle.generate( options ),
			write: ( dest, options = {} ) => {
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
