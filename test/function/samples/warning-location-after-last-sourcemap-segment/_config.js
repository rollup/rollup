const path = require('node:path');
const { encode } = require('@jridgewell/sourcemap-codec');
const ID_MAIN = path.join(__dirname, 'main.js');

module.exports = defineTest({
	description:
		'uses the last sourcemap segment of a line for a location after the start of that segment',
	options: {
		plugins: [
			{
				name: 'test-plugin',
				transform() {
					// each entry of each line consist of
					// [generatedColumn, sourceIndex, sourceLine, sourceColumn];
					// the generated code is on one line, "export" maps to the first
					// line and "default this" to the second line of the original
					const decodedMap = [
						[
							[0, 0, 0, 0],
							[7, 0, 1, 7]
						]
					];
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
1: console.log('first line');
2: export default this;
          ^`,
			id: ID_MAIN,
			loc: {
				column: 7,
				file: ID_MAIN,
				line: 2
			},
			message:
				"main.js (2:7): The 'this' keyword is equivalent to 'undefined' at the top level of an ES module, and has been rewritten",
			pos: 15,
			url: 'https://rollupjs.org/troubleshooting/#error-this-is-undefined'
		}
	]
});
