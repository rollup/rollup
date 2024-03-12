const path = require('node:path');
const ID_MAIN = path.join(__dirname, 'main.js');

module.exports = defineTest({
	description: 'handles when a sourcemap cannot be resolved in a warning',
	options: {
		plugins: [
			{
				name: 'test-plugin',
				transform() {
					return { code: 'export default this', map: { mappings: '' } };
				}
			}
		]
	},
	warnings: [
		{
			cause: {
				message: "Can't resolve original location of error."
			},
			code: 'SOURCEMAP_ERROR',
			id: ID_MAIN,
			loc: {
				column: 15,
				file: ID_MAIN,
				line: 1
			},
			message:
				"main.js (1:15): Error when using sourcemap for reporting an error: Can't resolve original location of error.",
			pos: 15
		},
		{
			code: 'THIS_IS_UNDEFINED',
			frame: `
			1: export default this
			                  ^
		`,
			id: ID_MAIN,
			loc: {
				column: 15,
				file: ID_MAIN,
				line: 1
			},
			message:
				"main.js (1:15): The 'this' keyword is equivalent to 'undefined' at the top level of an ES module, and has been rewritten",
			pos: 15,
			url: 'https://rollupjs.org/troubleshooting/#error-this-is-undefined'
		}
	]
});
