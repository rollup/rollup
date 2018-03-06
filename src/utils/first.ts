// Return the first non-null or -undefined result from an array of
// maybe-sync, maybe-promise-returning functions
export default function first<T>(
	candidates: ((...args: any[]) => Promise<T | void> | T | void)[]
): (...args: any[]) => Promise<T | void> {
	return function(...args: any[]) {
		return candidates.reduce((promise, candidate) => {
			return promise.then(
				result => (result != null ? result : Promise.resolve(candidate(...args)))
			);
		}, Promise.resolve());
	};
}
