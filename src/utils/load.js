import { readFileSync } from './fs';

export function defaultLoader ( id, options ) {
	// TODO support plugins e.g. !css and !json?
	const source = readFileSync( id, 'utf-8' );

	return options.transform.reduce( ( source, transformer ) => {
		return transformer( source, id );
	}, source );
}
