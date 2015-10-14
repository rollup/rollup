import Promise from 'es6-promise/lib/es6-promise/promise';

// Return the first non-falsy result from an array of
// maybe-sync, maybe-promise-returning functions
export default function first ( candidates ) {
	return function ( ...args ) {
		return candidates.reduce( ( promise, candidate ) => {
			return promise.then( result => result != null ?
				result :
				Promise.resolve( candidate( ...args ) ) );
		}, Promise.resolve() );
	}
}
