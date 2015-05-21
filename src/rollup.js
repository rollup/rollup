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
					globalName: options.globalName
				});

				code += `\n//# ${SOURCEMAPPING_URL}=${basename( dest )}.map`;

				return Promise.all([
					writeFile( dest, code ),
					writeFile( dest + '.map', map.toString() )
				]);
			}
		};
	});
}
