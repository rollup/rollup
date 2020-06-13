const quoteNewlineRegEx = /(\'|\r|\n|\u2028|\u2029)/g;
export function escapeId(id: string) {
	return id.replace(quoteNewlineRegEx, '\\$1');
}
