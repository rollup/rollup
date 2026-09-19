const assert = require('node:assert');

// The source is synthesised rather than checked in: .gitattributes normalises
// every committed file to LF, so a CRLF fixture cannot survive in the tree.
const source = [
	'function withBlockComment() {',
	'\treturn true &&',
	'\t\t/* comment */',
	'\t\t"block";',
	'}',
	'function withLineComment() {',
	'\treturn true &&',
	'\t\t// comment',
	'\t\t"line";',
	'}',
	'function withoutComment() {',
	'\treturn true &&',
	'\t\t"plain";',
	'}',
	'export const block = withBlockComment();',
	'export const line = withLineComment();',
	'export const plain = withoutComment();',
	''
].join('\r\n');

module.exports = defineTest({
	description: 'does not leave a carriage return that triggers ASI after return',
	options: {
		input: 'main',
		plugins: [
			{
				name: 'crlf-source',
				resolveId: id => (id === 'main' ? id : null),
				load: id => (id === 'main' ? source : null)
			}
		]
	},
	exports(exports) {
		assert.strictEqual(exports.block, 'block');
		assert.strictEqual(exports.line, 'line');
		assert.strictEqual(exports.plain, 'plain');
	}
});
