// Return the first non-null or -undefined result from an array of
// sync functions
export default function firstSync<T, Context>(
	candidates: ((...args: any[]) => T | void)[]
): (...args: any[]) => T | void {
	return function(this: Context, ...args: any[]) {
		return candidates.reduce((result, candidate) => {
			return result != null ? result : candidate.call(this, ...args);
		}, null);
	};
}
