export function find (array, fn) {
	for (let i = 0; i < array.length; i += 1) {
		if (fn(array[i], i)) return array[i];
	}

	return null;
}
