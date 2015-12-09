import { keys } from './object.js';

export default function validateKeys ( object, allowedKeys ) {
	const actualKeys = keys( object );

	for ( let key of actualKeys ) {
		if ( allowedKeys.indexOf( key ) < 0 ) {
			return new Error(
				`Unexpected key '${ key }' found, expected one of: ${ allowedKeys.join( ', ' ) }`
			);
		}
	}
}
