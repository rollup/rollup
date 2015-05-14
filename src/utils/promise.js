import { Promise } from 'sander';

export function sequence ( arr, callback ) {
	const len = arr.length;
	let results = new Array( len );

	let promise = Promise.resolve();

	function next ( i ) {
		return promise
			.then( () => callback( arr[i], i ) )
			.then( result => results[i] = result );
	}

	let i;

	for ( i = 0; i < len; i += 1 ) {
		promise = next( i );
	}

	return promise.then( () => results );
}