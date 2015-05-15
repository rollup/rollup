import { writeFile } from 'sander';
import Bundle from './Bundle';

export function rollup ( entry, options = {} ) {
	const bundle = new Bundle({
		entry,
		base: options.base || process.cwd()
	});

	return bundle.collect().then( () => {
		return {
			generate: options => bundle.generate( options ),
			write: ( dest, options ) => {
				const generated = bundle.generate( options );

				return writeFile( dest, generated.code );
			}
		};
	});
}