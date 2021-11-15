type Falsy = null | undefined | false | '' | 0;

function isTruthy<T>(val: T): val is Exclude<T, Falsy> {
	return Boolean(val);
}

export function ensureArray<T>(itemOrItems: T | T[]): Exclude<T, Falsy>[] {
	const items = Array.isArray(itemOrItems) ? itemOrItems : [itemOrItems];

	return items.filter(isTruthy);
}
