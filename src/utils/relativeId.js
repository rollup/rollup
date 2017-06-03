import { isAbsolute, relative } from './path.js';

export default function relativeId ( id ) {
	if ( typeof process === 'undefined' || !isAbsolute( id ) ) return id;
	return relative( process.cwd(), id );
}
