import { keys } from './object.js';

export default function validateKeys ( object, allowedKeys ) {
	const actualKeys = keys( object );

	actualKeys.forEach( key => {
		if ( allowedKeys.indexOf( key ) < 0 ) {
			throw new Error( `Unexpected key '${ key }' found, expected one of: ${ allowedKeys.join( ', ' ) }` );
		}
	});
}
