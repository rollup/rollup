export const keys = Object.keys;

export function assign ( source, target ) {
	keys( target ).forEach( key => {
		source[ key ] = target[ key ];
	});

	return target;
}

export function blank () {
	return Object.create( null );
}
