export default function validateKeys ( actualKeys, allowedKeys ) {
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
