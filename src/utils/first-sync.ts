// Return the first non-null or -undefined result from an array of
// sync functions
export default function firstSync<T>(candidates: ((...args: any[]) => T | void)[]): (...args: any[]) => T | void {
	return function(...args: any[]) {
		return candidates.reduce<T | void>((result, candidate) => {
			return result != null ? result : candidate(...args);
		}, null);
	};
}
