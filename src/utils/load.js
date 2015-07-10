import { readFileSync } from 'sander';

export function defaultLoader ( id, options ) {
	// TODO support plugins e.g. !css and !json?
	const source = readFileSync( id, { encoding: 'utf-8' });

	return options.transform.reduce( ( source, transformer ) => {
		return transformer( source, id );
	}, source );
}
