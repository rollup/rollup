export function flatten(items: any[]): any[] {
	if (!items || items.length === 0) {
		return items;
	}

	const results: any[] = [];
	for (const item of items) {
		if (Array.isArray(item)) {
			results.push(...flatten(item));
		} else {
			results.push(item);
		}
	}
	return results;
}
