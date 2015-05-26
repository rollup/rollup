import { readFileSync } from 'sander';

export function defaultLoader ( path, options ) {
	// TODO support plugins and transformers?
	return readFileSync( path, { encoding: 'utf-8' });
}
