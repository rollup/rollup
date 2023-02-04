export function getOrCreate<K, V>(map: Map<K, V>, key: K, init: () => V): V {
	const existing = map.get(key);
	if (existing !== undefined) {
		return existing;
	}
	const value = init();
	map.set(key, value);
	return value;
}

export function getNewSet<T>() {
	return new Set<T>();
}

export function getNewArray<T>(): T[] {
	return [];
}
