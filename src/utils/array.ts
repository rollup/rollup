export function find<T> (array: T[], fn: (item: T, index: number) => boolean) {
	for (let i = 0; i < array.length; i += 1) {
		if (fn(array[i], i)) return array[i];
	}

	return null;
}
