import Promise from 'es6-promise/lib/es6-promise/promise.js';

export function mapSequence ( array, fn ) {
	let results = [];
	let promise = Promise.resolve();

	function next ( member, i ) {
		return fn( member ).then( value => results[i] = value );
	}

	for ( let i = 0; i < array.length; i += 1 ) {
		promise = promise.then( () => next( array[i], i ) );
	}

	return promise.then( () => results );
}
