export const keys = Object.keys;

export function blank () {
	return Object.create( null );
}

export const hasOwn = Function.prototype.call.bind(Object.prototype.hasOwnProperty);
