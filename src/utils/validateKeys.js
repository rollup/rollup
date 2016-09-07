import { keys } from './object.js';
import { arrayToMap } from './arrayToMap';

export default function validateKeys ( object, allowedKeys ) {
	const actualKeys = keys( object );

	const keysMap = arrayToMap( allowedKeys );
	let i = actualKeys.length;

	while ( i-- ) {
		const key = actualKeys[i];

		if ( !keysMap[key] ) {
			return new Error(
				`Unexpected key '${ key }' found, expected one of: ${ allowedKeys.join( ', ' ) }`
			);
		}
	}
}
