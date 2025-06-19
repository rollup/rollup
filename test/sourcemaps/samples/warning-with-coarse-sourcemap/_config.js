const { encode } = require('@jridgewell/sourcemap-codec');
const terser = require('terser');
const path = require('node:path');
const ID_MAIN = path.join(__dirname, 'main.js');

const originalCode = `
console.log(
  this + 2
)
`;

module.exports = defineTest({
	description: 'get correct mapping location with coarse sourcemap',
	formats: ['es'],
	options: {
		plugins: [
			{
				resolveId() {
					return ID_MAIN;
				},
				load() {
					return {
						code: originalCode
					};
				}
			},
			{
				transform(code) {
					return {
						code,
						map: {
							mappings: encode([
								[],
								[
									[0, 0, 1, 0],
									[8, 0, 1, 8]
								],
								[
									// coarse segment
									[0, 0, 2, 2],
									[9, 0, 2, 9]
								],
								[[0, 0, 3, 0]],
								[]
							]),
							sourcesContent: [code]
						}
					};
				}
			},
			{
				transform(code) {
					return terser.minify(code, {
						sourceMap: true
					});
				}
			}
		]
	},
	warnings: [
		{
			code: 'THIS_IS_UNDEFINED',
			message:
				"main.js (3:2): The 'this' keyword is equivalent to 'undefined' at the top level of an ES module, and has been rewritten",
			url: 'https://rollupjs.org/troubleshooting/#error-this-is-undefined',
			id: ID_MAIN,
			pos: 12,
			loc: {
				column: 2,
				file: ID_MAIN,
				line: 3
			},
			frame: ' 1:\n' + '2: console.log(\n' + '3:   this + 2\n' + '     ^\n' + '4: )'
		}
	],
	async test() {}
});
