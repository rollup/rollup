const quoteNewlineRegEx = /\'|\r\n?|\n|\u2028|\u2029/g;
export function escapeId(id: string) {
	return id.replace(quoteNewlineRegEx, "\\'");
}
