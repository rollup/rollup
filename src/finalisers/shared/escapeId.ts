const quoteRegEx = /'/g;
export function escapeId(id: string) {
	return id.replace(quoteRegEx, "\\'");
}
