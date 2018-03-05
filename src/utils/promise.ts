export function mapSequence<T, U>(array: T[], fn: (member: T) => Promise<U> | U): Promise<U[]> {
	const results: U[] = [];
	let promise: Promise<U | void> = Promise.resolve();

	function next(member: T, i: number) {
		return Promise.resolve(fn(member)).then(value => (results[i] = value));
	}

	for (let i = 0; i < array.length; i += 1) {
		promise = promise.then(() => next(array[i], i));
	}

	return promise.then(() => results);
}

export function runSequence<T>(array: T[]) {
	return mapSequence<T, T>(array, i => i);
}
