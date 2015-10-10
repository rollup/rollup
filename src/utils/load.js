import { readFileSync } from './fs';

export function defaultLoader ( id ) {
	return readFileSync( id, 'utf-8' );
}
