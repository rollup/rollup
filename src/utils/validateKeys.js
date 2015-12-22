import { keys } from './object.js';

export default function validateKeys ( object, allowedKeys ) {
	const actualKeys = keys( object );

	let i = actualKeys.length;

	while ( i-- ) {
		const key = actualKeys[i];

		if ( allowedKeys.indexOf( key ) === -1 ) {
			return new Error(
				`Unexpected key '${ key }' found, expected one of: ${ allowedKeys.join( ', ' ) }`
			);
		}
	}
}
