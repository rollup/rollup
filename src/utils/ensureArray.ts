export function ensureArray<T>(
	items: (T | false | null | undefined)[] | T | false | null | undefined
): T[] {
	if (Array.isArray(items)) {
		return items.filter(Boolean) as T[];
	}
	if (items) {
		return [items];
	}
	return [];
}
