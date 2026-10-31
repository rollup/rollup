const needsEscapeRegEx = /[\n\r'\\\u2028\u2029]/;
const escapeRegEx = /[\n\r'\\\u2028\u2029]/g;
const escapeReplacements: Record<string, string> = {
	'\n': '\\n',
	'\r': '\\r',
	"'": "\\'",
	'\\': '\\\\',
	'\u2028': '\\u2028',
	'\u2029': '\\u2029'
};

export function escapeId(id: string): string {
	if (!needsEscapeRegEx.test(id)) return id;
	return id.replace(escapeRegEx, character => escapeReplacements[character]);
}
