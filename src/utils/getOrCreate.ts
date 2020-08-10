export function getOrCreate<K, V>(map: Map<K, V>, key: K, init: () => V): V {
	const existing = map.get(key);
	if (existing) {
		return existing;
	}
	const value = init();
	map.set(key, value);
	return value;
}
