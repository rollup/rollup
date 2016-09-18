export const { keys } = Object;

export function blank () {
	return Object.create( null );
}

export function forOwn ( object, func ) {
	Object.keys( object ).forEach( key => func( object[ key ], key ) );
}

export function assign ( target, ...sources ) {
	sources.forEach( source => {
		for ( const key in source ) {
			if ( source.hasOwnProperty( key ) ) target[ key ] = source[ key ];
		}
	});

	return target;
}

const isArray = Array.isArray;

// used for cloning ASTs. Not for use with cyclical structures!
export function deepClone ( obj ) {
	if ( !obj ) return obj;
	if ( typeof obj !== 'object' ) return obj;

	if ( isArray( obj ) ) {
		const clone = new Array( obj.length );
		for ( let i = 0; i < obj.length; i += 1 ) clone[i] = deepClone( obj[i] );
		return clone;
	}

	const clone = {};
	for ( const key in obj ) {
		clone[ key ] = deepClone( obj[ key ] );
	}

	return clone;
}
