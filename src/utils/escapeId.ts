const needsEscapeRegEx = /[\n\r'\\\u2028\u2029]/;
const quoteNewlineRegEx = /([\n\r'\u2028\u2029])/g;
const backSlashRegEx = /\\/g;

export function escapeId(id: string): string {
	if (!needsEscapeRegEx.test(id)) return id;
	return id.replace(backSlashRegEx, '\\\\').replace(quoteNewlineRegEx, '\\$1');
}
