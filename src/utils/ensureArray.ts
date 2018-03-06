export default function ensureArray<T>(thing: T[]): T[];
export default function ensureArray(thing: any): any[];
export default function ensureArray<T>(thing: T[] | any): T[] | any[] {
	if (Array.isArray(thing)) return thing;
	if (thing == undefined) return [];
	return [thing];
}
