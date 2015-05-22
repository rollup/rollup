export const keys = Object.keys;

export const hasOwnProp = Object.prototype.hasOwnProperty;

export function has ( obj, prop ) {
	return hasOwnProp.call( obj, prop );
}

export function blank () {
	return Object.create( null );
}
