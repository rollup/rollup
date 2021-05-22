const needsEscapeRegEx = /[\\'\r\n\u2028\u2029]/;
const quoteNewlineRegEx = /(['\r\n\u2028\u2029])/g;
const backSlashRegEx = /\\/g;
export function escapeId(id: string): string {
	if (!id.match(needsEscapeRegEx)) return id;
	return id.replace(backSlashRegEx, '\\\\').replace(quoteNewlineRegEx, '\\$1');
}
