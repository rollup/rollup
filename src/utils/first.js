// Return the first non-null or non-undefined result from an array of
// maybe-sync, maybe-promise-returning functions
export default function first ( candidates ) {
	return function ( ...args ) {
		return candidates.reduce( ( promise, candidate ) => {
			return promise.then( result => result != null ?
				result :
				Promise.resolve( candidate( ...args ) ) );
		}, Promise.resolve() );
	};
}
