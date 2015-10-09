// Given a `fallback` and a `preferred` function,
// return a function that attempts to call the `preferred`.
// If it fails, or returns undefined, call the fallback and return its value.
export default function attempt ( fallback, preferred ) {
	return function ( ...args ) {
		const boundFallback = () => fallback( ...args );

		return Promise.resolve( preferred( ...args ) )
			.then( res => res === undefined ? boundFallback() : res, boundFallback );
	};
}
