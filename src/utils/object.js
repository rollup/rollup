export const { keys } = Object;

export function blank () {
	return Object.create( null );
}

export function forOwn ( object, func ) {
	Object.keys( object ).forEach( key => func( object[ key ], key ) );
}
