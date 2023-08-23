const path = require('node:path');
const { encode } = require('@jridgewell/sourcemap-codec');
const ID_MAIN = path.join(__dirname, 'main.js');

module.exports = defineTest({
	description: 'handles when a low resolution sourcemap is used to report an error',
	options: {
		plugins: [
			{
				name: 'test-plugin',
				transform() {
					// each entry of each line consist of
					// [generatedColumn, sourceIndex, sourceLine, sourceColumn];
					// this mapping only maps the first line to itself
					const decodedMap = [[[0], [0, 0, 0, 0], [1]]];
					return {
						code: 'export default this',
						map: { mappings: encode(decodedMap), sources: [] }
					};
				}
			}
		]
	},
	warnings: [
		{
			code: 'THIS_IS_UNDEFINED',
			frame: `
1: console.log('original source');
   ^`,
			id: ID_MAIN,
			loc: {
				column: 0,
				file: ID_MAIN,
				line: 1
			},
			message:
				"The 'this' keyword is equivalent to 'undefined' at the top level of an ES module, and has been rewritten",
			pos: 15,
			url: 'https://rollupjs.org/troubleshooting/#error-this-is-undefined'
		}
	]
});
