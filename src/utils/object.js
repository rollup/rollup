export const { keys } = Object;

export function blank () {
	return Object.create( null );
}

export function forOwn ( object, func ) {
	Object.keys( object ).forEach( key => func( object[ key ], key ) );
}

export function assign ( target, ...sources ) {
	sources.forEach( source => {
		for ( let key in source ) {
			if ( source.hasOwnProperty( key ) ) target[ key ] = source[ key ];
		}
	});

	return target;
}
