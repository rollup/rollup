const quoteNewlineRegEx = /['\r\n\u2028\u2029]/g;
const replacements = {
	'\n': '\\n',
	'\r': '\\r',
	"'": "\\'",
	'\u2028': '\\u2028',
	'\u2029': '\\u2029'
};

export function escapeId(id: string) {
	return id.replace(quoteNewlineRegEx, match => replacements[match as keyof typeof replacements]);
}
