import { e } from './e';

export function something () {
	try {
		console.log( e );
	} catch ( e ) { // the catch identifier shadows the import
		console.error( e );
	}
}
