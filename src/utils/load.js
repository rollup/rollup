import { readFileSync } from 'sander';

export function defaultLoader ( path, options ) {
	// TODO support plugins e.g. !css and !json?
	const source = readFileSync( path, { encoding: 'utf-8' });

	return options.transform.reduce( ( source, transformer ) => {
		return transformer( source, path );
	}, source );
}
