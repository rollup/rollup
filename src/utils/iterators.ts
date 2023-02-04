/**
 * Concatenate a number of iterables to a new iterable without fully evaluating
 * their iterators. Useful when e.g. working with large sets or lists and when
 * there is a chance that the iterators will not be fully exhausted.
 */
export function* concatLazy<T>(iterables: Iterable<T>[]): Iterable<T> {
	for (const iterable of iterables) {
		yield* iterable;
	}
}
